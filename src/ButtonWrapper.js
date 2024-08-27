// src/components/ButtonWrapper.js
import React from 'react';
import { Link } from 'react-router-dom';
import './ButtonWrapper.css';

const ButtonWrapper = () => {
    return (
        <div className="button-wrapper">
            <div className="button-container">
                <Link to="/multiplayer">
                    <button className="btn yellow">Play Multiplayer</button>
                </Link>
                <Link to="/host-room">
                    <button className="btn green">Host Room</button>
                </Link>
                <Link to="/join-room">
                    <button className="btn orange">Join Room</button>
                </Link>
            </div>
        </div>
    );
};

export default ButtonWrapper;
