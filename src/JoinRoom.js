import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomContext } from './RoomContext';
import './JoinRoom.css';

const JoinRoom = () => {
    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { isRoomCodeValid, addPlayerToRoom, getRoom } = useRoomContext();

    const handleJoinRoom = () => {
        if (!playerName.trim()) {
            setError('Please enter your name.');
            return;
        }

        if (roomCode.length === 6 && isRoomCodeValid(roomCode.toUpperCase())) {
            const room = getRoom(roomCode.toUpperCase());
            if (room.players.length < room.maxPlayers) {
                addPlayerToRoom(roomCode.toUpperCase(), playerName.trim());
                setLoading(true);

                // Check if the game has started
                const checkGameStarted = () => {
                    const updatedRoom = getRoom(roomCode.toUpperCase());
                    if (updatedRoom.gameStarted) {
                        setLoading(false);
                        navigate('/play');
                    }
                };

                // Initial check
                checkGameStarted();

                // Listen for changes in localStorage
                const handleStorageChange = (event) => {
                    if (event.key === 'rooms') {
                        const updatedRoom = JSON.parse(event.newValue)[roomCode.toUpperCase()];
                        if (updatedRoom && updatedRoom.gameStarted) {
                            setLoading(false);
                            navigate('/play');
                        }
                    }
                };

                window.addEventListener('storage', handleStorageChange);

                return () => {
                    window.removeEventListener('storage', handleStorageChange);
                };
            } else {
                setError('Room is full. Please join another room.');
            }
        } else {
            setError('Invalid Room Code. Please enter a 6-character code.');
        }
    };

    return (
        <div className="join-room">
            <div className="join-room-container">
                <h1>Join a Room</h1>
                <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter Your Name"
                    className="player-name-input"
                />
                <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Enter Room Code"
                    className="room-code-input"
                />
                <button onClick={handleJoinRoom} className="join-button">Join</button>
                {error && <div className="error">{error}</div>}
                {loading && <div className="loading">Waiting for the game to start...</div>}
            </div>
        </div>
    );
};

export default JoinRoom;
