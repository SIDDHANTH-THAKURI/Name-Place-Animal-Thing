import React, { useState, useEffect } from 'react';
import './SoundButton.css';
import sound from './imgs/sound.png';
import mute from './imgs/mute.png';
import mainmusic from './music/NPATMusic.mp3';  // Directly import the audio file

const SoundButton = () => {
    const [isMuted, setIsMuted] = useState(false);
    const [music] = useState(new Audio(mainmusic));  // Create an Audio object

    useEffect(() => {
        music.loop = true; // Set the music to loop
        music.preload = 'auto'; // Preload the audio

        // Function to start music
        const startMusic = () => {
            console.log('Attempting to start music...');
            if (!isMuted) {
                music.play().catch((error) => {
                    console.error('Auto-play was prevented:', error);
                });
            }
        };

        // Try to start the music immediately
        startMusic();

        // Add event listener for user interaction if needed
        const handleUserInteraction = () => {
            console.log('User interaction detected. Starting music...');
            startMusic();
            window.removeEventListener('click', handleUserInteraction);
        };

        window.addEventListener('click', handleUserInteraction);

        return () => {
            music.pause(); // Pause the music when the component unmounts
            window.removeEventListener('click', handleUserInteraction);
        };
    }, [music, isMuted]);

    // Effect to handle play/pause based on `isMuted` state
    useEffect(() => {
        console.log(`Music ${isMuted ? 'paused' : 'playing'}`);
        if (isMuted) {
            music.pause();
        } else {
            music.play().catch((error) => {
                console.error("Auto-play was prevented: ", error);
            });
        }
    }, [isMuted, music]);

    const toggleSound = () => {
        console.log('Toggling sound...');
        setIsMuted(!isMuted);
    };

    return (
        <div className="sound-button" onClick={toggleSound}>
            <img src={isMuted ? mute : sound} alt="Sound Button" id="sound-toggle" />
        </div>
    );
};

export default SoundButton;
