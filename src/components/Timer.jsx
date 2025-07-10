import React, { useState, useEffect } from 'react';
import './Timer.css';

const Timer = ({ duration, onTimeUp, isActive, onTick }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    let interval;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1;
          if (onTick) onTick(newTime);
          if (newTime === 0) {
            onTimeUp();
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeUp, onTick]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = ((duration - timeLeft) / duration) * 100;
  
  const getTimerColor = () => {
    if (timeLeft <= 5) return '#ff4757';
    if (timeLeft <= 10) return '#ff6b35';
    return '#2ed573';
  };

  return (
    <div className="timer-container">
      <div className="timer-circle" style={{ '--timer-color': getTimerColor() }}>
        <div className="timer-icon">⏰</div>
        <svg className="timer-svg" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={getTimerColor()} />
              <stop offset="100%" stopColor={getTimerColor() + '80'} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (percentage / 100)}`}
            transform="rotate(-90 50 50)"
            className="timer-progress"
            filter="url(#glow)"
          />
        </svg>
        <div className="timer-text">
          <span className="timer-time">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="timer-label">Time Left</span>
        </div>
      </div>
    </div>
  );
};

export default Timer;
