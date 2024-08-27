import React from 'react';
import { useNavigate } from 'react-router-dom';
//import './Play.css'; // Add styles for the play page if needed

const Play = () => {
    const navigate = useNavigate();

    return (
        <div className="play-container">
            <h1>Game Started!</h1>
            <p>Welcome to the game. Enjoy playing!</p>
            {/* Add game-related components and logic here */}
            <button onClick={() => navigate('/')} className="back-button">Back to Home</button>
        </div>
    );
};

export default Play;
