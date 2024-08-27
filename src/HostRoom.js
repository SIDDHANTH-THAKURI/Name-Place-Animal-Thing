import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomContext } from './RoomContext';
import './HostRoom.css';

const HostRoom = () => {
    const [roomCode, setRoomCode] = useState('');
    const [players, setPlayers] = useState([]);
    const [playerName, setPlayerName] = useState(''); // State for the host's name
    const navigate = useNavigate();
    const { createRoom, getRoom, startGame, addPlayerToRoom } = useRoomContext();

    const generateRoomCode = () => {
        if (!playerName) {
            alert("Please enter your name before generating a room code.");
            return;
        }
        const code = Math.random().toString(36).substr(2, 6).toUpperCase();
        createRoom(code);
        setRoomCode(code);
        addPlayerToRoom(code, playerName); // Add host to the room as the first player
    };

    const handleStartGame = () => {
        if (players.length > 1) {
            startGame(roomCode);
            navigate('/play'); // Navigate to the Play page for the host
        } else {
            alert("You need at least 2 players to start the game.");
        }
    };

    useEffect(() => {
        if (roomCode) {
            const room = getRoom(roomCode);
            if (room) {
                setPlayers(room.players);
            }
        }
    }, [roomCode, getRoom]);

    return (
        <div className="host-room">
            <div className="host-room-container">
                <h1>Host a Room</h1>
                {!roomCode && ( // Conditionally render input and button
                    <>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Enter your name"
                        />
                        <button onClick={generateRoomCode}>Generate Room Code</button>
                    </>
                )}
                {roomCode && (
                    <div className="room-code">
                        <h2>Your Room Code:</h2>
                        <p>{roomCode}</p>
                        <div className="player-list">
                            <h3>Players:</h3>
                            {players.length > 0 ? (
                                <ul>
                                    {players.map((player, index) => (
                                        <li key={index}>{player.name}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No players yet.</p>
                            )}
                        </div>
                        {!getRoom(roomCode)?.gameStarted && (
                            <button onClick={handleStartGame} className="start-game-button">Start Game</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HostRoom;
