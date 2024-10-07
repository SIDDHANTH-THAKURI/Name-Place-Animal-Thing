import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import socket from './socket';
import './ResultsPage.css'; // Make sure to create and import a CSS file for styling

const Results = () => {
  const [playersData, setPlayersData] = useState({});
  const [scores, setScores] = useState({});
  const [winner, setWinner] = useState('');
  const { state } = useLocation();
  const { roomCode, playerName } = state;
  const navigate = useNavigate();

  // Fetch the results from the server when the component mounts
  useEffect(() => {
    socket.emit('getResults', { roomCode });

    socket.on('resultsData', (data) => {
      setPlayersData(data.submissions);
      setScores(data.scores);

      // Find the winner by comparing the total scores
      const maxScore = Math.max(...Object.values(data.scores).map(scoreObj => scoreObj.totalScore));
      const winners = Object.keys(data.scores).filter(
        (player) => data.scores[player].totalScore === maxScore
      );
      setWinner(winners.join(', ')); // Handle ties
    });

    return () => {
      socket.off('resultsData');
    };
  }, [roomCode]);

  return (
    <div className="results-page">
      <h1>Results</h1>
      {Object.keys(playersData).length > 0 ? (
        <div className="players-results">
          {Object.keys(playersData).map((playerName, index) => (
            <div key={index} className="player-result-card">
              <h3>
                {playerName} (Total Score: {scores[playerName].totalScore} points)
              </h3>
              <div className="results-entry">
                <div className="category">
                  <span className="category-name">Name:</span>
                  <span className="category-word">{playersData[playerName].name}</span>
                  <span className="category-score">(Score: {scores[playerName].categoryScores.name})</span>
                </div>
                <div className="category">
                  <span className="category-name">Place:</span>
                  <span className="category-word">{playersData[playerName].place}</span>
                  <span className="category-score">(Score: {scores[playerName].categoryScores.place})</span>
                </div>
                <div className="category">
                  <span className="category-name">Animal:</span>
                  <span className="category-word">{playersData[playerName].animal}</span>
                  <span className="category-score">(Score: {scores[playerName].categoryScores.animal})</span>
                </div>
                <div className="category">
                  <span className="category-name">Thing:</span>
                  <span className="category-word">{playersData[playerName].thing}</span>
                  <span className="category-score">(Score: {scores[playerName].categoryScores.thing})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading results...</p>
      )}
      <h2>🏆 Winner of this round: {winner} 🏆</h2>
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
};

export default Results;
