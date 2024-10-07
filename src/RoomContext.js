import React, { createContext, useState, useContext, useEffect } from 'react';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
    const [rooms, setRooms] = useState({});

    // Load rooms from localStorage on component mount
    useEffect(() => {
        const savedRooms = JSON.parse(localStorage.getItem('rooms')) || {};
        setRooms(savedRooms);
    }, []);

    // Persist rooms to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('rooms', JSON.stringify(rooms));
    }, [rooms]);

    // Function to create a new room
    const createRoom = (roomCode) => {
        const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Generate random letter
        setRooms((prevRooms) => ({
            ...prevRooms,
            [roomCode]: {
                players: [],
                maxPlayers: 4,
                gameStarted: false,
                letter: randomLetter,
                inputs: {},
            },
        }));
    };

    // Function to add a player to a room
    const addPlayerToRoom = (roomCode, playerName) => {
        setRooms((prevRooms) => {
            const room = prevRooms[roomCode];
            if (room && room.players.length < room.maxPlayers) {
                return {
                    ...prevRooms,
                    [roomCode]: {
                        ...room,
                        players: [...room.players, { name: playerName }],
                    },
                };
            }
            return prevRooms;
        });
    };

    // Function to start the game
    const startGame = (roomCode) => {
        setRooms((prevRooms) => ({
            ...prevRooms,
            [roomCode]: {
                ...prevRooms[roomCode],
                gameStarted: true,
            },
        }));
    };

    const getRoom = (roomCode) => rooms[roomCode];
    const isRoomCodeValid = (roomCode) => rooms.hasOwnProperty(roomCode);

    return (
        <RoomContext.Provider value={{ createRoom, addPlayerToRoom, startGame, getRoom, isRoomCodeValid }}>
            {children}
        </RoomContext.Provider>
    );
};

export const useRoomContext = () => useContext(RoomContext);
