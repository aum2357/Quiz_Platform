import React, { useState, useEffect } from 'react';
import './Question.css';

const Question = ({ 
  question, 
  currentQuestionIndex, 
  totalQuestions, 
  onAnswer, 
  isAnswered, 
  selectedAnswer,
  showCorrectAnswer 
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [question.id]);

  const handleOptionClick = (optionIndex) => {
    if (isAnswered) return;
    
    setSelectedOption(optionIndex);
    setTimeout(() => {
      onAnswer(optionIndex);
    }, 300);
  };

  const getOptionClass = (optionIndex) => {
    let baseClass = 'option';
    
    if (showCorrectAnswer) {
      if (optionIndex === question.correctAnswer) {
        baseClass += ' correct';
      } else if (optionIndex === selectedAnswer && optionIndex !== question.correctAnswer) {
        baseClass += ' incorrect';
      }
    } else if (selectedOption === optionIndex) {
      baseClass += ' selected';
    }
    
    if (isAnswered) {
      baseClass += ' disabled';
    }
    
    return baseClass;
  };

  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case 'Easy': return '#2ed573';
      case 'Medium': return '#ff9f43';
      case 'Hard': return '#ff4757';
      default: return '#3742fa';
    }
  };

  const getCategoryIcon = () => {
    switch (question.category) {
      case 'Geography': return '🌍';
      case 'Science': return '🔬';
      case 'Biology': return '🧬';
      case 'History': return '📜';
      case 'Chemistry': return '⚗️';
      case 'Art': return '🎨';
      case 'Mathematics': return '📐';
      case 'Technology': return '💻';
      case 'Physics': return '⚛️';
      case 'Sports': return '⚽';
      case 'Literature': return '📖';
      default: return '📚';
    }
  };

  return (
    <div className={`question-container ${isAnimating ? 'slide-in' : ''}`}>
      <div className="question-header">
        <div className="question-progress">
          <span className="question-number">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="question-meta">
          <span className="category">
            <span className="category-icon">{getCategoryIcon()}</span>
            {question.category}
          </span>
          <span 
            className="difficulty"
            style={{ backgroundColor: getDifficultyColor() }}
          >
            {question.difficulty}
          </span>
        </div>
      </div>
      
      <div className="question-content">
        <h2 className="question-text">{question.question}</h2>
        
        <div className="options-grid">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={getOptionClass(index)}
              onClick={() => handleOptionClick(index)}
              disabled={isAnswered}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="option-text">{option}</span>
              {showCorrectAnswer && index === question.correctAnswer && (
                <span className="correct-icon">✓</span>
              )}
              {showCorrectAnswer && index === selectedAnswer && index !== question.correctAnswer && (
                <span className="incorrect-icon">✗</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Question;
