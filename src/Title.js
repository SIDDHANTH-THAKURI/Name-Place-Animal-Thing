// src/components/Title.js
import React from 'react';
import './Title.css';
import title from './imgs/TitleGif.gif';

const Title = () => {
    return (
        <div className="title-container">
            <img src={title} className="title-gif" alt="Name Place Animal Thing" />
        </div>
    );
};

export default Title;
