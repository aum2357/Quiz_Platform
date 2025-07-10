import React from 'react';
import './ScoreDisplay.css';

const ScoreDisplay = ({ score, totalQuestions, percentage, isVisible = true }) => {
  const getScoreColor = () => {
    if (percentage >= 80) return '#2ed573';
    if (percentage >= 60) return '#ff9f43';
    return '#ff4757';
  };

  const getScoreLabel = () => {
    if (percentage >= 90) return 'Excellent!';
    if (percentage >= 80) return 'Great Job!';
    if (percentage >= 70) return 'Good Work!';
    if (percentage >= 60) return 'Not Bad!';
    return 'Keep Trying!';
  };

  const getScoreIcon = () => {
    if (percentage >= 80) return '🏆';
    if (percentage >= 60) return '⭐';
    return '💪';
  };

  if (!isVisible) return null;

  return (
    <div className="score-display">
      <div className="score-card" style={{ '--score-color': getScoreColor() }}>
        <div className="score-icon">{getScoreIcon()}</div>
        <div className="score-main">
          <span className="score-number">{score}</span>
          <span className="score-divider">/</span>
          <span className="score-total">{totalQuestions}</span>
        </div>
        <div className="score-percentage">{percentage.toFixed(1)}%</div>
        <div className="score-label">{getScoreLabel()}</div>
        <div className="score-progress-bar">
          <div 
            className="score-progress-fill"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: getScoreColor()
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;
