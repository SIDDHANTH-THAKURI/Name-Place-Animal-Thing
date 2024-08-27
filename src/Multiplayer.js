// src/Multiplayer.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Multiplayer.css';

const Multiplayer = () => {
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate('/');
    };

    return (
        <div className="multiplayer">
            <button className="back-button" onClick={handleBackClick}>
                &larr; Back
            </button>
            <h1>Multiplayer is Under Construction!</h1>
        </div>
    );
};

export default Multiplayer;
