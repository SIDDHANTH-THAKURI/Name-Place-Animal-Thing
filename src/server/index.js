const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');

const mongoose = require('mongoose');

const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


// MongoDB setup
const url = 'mongodb://localhost:27017'; // Local MongoDB URL
const dbName = 'gameDB'; // The name of your database

let db, roomsCollection;

// Connect to MongoDB
async function connectDB() {
  const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');
  db = client.db(dbName);
  roomsCollection = db.collection('rooms');
}
connectDB(); // Connect to the database

// Express server setup
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for development purposes
  },
});

// Function to calculate scores
const calculateScores = async (roomCode, letter) => {
  const room = await roomsCollection.findOne({ roomCode });
  const submissions = room.playerSubmissions || {};
  const playerScores = {};

  // Collect all words for comparison (for Name, Place, Animal, Thing)
  const categories = ['name', 'place', 'animal', 'thing'];
  const categoryWords = {};

  categories.forEach(category => {
    categoryWords[category] = Object.values(submissions).map(player => player[category].toLowerCase());
  });

  // For each player, we will store per-category scores and total score
  for (const playerName in submissions) {
    const inputs = submissions[playerName];
    let totalScore = 0;
    const categoryScores = {};

    // For each category, check the validity and assign points
    for (const category of categories) {
      const word = inputs[category].trim().toLowerCase();

      let categoryScore = 0; // Initialize category score
      if (word) {
        const isCorrectLetter = word[0].toUpperCase() === letter;

        // Check if the word starts with the given letter
        if (isCorrectLetter) {
          const wordCount = categoryWords[category].filter(w => w === word).length;
          categoryScore = wordCount > 1 ? 5 : 10; // 5 points if word is repeated, 10 if unique
        } else {
          categoryScore = 0; // No points if the word is wrong letter
        }
      } else {
        categoryScore = 0; // No points if no word is provided
      }

      categoryScores[category] = categoryScore;
      totalScore += categoryScore;
    }

    playerScores[playerName] = {
      totalScore: totalScore,
      categoryScores: categoryScores
    };
  }

  return playerScores;
};

// Timer variables
let timerInterval = {};
let timeLeft = {};

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Create a new room
  socket.on('createRoom', async ({ roomCode, playerName }) => {
    await roomsCollection.insertOne({
      roomCode,
      players: [{ name: playerName }],
      gameStarted: false,
      playerSubmissions: {}, // Initialize as an object
    });
    socket.join(roomCode); // The host joins the room
    console.log(`${playerName} created room ${roomCode}`);
  });

  // Join an existing room
  socket.on('joinRoom', async ({ roomCode, playerName }) => {
    const room = await roomsCollection.findOne({ roomCode });
    if (room && room.players.length < 4) {
      const playerExists = room.players.some(player => player.name === playerName);
      if (playerExists) {
        socket.emit('joinError', 'Player name already taken in this room.');
        return;
      }
      await roomsCollection.updateOne(
        { roomCode },
        { $push: { players: { name: playerName } } }
      );
      socket.join(roomCode); // The player joins the room
      console.log(`${playerName} joined room ${roomCode}`);
      io.to(roomCode).emit('playerJoined', { roomCode, playerName }); // Notify everyone in the room
    } else {
      socket.emit('joinError', 'Room is full or does not exist.');
    }
  });

  // Start the game
  socket.on('startGame', async ({ roomCode }) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];

    await roomsCollection.updateOne(
      { roomCode },
      { $set: { gameStarted: true, letter: randomLetter } }
    );

    console.log(`Game started in room ${roomCode} with letter ${randomLetter}`);

    // Broadcast the random letter and start the timer for all players in the room
    io.to(roomCode).emit('gameStarted', { roomCode, letter: randomLetter });

    // Start a synchronized timer
    timeLeft[roomCode] = 30;
    timerInterval[roomCode] = setInterval(async () => {
      if (timeLeft[roomCode] >= 0) {
        io.to(roomCode).emit('timerUpdate', timeLeft[roomCode]); // Send timer update to all clients
        timeLeft[roomCode]--;
      } else {
        clearInterval(timerInterval[roomCode]); // Clear the timer

        // Ensure all players' submissions are saved, even if they didn't submit
        const room = await roomsCollection.findOne({ roomCode });
        const totalPlayers = room.players.length;
        const submittedPlayers = Object.keys(room.playerSubmissions || {});
        const missingPlayers = room.players.filter(p => !submittedPlayers.includes(p.name));

        for (let missingPlayer of missingPlayers) {
          const updateField = `playerSubmissions.${missingPlayer.name}`;
          await roomsCollection.updateOne(
            { roomCode },
            { $set: { [updateField]: { name: '', place: '', animal: '', thing: '' } } }
          );
        }

        io.to(roomCode).emit('goToResults'); // Navigate all players to the results page
      }
    }, 1000);
  });

  // Handle clients requesting the current game state
  socket.on('getGameState', async ({ roomCode }) => {
    const room = await roomsCollection.findOne({ roomCode });
    if (room && room.gameStarted) {
      socket.emit('gameState', { letter: room.letter, timeLeft: timeLeft[roomCode] || 30 });
    } else {
      socket.emit('gameNotStarted');
    }
  });

  // Handle submission of answers
  socket.on('submitAnswers', async ({ roomCode, playerName, inputs }, callback) => {
    // Save the player's submission to the room in MongoDB
    const updateField = `playerSubmissions.${playerName}`;
    await roomsCollection.updateOne(
      { roomCode },
      { $set: { [updateField]: inputs } }
    );

    // Acknowledge the submission
    if (callback) callback();

    // Check if all players have submitted
    const room = await roomsCollection.findOne({ roomCode });
    const totalPlayers = room.players.length;
    const submissions = Object.keys(room.playerSubmissions).length;

    if (submissions >= totalPlayers) {
      // All players have submitted
      if (timerInterval[roomCode]) {
        clearInterval(timerInterval[roomCode]); // Stop the timer
      }
      io.to(roomCode).emit('goToResults'); // Broadcast to all players to go to results
    }
  });

  // Emit the results along with the scores
  socket.on('getResults', async ({ roomCode }) => {
    const room = await roomsCollection.findOne({ roomCode });
    const letter = room.letter;

    const playerScores = await calculateScores(roomCode, letter);

    // Send the scores and player submissions back to the clients
    io.to(socket.id).emit('resultsData', {
      submissions: room.playerSubmissions,
      scores: playerScores,
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server on port 3001
server.listen(3001, () => {
  console.log('Socket.IO server is running on port 3001');
});
