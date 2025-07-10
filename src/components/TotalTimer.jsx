import React from 'react';
import './TotalTimer.css';

const TotalTimer = ({ timeLeft, isActive, totalTime = 600 }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = ((totalTime - timeLeft) / totalTime) * 100;
  
  const getTimerColor = () => {
    if (timeLeft <= 60) return '#ff4757'; // Red when less than 1 minute
    if (timeLeft <= 180) return '#ff6b35'; // Orange when less than 3 minutes
    return '#2ed573'; // Green otherwise
  };

  const getTimerIcon = () => {
    if (timeLeft <= 60) return '⚠️';
    if (timeLeft <= 180) return '⏰';
    return '🕐';
  };

  return (
    <div className="total-timer-sidebar">
      <div className="timer-header">
        <div className="timer-icon-3d">{getTimerIcon()}</div>
        <h3 className="timer-title">Quiz Timer</h3>
      </div>
      
      <div className="timer-display">
        <div className="time-circle" style={{ '--timer-color': getTimerColor() }}>
          <svg className="timer-svg" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="totalTimerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={getTimerColor()} />
                <stop offset="100%" stopColor={getTimerColor() + '60'} />
              </linearGradient>
              <filter id="totalGlow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
            />
            
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="url(#totalTimerGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - percentage / 100)}`}
              transform="rotate(-90 60 60)"
              className="timer-progress-ring"
              filter="url(#totalGlow)"
            />
          </svg>
          
          <div className="time-text">
            <span className="time-value">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="time-label">Remaining</span>
          </div>
        </div>
      </div>
      
      <div className="timer-warning">
        {timeLeft <= 60 && (
          <div className="warning-message urgent">
            ⚠️ Less than 1 minute left!
          </div>
        )}
        {timeLeft > 60 && timeLeft <= 180 && (
          <div className="warning-message moderate">
            ⏰ Less than 3 minutes left
          </div>
        )}
      </div>
    </div>
  );
};

export default TotalTimer;
