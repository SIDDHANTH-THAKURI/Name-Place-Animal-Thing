import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from './socket';
import './JoinRoom.css';

const JoinRoom = () => {
    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [error, setError] = useState('');
    const [isWaiting, setIsWaiting] = useState(false);
    const navigate = useNavigate();

    const handleJoinRoom = () => {
        setError('');
        const normalizedRoomCode = roomCode.trim().toUpperCase();
        if (!playerName.trim()) {
            setError('Please enter your name.');
            return;
        }

        socket.emit('joinRoom', { roomCode: normalizedRoomCode, playerName });
        setIsWaiting(true);
    };

    // Handle any errors like room being full or not existing
    useEffect(() => {
        socket.on('joinError', (errorMessage) => {
            setError(errorMessage);
            setIsWaiting(false);
        });

        const handleGameStarted = (data) => {
            if (data.roomCode === roomCode) {
                navigate('/play', { state: { roomCode, playerName } });
            }
        };

        socket.on('gameStarted', handleGameStarted);

        return () => {
            socket.off('joinError');
            socket.off('gameStarted', handleGameStarted);
        };
    }, [roomCode, playerName, navigate]);

    return (
        <div className="join-room">
            <button className="back-button" onClick={() => navigate('/')}>
                &larr; Back
            </button>
            <div className="join-room-container">
                <h1>Join a Room</h1>
                {!isWaiting && (
                    <>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Enter your name"
                            className="player-name-input"
                        />
                        <input
                            type="text"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            placeholder="Enter room code"
                            className="room-code-input"
                        />
                        <button onClick={handleJoinRoom} className="join-button">
                            Join
                        </button>
                    </>
                )}
                {isWaiting && <div className="waiting-message">Waiting for the host to start the game...</div>}
                {error && <div className="error">{error}</div>}
            </div>
        </div>
    );
};

export default JoinRoom;
