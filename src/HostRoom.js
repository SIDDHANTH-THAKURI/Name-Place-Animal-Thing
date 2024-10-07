import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from './socket';
import './HostRoom.css';

const HostRoom = () => {
    const [roomCode, setRoomCode] = useState('');
    const [players, setPlayers] = useState([]);
    const [playerName, setPlayerName] = useState('');
    const navigate = useNavigate();

    // Generate a unique room code and add the host as the first player
    const generateRoomCode = () => {
        if (!playerName.trim()) {
            alert('Please enter your name.');
            return;
        }

        const code = Math.random().toString(36).substr(2, 6).toUpperCase();
        setRoomCode(code);

        socket.emit('createRoom', { roomCode: code, playerName });
        setPlayers([{ name: playerName }]); // Add host as the first player
    };

    // Start the game for all players
    const handleStartGame = () => {
        if (players.length > 1) {
            socket.emit('startGame', { roomCode });
            navigate('/play', { state: { roomCode, playerName } });
        } else {
            alert('At least 2 players are required to start the game.');
        }
    };

    // Listen for updates when new players join
    useEffect(() => {
        socket.on('playerJoined', (data) => {
            if (data.roomCode === roomCode) {
                setPlayers((prevPlayers) => [...prevPlayers, { name: data.playerName }]);
            }
        });

        return () => {
            socket.off('playerJoined');
        };
    }, [roomCode]);

    return (
        <div className="host-room">
            <button className="back-button" onClick={() => navigate('/')}>
                &larr; Back
            </button>
            <div className="host-room-container">
                <h1>Host a Room</h1>
                {!roomCode && (
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
                        <h2>Room Code: {roomCode}</h2>
                        <div className="player-list">
                            <h3>Players</h3>
                            <ul>
                                {players.map((player, index) => (
                                    <li key={index}>{player.name}</li>
                                ))}
                            </ul>
                        </div>
                        <button onClick={handleStartGame} className="start-game-button">
                            Start Game
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HostRoom;
