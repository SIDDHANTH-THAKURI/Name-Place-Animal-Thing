import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomContext } from './RoomContext';
import './HostRoom.css';

const HostRoom = () => {
    const [roomCode, setRoomCode] = useState('');
    const [players, setPlayers] = useState([]);
    const navigate = useNavigate();
    const { createRoom, getRoom, startGame } = useRoomContext();

    const generateRoomCode = () => {
        const code = Math.random().toString(36).substr(2, 6).toUpperCase();
        createRoom(code);
        setRoomCode(code);
    };

    const handleStartGame = () => {
        startGame(roomCode);
        navigate('/play'); // Navigate to the Play page for the host
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
                <button onClick={generateRoomCode}>Generate Room Code</button>
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
