import React, { useState } from 'react';
import './SoundButton.css';
import sound from './imgs/sound.png';
import mute from './imgs/mute.png';
import mainmusic from './music/NPATMusic.mp3';  // Directly import the audio file

const SoundButton = () => {
    const [isMuted, setIsMuted] = useState(false);
    const [music] = useState(new Audio(mainmusic));  // Use the imported audio file directly

    const toggleSound = () => {
        if (isMuted) {
            music.play();
        } else {
            music.pause();
        }
        setIsMuted(!isMuted);
    };

    return (
        <div className="sound-button" onClick={toggleSound}>
            <img src={isMuted ? mute : sound} alt="Sound Button" id="sound-toggle" />
        </div>
    );
};

export default SoundButton;
