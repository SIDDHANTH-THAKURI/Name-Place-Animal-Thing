import React, { createContext, useState, useContext, useEffect } from 'react';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
    const [rooms, setRooms] = useState({});

    // Initialize rooms from localStorage when the component mounts
    useEffect(() => {
        const savedRooms = JSON.parse(localStorage.getItem('rooms')) || {};
        setRooms(savedRooms);
    }, []);

    // Save rooms to localStorage whenever rooms state changes
    useEffect(() => {
        localStorage.setItem('rooms', JSON.stringify(rooms));
    }, [rooms]);

    // Synchronize state across tabs
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'rooms') {
                setRooms(JSON.parse(event.newValue));
            }
        };
    
        window.addEventListener('storage', handleStorageChange);
    
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Create a new room
    const createRoom = (roomCode) => {
        setRooms((prevRooms) => ({
            ...prevRooms,
            [roomCode]: {
                players: [],
                maxPlayers: 4,
                gameStarted: false
            }
        }));
    };

    // Add a player to a room
    const addPlayerToRoom = (roomCode, playerName) => {
        setRooms((prevRooms) => {
            const room = prevRooms[roomCode];
            if (room && room.players.length < room.maxPlayers) {
                return {
                    ...prevRooms,
                    [roomCode]: {
                        ...room,
                        players: [...room.players, { name: playerName, joined: true }]
                    }
                };
            }
            return prevRooms;
        });
    };

    // Start the game in a room
    const startGame = (roomCode) => {
        setRooms((prevRooms) => ({
            ...prevRooms,
            [roomCode]: {
                ...prevRooms[roomCode],
                gameStarted: true
            }
        }));
    };

    // Get a specific room's data
    const getRoom = (roomCode) => {
        return rooms[roomCode];
    };

    // Check if a room code is valid
    const isRoomCodeValid = (roomCode) => {
        return rooms.hasOwnProperty(roomCode);
    };

    return (
        <RoomContext.Provider value={{ createRoom, addPlayerToRoom, startGame, getRoom, isRoomCodeValid }}>
            {children}
        </RoomContext.Provider>
    );
};

export const useRoomContext = () => {
    return useContext(RoomContext);
};
