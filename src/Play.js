import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import socket from './socket'; // Import the singleton socket instance
import './Play.css';

const Play = () => {
  const [timer, setTimer] = useState(30);
  const [letter, setLetter] = useState('');
  const [inputs, setInputs] = useState({ name: '', place: '', animal: '', thing: '' });
  const [submitted, setSubmitted] = useState(false); // Track if the player has submitted
  const inputsRef = useRef(inputs); // Use a ref to store the latest inputs
  const navigate = useNavigate();
  const { state } = useLocation();
  const { roomCode, playerName } = state;

  // Keep the inputsRef updated with the latest inputs
  useEffect(() => {
    inputsRef.current = inputs;
  }, [inputs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (callback) => {
    if (!submitted) {
      const currentInputs = inputsRef.current;
      // console.log('Submitting inputs:', currentInputs);
      socket.emit('submitAnswers', { roomCode, playerName, inputs: currentInputs }, () => {
        setSubmitted(true);
        if (callback) callback();
      });
    } else {
      if (callback) callback();
    }
  };

  const handleTimerUpdate = (timeLeft) => {
    setTimer(timeLeft);
    if (timeLeft === 0 && !submitted) {
      // console.log('Timer reached zero, submitting inputs:', inputsRef.current);
      handleSubmit(() => {
        navigate('/results', { state: { roomCode, playerName } });
      });
    }
  };

  useEffect(() => {
    // Ensure the socket is in the room
    socket.emit('joinRoom', { roomCode, playerName });

    // When component mounts, request the game state
    socket.emit('getGameState', { roomCode });

    const handleGameState = ({ letter, timeLeft }) => {
      setLetter(letter);
      setTimer(timeLeft);
    };

    const handleGameStarted = ({ letter }) => {
      setLetter(letter);
    };

    const handleGoToResults = () => {
      navigate('/results', { state: { roomCode, playerName } });
    };

    socket.on('gameState', handleGameState);
    socket.on('gameStarted', handleGameStarted);
    socket.on('timerUpdate', handleTimerUpdate);
    socket.on('goToResults', handleGoToResults);

    return () => {
      socket.off('gameState', handleGameState);
      socket.off('gameStarted', handleGameStarted);
      socket.off('timerUpdate', handleTimerUpdate);
      socket.off('goToResults', handleGoToResults);
    };
  }, [navigate, roomCode, playerName, submitted]);

  return (
    <div className="play-page">
      <h1>Letter: {letter}</h1>
      <h2>Time Left: {timer}s</h2>

      <form className="inputs-form">
        <input
          type="text"
          name="name"
          placeholder="Enter a name"
          value={inputs.name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="place"
          placeholder="Enter a place"
          value={inputs.place}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="animal"
          placeholder="Enter an animal"
          value={inputs.animal}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="thing"
          placeholder="Enter a thing"
          value={inputs.thing}
          onChange={handleInputChange}
        />
        {!submitted && (
          <button type="button" onClick={() => handleSubmit()}>
            Submit
          </button>
        )}
        {submitted && <p>Your answers have been submitted. Waiting for others...</p>}
      </form>
    </div>
  );
};

export default Play;
