import React, { useState, useEffect } from 'react';
import { quizQuestions, quizSettings } from '../data/questions';
import { 
  fetchQuizQuestions, 
  categories, 
  enhancedCategories,
  difficulties, 
  QUIZ_CONFIG,
  getAvailableQuestionCount 
} from '../services/quizService';
import Question from './Question';
import TotalTimer from './TotalTimer';
import ScoreDisplay from './ScoreDisplay';
import './Quiz.css';

const Quiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [answerTimes, setAnswerTimes] = useState([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [totalTimeLeft, setTotalTimeLeft] = useState(QUIZ_CONFIG.DEFAULT_TIME_PER_QUESTION * QUIZ_CONFIG.DEFAULT_QUESTIONS);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(QUIZ_CONFIG.DEFAULT_QUESTIONS);
  const [selectedTimePerQuestion, setSelectedTimePerQuestion] = useState(QUIZ_CONFIG.DEFAULT_TIME_PER_QUESTION);
  const [activeQuestions, setActiveQuestions] = useState(quizQuestions);
  const [maxAvailableQuestions, setMaxAvailableQuestions] = useState(QUIZ_CONFIG.DEFAULT_MAX_AVAILABLE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  // Effect to update timer when question count or time per question changes
  useEffect(() => {
    if (!isQuizStarted) {
      setTotalTimeLeft(selectedQuestionCount * selectedTimePerQuestion);
    }
  }, [selectedQuestionCount, selectedTimePerQuestion, isQuizStarted]);

  // Effect to update the maximum available questions when category or difficulty changes
  useEffect(() => {
    const updateAvailableQuestions = async () => {
      setIsLoading(true);
      try {
        const availableCount = await getAvailableQuestionCount(selectedCategory, selectedDifficulty);
        setMaxAvailableQuestions(availableCount);
        
        // If current selection exceeds new max, adjust it
        if (selectedQuestionCount > availableCount) {
          setSelectedQuestionCount(availableCount);
          
          // Update slider visual if needed
          const slider = document.getElementById('questionCount');
          if (slider) {
            const percentage = ((availableCount - QUIZ_CONFIG.MIN_QUESTIONS) / 
              (availableCount - QUIZ_CONFIG.MIN_QUESTIONS)) * 100;
            slider.style.setProperty('--slider-percent', `${Math.min(percentage, 100)}%`);
          }
        }
      } catch (error) {
        console.error("Error getting available questions:", error);
        // Fall back to default max
        setMaxAvailableQuestions(QUIZ_CONFIG.DEFAULT_MAX_AVAILABLE);
      } finally {
        setIsLoading(false);
      }
    };
    
    updateAvailableQuestions();
  }, [selectedCategory, selectedDifficulty]);

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const maxPossibleScore = activeQuestions.length * 100; // Maximum score possible
  const percentage = totalScore && maxPossibleScore ? (totalScore / maxPossibleScore) * 100 : 0;
  
  // Calculate composite accuracy score (combines correctness and time efficiency)
  const calculateCompositeAccuracy = () => {
    if (!showResults || answerTimes.length === 0) return 0;
    
    const correctnessScore = (score / activeQuestions.length) * 100; // Base accuracy percentage
    const totalTimeUsed = answerTimes.reduce((sum, time) => sum + time, 0);
    const expectedTime = activeQuestions.length * selectedTimePerQuestion;
    
    // Time efficiency factor (1.0 = perfect time usage, higher = slower, lower = faster)
    const timeEfficiency = Math.max(0.1, Math.min(2.0, totalTimeUsed / expectedTime));
    
    // Composite accuracy: Weight correctness at 70% and time efficiency at 30%
    // Time efficiency bonus: faster completion gets bonus, slower gets penalty
    const timeBonus = timeEfficiency <= 0.5 ? 10 : // Very fast: +10%
                     timeEfficiency <= 0.75 ? 5 : // Fast: +5%
                     timeEfficiency <= 1.0 ? 0 : // On time: no change
                     timeEfficiency <= 1.25 ? -5 : // Slow: -5%
                     -10; // Very slow: -10%
    
    const compositeAccuracy = Math.max(0, Math.min(100, correctnessScore + timeBonus));
    return compositeAccuracy;
  };

  // Debug logging
  useEffect(() => {
    console.log('Quiz State:', {
      currentQuestionIndex,
      activeQuestions: activeQuestions.length,
      selectedCategory,
      selectedDifficulty,
      currentQuestion: currentQuestion ? {
        id: currentQuestion.id,
        category: currentQuestion.category,
        difficulty: currentQuestion.difficulty,
        question: currentQuestion.question.substring(0, 50) + '...'
      } : null
    });
  }, [currentQuestionIndex, activeQuestions, selectedCategory, selectedDifficulty]);

  useEffect(() => {
    if (isQuizStarted && !isQuizComplete) {
      setIsAnswered(false);
      setShowCorrectAnswer(false);
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, isQuizStarted, isQuizComplete]);

  // Total quiz timer effect
  useEffect(() => {
    let interval;
    
    if (isQuizStarted && !isQuizComplete && totalTimeLeft > 0) {
      interval = setInterval(() => {
        setTotalTimeLeft((time) => {
          const newTime = time - 1;
          if (newTime === 0) {
            handleTimeUp();
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isQuizStarted, isQuizComplete, totalTimeLeft]);

  const calculateTimeBasedScore = (timeUsed) => {
    // Base score for correct answer is 100
    // Time bonus: more points for faster answers (based on selected time per question)
    const baseScore = 100;
    const timeBonus = Math.max(0, (selectedTimePerQuestion - timeUsed) * 1.5);
    return Math.round(baseScore + timeBonus);
  };

  const startQuiz = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting quiz with:', {
        selectedCategory,
        selectedDifficulty,
        selectedQuestionCount
      });
      
      // Fetch quiz questions from the API or local questions based on selected category
      const fetchedQuestions = await fetchQuizQuestions(selectedQuestionCount, selectedCategory, selectedDifficulty);
      
      console.log('Fetched questions:', fetchedQuestions);
      
      if (fetchedQuestions.length === 0) {
        throw new Error("No questions available for the selected criteria");
      }
      
      setActiveQuestions(fetchedQuestions);
      setIsQuizStarted(true);
      setCurrentQuestionIndex(0);
      setScore(0);
      setTotalScore(0);
      setAnswers([]);
      setAnswerTimes([]);
      setIsQuizComplete(false);
      setShowResults(false);
      setStartTime(Date.now());
      setQuestionStartTime(Date.now());
      setTotalTimeLeft(selectedQuestionCount * selectedTimePerQuestion); // Dynamic time based on question count and time per question
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError(`Failed to fetch questions: ${error.message}. Please try different selections or fewer questions.`);
      setIsLoading(false);
    }
  };

  const handleAnswer = (selectedAnswer) => {
    setIsAnswered(true);
    setShowCorrectAnswer(true);
    
    const timeUsed = (Date.now() - questionStartTime) / 1000; // Convert to seconds
    const newAnswers = [...answers, selectedAnswer];
    const newAnswerTimes = [...answerTimes, timeUsed];
    
    setAnswers(newAnswers);
    setAnswerTimes(newAnswerTimes);
    
    if (selectedAnswer === currentQuestion.correctAnswer) {
      const questionScore = calculateTimeBasedScore(timeUsed);
      setScore(score + 1);
      setTotalScore(totalScore + questionScore);
    }
    
    setTimeout(() => {
      if (currentQuestionIndex < activeQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setIsQuizComplete(true);
        setShowResults(true);
      }
    }, 1000); // Reduced from 2000ms to 1000ms
  };

  const handleTimeUp = () => {
    if (!isAnswered) {
      // Auto-submit the quiz when time runs out
      setIsQuizComplete(true);
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setTotalScore(0);
    setAnswers([]);
    setAnswerTimes([]);
    setIsQuizComplete(false);
    setIsQuizStarted(false);
    setShowResults(false);
    setTotalTimeLeft(QUIZ_CONFIG.DEFAULT_TIME_PER_QUESTION * QUIZ_CONFIG.DEFAULT_QUESTIONS);
    setIsAnswered(false);
    setShowCorrectAnswer(false);
    setStartTime(null);
    setQuestionStartTime(null);
    setSelectedQuestionCount(QUIZ_CONFIG.DEFAULT_QUESTIONS);
    setSelectedTimePerQuestion(QUIZ_CONFIG.DEFAULT_TIME_PER_QUESTION);
    setActiveQuestions(quizQuestions);
    setMaxAvailableQuestions(QUIZ_CONFIG.DEFAULT_MAX_AVAILABLE);
    setSelectedCategory(0);
    setSelectedDifficulty(null);
  };

  const getPerformanceMessage = () => {
    const compositeAccuracy = calculateCompositeAccuracy();
    if (compositeAccuracy >= 90) return "Outstanding Performance! You're a true expert! 🏆";
    if (compositeAccuracy >= 80) return "Excellent Work! Your knowledge is impressive! ⭐";
    if (compositeAccuracy >= 70) return "Great Achievement! You have solid understanding! 🎉";
    if (compositeAccuracy >= 60) return "Good Performance! Keep building your knowledge! 📚";
    return "Keep Learning! Every expert was once a beginner! 💪";
  };

  const getGradeAndColor = () => {
    const compositeAccuracy = calculateCompositeAccuracy();
    if (compositeAccuracy >= 90) return { grade: 'A+', color: '#28a745' };
    if (compositeAccuracy >= 85) return { grade: 'A', color: '#28a745' };
    if (compositeAccuracy >= 80) return { grade: 'A-', color: '#20c997' };
    if (compositeAccuracy >= 75) return { grade: 'B+', color: '#20c997' };
    if (compositeAccuracy >= 70) return { grade: 'B', color: '#ffc107' };
    if (compositeAccuracy >= 65) return { grade: 'B-', color: '#ffc107' };
    if (compositeAccuracy >= 60) return { grade: 'C+', color: '#fd7e14' };
    if (compositeAccuracy >= 55) return { grade: 'C', color: '#fd7e14' };
    if (compositeAccuracy >= 50) return { grade: 'C-', color: '#dc3545' };
    return { grade: 'F', color: '#dc3545' };
  };

  const getTotalQuizTime = () => {
    if (!startTime) return 0;
    return Math.round((Date.now() - startTime) / 1000);
  };

  if (!isQuizStarted) {
    return (
      <div className="quiz-container">
        <div className="floating-elements">
          <div className="floating-icon brain">🧠</div>
          <div className="floating-icon lightbulb">💡</div>
          <div className="floating-icon book">📚</div>
          <div className="floating-icon target">🎯</div>
          <div className="floating-icon star">⭐</div>
          <div className="floating-icon trophy">🏆</div>
        </div>
        <div className="welcome-screen">
          <div className="welcome-content">
            <div className="welcome-icon">🎓</div>
            <h1 className="welcome-title">
              🧠 Professional Quiz Assessment
            </h1>
            <p className="welcome-description">
              Challenge yourself with our comprehensive knowledge assessment. Test your expertise across multiple domains and earn a professional grade based on both accuracy and speed.
            </p>
            <div className="quiz-info">
              <div className="info-item">
                <span className="info-icon">📊</span>
                <span className="info-text">{selectedQuestionCount} Selected Questions</span>
              </div>
              <div className="info-item">
                <span className="info-icon">⏱️</span>
                <span className="info-text">{Math.ceil((selectedQuestionCount * selectedTimePerQuestion) / 60)} Minutes Total</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🎯</span>
                <span className="info-text">Time-Based Scoring</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🏆</span>
                <span className="info-text">Professional Grading</span>
              </div>
            </div>
            
            <div className="question-selector">
              <h4>🎮 Customize Your Quiz Experience</h4>
              <p>Choose how many questions you'd like to answer, select a category and difficulty:</p>
              <div className="selector-container">
                <div className="selector-input">
                  <label htmlFor="questionCount">Number of Questions:</label>
                  <div className="slider-container">
                    <input
                      type="range"
                      id="questionCount"
                      min={QUIZ_CONFIG.MIN_QUESTIONS}
                      max={maxAvailableQuestions}
                      value={selectedQuestionCount}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setSelectedQuestionCount(value);
                        // Update CSS custom property for slider styling
                        const percentage = ((value - QUIZ_CONFIG.MIN_QUESTIONS) / 
                          (maxAvailableQuestions - QUIZ_CONFIG.MIN_QUESTIONS)) * 100;
                        e.target.style.setProperty('--slider-percent', `${percentage}%`);
                      }}
                      onInput={(e) => {
                        // Real-time visual feedback
                        const value = parseInt(e.target.value);
                        const percentage = ((value - QUIZ_CONFIG.MIN_QUESTIONS) / 
                          (maxAvailableQuestions - QUIZ_CONFIG.MIN_QUESTIONS)) * 100;
                        e.target.style.setProperty('--slider-percent', `${percentage}%`);
                      }}
                      className="question-slider"
                      style={{
                        '--slider-percent': `${((selectedQuestionCount - QUIZ_CONFIG.MIN_QUESTIONS) / (maxAvailableQuestions - QUIZ_CONFIG.MIN_QUESTIONS)) * 100}%`
                      }}
                    />
                    <div className="slider-marks">
                      {[QUIZ_CONFIG.MIN_QUESTIONS, Math.round((maxAvailableQuestions + QUIZ_CONFIG.MIN_QUESTIONS) / 2), maxAvailableQuestions]
                        .filter((val, idx, arr) => arr.indexOf(val) === idx).map(mark => (
                        <div 
                          key={mark} 
                          className={`slider-mark ${selectedQuestionCount === mark ? 'active' : ''}`}
                          style={{
                            left: `${((mark - QUIZ_CONFIG.MIN_QUESTIONS) / 
                              (maxAvailableQuestions - QUIZ_CONFIG.MIN_QUESTIONS)) * 100}%`
                          }}
                        >
                          <span className="mark-label">{mark}</span>
                        </div>
                      ))}
                    </div>
                    <div 
                      className="slider-tooltip" 
                      style={{
                        left: `${((selectedQuestionCount - QUIZ_CONFIG.MIN_QUESTIONS) / 
                          (maxAvailableQuestions - QUIZ_CONFIG.MIN_QUESTIONS)) * 100}%`
                      }}
                    >
                      <span className="tooltip-value">{selectedQuestionCount}</span>
                      <span className="tooltip-arrow"></span>
                    </div>
                  </div>
                  <div className="selector-display">
                    <span className="selected-count">{selectedQuestionCount}</span>
                    <span className="total-count">/ {maxAvailableQuestions} available</span>
                    {isLoading && <span className="loading-dot-pulse"></span>}
                  </div>
                  
                  <div className="time-selector">
                    <label htmlFor="timePerQuestion">Time per Question</label>
                    <div className="time-range-info">
                      <span className="range-label fast">
                        ⚡ Fast: {QUIZ_CONFIG.MIN_TIME_PER_QUESTION}s
                      </span>
                      <span className="range-label normal">
                        🎯 Normal: {QUIZ_CONFIG.DEFAULT_TIME_PER_QUESTION}s
                      </span>
                      <span className="range-label slow">
                        🐌 Relaxed: {QUIZ_CONFIG.MAX_TIME_PER_QUESTION}s
                      </span>
                    </div>
                    <div className="slider-container">
                      <input
                        type="range"
                        id="timePerQuestion"
                        min={QUIZ_CONFIG.MIN_TIME_PER_QUESTION}
                        max={QUIZ_CONFIG.MAX_TIME_PER_QUESTION}
                        step={QUIZ_CONFIG.TIME_STEP}
                        value={selectedTimePerQuestion}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setSelectedTimePerQuestion(value);
                          // Update CSS custom property for slider styling
                          const percentage = ((value - QUIZ_CONFIG.MIN_TIME_PER_QUESTION) / 
                            (QUIZ_CONFIG.MAX_TIME_PER_QUESTION - QUIZ_CONFIG.MIN_TIME_PER_QUESTION)) * 100;
                          e.target.style.setProperty('--slider-percent', `${percentage}%`);
                        }}
                        onInput={(e) => {
                          // Real-time visual feedback
                          const value = parseInt(e.target.value);
                          const percentage = ((value - QUIZ_CONFIG.MIN_TIME_PER_QUESTION) / 
                            (QUIZ_CONFIG.MAX_TIME_PER_QUESTION - QUIZ_CONFIG.MIN_TIME_PER_QUESTION)) * 100;
                          e.target.style.setProperty('--slider-percent', `${percentage}%`);
                        }}
                        className="question-slider"
                        style={{
                          '--slider-percent': `${((selectedTimePerQuestion - QUIZ_CONFIG.MIN_TIME_PER_QUESTION) / (QUIZ_CONFIG.MAX_TIME_PER_QUESTION - QUIZ_CONFIG.MIN_TIME_PER_QUESTION)) * 100}%`
                        }}
                      />
                      <div className="slider-marks">
                        {[QUIZ_CONFIG.MIN_TIME_PER_QUESTION, QUIZ_CONFIG.DEFAULT_TIME_PER_QUESTION, QUIZ_CONFIG.MAX_TIME_PER_QUESTION]
                          .filter((val, idx, arr) => arr.indexOf(val) === idx).map(mark => (
                          <div 
                            key={mark} 
                            className={`slider-mark ${selectedTimePerQuestion === mark ? 'active' : ''}`}
                            style={{
                              left: `${((mark - QUIZ_CONFIG.MIN_TIME_PER_QUESTION) / 
                                (QUIZ_CONFIG.MAX_TIME_PER_QUESTION - QUIZ_CONFIG.MIN_TIME_PER_QUESTION)) * 100}%`
                            }}
                          >
                            <span className="mark-label">{mark}s</span>
                          </div>
                        ))}
                      </div>
                      <div 
                        className="slider-tooltip" 
                        style={{
                          left: `${((selectedTimePerQuestion - QUIZ_CONFIG.MIN_TIME_PER_QUESTION) / 
                            (QUIZ_CONFIG.MAX_TIME_PER_QUESTION - QUIZ_CONFIG.MIN_TIME_PER_QUESTION)) * 100}%`
                        }}
                      >
                        <span className="tooltip-value">{selectedTimePerQuestion}s</span>
                        <span className="tooltip-arrow"></span>
                      </div>
                    </div>
                    <div className="selector-display">
                      <span className="selected-count">{selectedTimePerQuestion}s</span>
                      <span className="total-count">
                        {selectedTimePerQuestion <= 45 ? 'Fast Pace' : 
                         selectedTimePerQuestion <= 90 ? 'Normal Pace' : 'Relaxed Pace'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="category-selector">
                    <label htmlFor="category">Category:</label>
                    <select 
                      id="category" 
                      value={selectedCategory !== null ? selectedCategory : ""} 
                      onChange={(e) => setSelectedCategory(e.target.value === "" ? null : parseInt(e.target.value))}
                      className="category-select"
                    >
                      <option value="">Any Category</option>
                      {/* Group categories by their groups */}
                      {Array.from(new Set(enhancedCategories.map(c => c.group))).map(group => (
                        <optgroup key={group} label={group}>
                          {enhancedCategories
                            .filter(category => category.group === group)
                            .map(category => (
                              <option key={category.id} value={category.id}>{category.name}</option>
                            ))
                          }
                        </optgroup>
                      ))}
                    </select>
                    <small className="category-note">
                      <span className="highlight">Categories with local questions:</span> Database Management, Operating Systems, Computer Networks, Programming Languages, Web Development, Cybersecurity, and Algorithms.
                      <br />
                      <span className="highlight">Enhanced with API questions:</span> All categories use specific tags to fetch relevant questions from QuizAPI.io and Open Trivia Database.
                    </small>
                  </div>
                  
                  <div className="difficulty-selector">
                    <label htmlFor="difficulty">Difficulty:</label>
                    <select 
                      id="difficulty" 
                      value={selectedDifficulty || ""} 
                      onChange={(e) => setSelectedDifficulty(e.target.value || null)}
                      className="difficulty-select"
                    >
                      <option value="">Any Difficulty</option>
                      {difficulties.map(difficulty => (
                        <option key={difficulty.id} value={difficulty.id}>{difficulty.name}</option>
                      ))}
                    </select>
                  </div>                    <div className="selector-info">
                      <div className="info-item">
                        <span className="info-icon">📊</span>
                        <span className="info-text">
                          Category: {selectedCategory !== null && selectedCategory !== "" ? 
                            enhancedCategories.find(c => c.id === selectedCategory)?.name || "Unknown" : 
                            "Any Category"}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-icon">⚡</span>
                        <span className="info-text">
                          Available: {isLoading ? 
                            <span className="loading-dot-pulse"></span> : 
                            `${maxAvailableQuestions} questions`}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-icon">🎯</span>
                        <span className="info-text">
                          Difficulty: {selectedDifficulty ? 
                            selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1) : 
                            "Mixed"}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-icon">⏱️</span>
                        <span className="info-text">
                          Total time: {Math.ceil((selectedQuestionCount * selectedTimePerQuestion) / 60)} minutes
                        </span>
                      </div>
                    </div>
                </div>
                <div className="selector-presets">
                  <div className="preset-group">
                    <h5>📊 Questions:</h5>
                    <button
                      className={`preset-button ${selectedQuestionCount === QUIZ_CONFIG.MIN_QUESTIONS ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedQuestionCount(QUIZ_CONFIG.MIN_QUESTIONS);
                        // Update slider visual
                        const slider = document.getElementById('questionCount');
                        if (slider) {
                          const percentage = ((QUIZ_CONFIG.MIN_QUESTIONS - QUIZ_CONFIG.MIN_QUESTIONS) / 
                            (maxAvailableQuestions - QUIZ_CONFIG.MIN_QUESTIONS)) * 100;
                          slider.style.setProperty('--slider-percent', `${percentage}%`);
                        }
                      }}
                      title={`Quick assessment - ${QUIZ_CONFIG.MIN_QUESTIONS} questions`}
                    >
                      ⚡ Quick ({QUIZ_CONFIG.MIN_QUESTIONS})
                    </button>
                    <button
                      className={`preset-button ${selectedQuestionCount === QUIZ_CONFIG.DEFAULT_QUESTIONS ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedQuestionCount(QUIZ_CONFIG.DEFAULT_QUESTIONS);
                        // Update slider visual
                        const slider = document.getElementById('questionCount');
                        if (slider) {
                          const percentage = ((QUIZ_CONFIG.DEFAULT_QUESTIONS - QUIZ_CONFIG.MIN_QUESTIONS) / 
                            (maxAvailableQuestions - QUIZ_CONFIG.MIN_QUESTIONS)) * 100;
                          slider.style.setProperty('--slider-percent', `${percentage}%`);
                        }
                      }}
                      title={`Balanced assessment - ${QUIZ_CONFIG.DEFAULT_QUESTIONS} questions`}
                    >
                      🎯 Medium ({QUIZ_CONFIG.DEFAULT_QUESTIONS})
                    </button>
                    <button
                      className={`preset-button ${selectedQuestionCount === maxAvailableQuestions ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedQuestionCount(maxAvailableQuestions);
                        // Update slider visual
                        const slider = document.getElementById('questionCount');
                        if (slider) {
                          const percentage = ((maxAvailableQuestions - QUIZ_CONFIG.MIN_QUESTIONS) / 
                            (maxAvailableQuestions - QUIZ_CONFIG.MIN_QUESTIONS)) * 100;
                          slider.style.setProperty('--slider-percent', `${percentage}%`);
                        }
                      }}
                      title="Complete assessment - all available questions"
                    >
                      🏆 Full ({maxAvailableQuestions})
                    </button>
                  </div>
                  
                  <div className="preset-group">
                    <h5>⏱️ Time per Question:</h5>
                    <button
                      className={`preset-button ${selectedTimePerQuestion === QUIZ_CONFIG.MIN_TIME_PER_QUESTION ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedTimePerQuestion(QUIZ_CONFIG.MIN_TIME_PER_QUESTION);
                        // Update slider visual
                        const slider = document.getElementById('timePerQuestion');
                        if (slider) {
                          const percentage = ((QUIZ_CONFIG.MIN_TIME_PER_QUESTION - QUIZ_CONFIG.MIN_TIME_PER_QUESTION) / 
                            (QUIZ_CONFIG.MAX_TIME_PER_QUESTION - QUIZ_CONFIG.MIN_TIME_PER_QUESTION)) * 100;
                          slider.style.setProperty('--slider-percent', `${percentage}%`);
                        }
                      }}
                      title={`Fast pace - ${QUIZ_CONFIG.MIN_TIME_PER_QUESTION} seconds per question`}
                    >
                      ⚡ Fast ({QUIZ_CONFIG.MIN_TIME_PER_QUESTION}s)
                    </button>
                    <button
                      className={`preset-button ${selectedTimePerQuestion === QUIZ_CONFIG.DEFAULT_TIME_PER_QUESTION ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedTimePerQuestion(QUIZ_CONFIG.DEFAULT_TIME_PER_QUESTION);
                        // Update slider visual
                        const slider = document.getElementById('timePerQuestion');
                        if (slider) {
                          const percentage = ((QUIZ_CONFIG.DEFAULT_TIME_PER_QUESTION - QUIZ_CONFIG.MIN_TIME_PER_QUESTION) / 
                            (QUIZ_CONFIG.MAX_TIME_PER_QUESTION - QUIZ_CONFIG.MIN_TIME_PER_QUESTION)) * 100;
                          slider.style.setProperty('--slider-percent', `${percentage}%`);
                        }
                      }}
                      title={`Balanced pace - ${QUIZ_CONFIG.DEFAULT_TIME_PER_QUESTION} seconds per question`}
                    >
                      🎯 Normal ({QUIZ_CONFIG.DEFAULT_TIME_PER_QUESTION}s)
                    </button>
                    <button
                      className={`preset-button ${selectedTimePerQuestion === QUIZ_CONFIG.MAX_TIME_PER_QUESTION ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedTimePerQuestion(QUIZ_CONFIG.MAX_TIME_PER_QUESTION);
                        // Update slider visual
                        const slider = document.getElementById('timePerQuestion');
                        if (slider) {
                          const percentage = ((QUIZ_CONFIG.MAX_TIME_PER_QUESTION - QUIZ_CONFIG.MIN_TIME_PER_QUESTION) / 
                            (QUIZ_CONFIG.MAX_TIME_PER_QUESTION - QUIZ_CONFIG.MIN_TIME_PER_QUESTION)) * 100;
                          slider.style.setProperty('--slider-percent', `${percentage}%`);
                        }
                      }}
                      title={`Relaxed pace - ${QUIZ_CONFIG.MAX_TIME_PER_QUESTION} seconds per question`}
                    >
                      🐌 Relaxed ({QUIZ_CONFIG.MAX_TIME_PER_QUESTION}s)
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="scoring-info">
              <h4>📈 Scoring System:</h4>
              <div className="scoring-grid">
                <div className="scoring-item">
                  <span className="scoring-icon">✅</span>
                  <span className="scoring-text"><strong>Base Score:</strong> 100 points per correct answer</span>
                </div>
                <div className="scoring-item">
                  <span className="scoring-icon">⚡</span>
                  <span className="scoring-text">
                    <strong>Speed Bonus:</strong> Up to {Math.round(selectedTimePerQuestion * 1.5)} extra points for quick answers
                  </span>
                </div>
                <div className="scoring-item">
                  <span className="scoring-icon">📈</span>
                  <span className="scoring-text"><strong>Grade Scale:</strong> A+ (90%+), A (85%+), B+ (75%+), etc.</span>
                </div>
                <div className="scoring-item">
                  <span className="scoring-icon">🏅</span>
                  <span className="scoring-text"><strong>Maximum Score:</strong> {selectedQuestionCount * (100 + Math.round(selectedTimePerQuestion * 1.5))} points</span>
                </div>
              </div>
            </div>
            <div className="welcome-actions">
              <button className="start-button" onClick={startQuiz} disabled={isLoading}>
                {isLoading ? 
                  <>
                    <span className="loader"></span> Loading Questions...
                  </> : 
                  <><span>🚀</span> Begin Assessment</>
                }
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const { grade, color } = getGradeAndColor();
    const totalQuizTime = getTotalQuizTime();
    const averageTimePerQuestion = totalQuizTime / activeQuestions.length;
    const compositeAccuracy = calculateCompositeAccuracy();

    return (
      <div className="quiz-container">
        <div className="floating-elements">
          <div className="floating-icon brain">🧠</div>
          <div className="floating-icon lightbulb">💡</div>
          <div className="floating-icon book">📚</div>
          <div className="floating-icon target">🎯</div>
          <div className="floating-icon star">⭐</div>
          <div className="floating-icon trophy">🏆</div>
        </div>
        <div className="results-screen">
          <div className="results-content">
            <div className="results-header">
              <h1 className="results-title">Quiz Complete! 🎊</h1>
              <div className="grade-display" style={{ '--grade-color': color }}>
                <span className="grade-letter">{grade}</span>
                <span className="grade-label">Grade</span>
              </div>
            </div>
            
            <div className="score-summary">
              <div className="score-item">
                <span className="score-value">{totalScore}</span>
                <span className="score-label">Total Score</span>
              </div>
              <div className="score-item">
                <span className="score-value">{score}/{activeQuestions.length}</span>
                <span className="score-label">Correct Answers</span>
              </div>
              <div className="score-item">
                <span className="score-value">{compositeAccuracy.toFixed(1)}%</span>
                <span className="score-label">Performance Score</span>
              </div>
              <div className="score-item">
                <span className="score-value">{Math.floor(totalQuizTime / 60)}:{(totalQuizTime % 60).toString().padStart(2, '0')}</span>
                <span className="score-label">Total Time</span>
              </div>
            </div>
            
            <p className="performance-message">{getPerformanceMessage()}</p>
            
            <div className="performance-explanation">
              <h4>📊 Performance Score Breakdown:</h4>
              <div className="explanation-grid">
                <div className="explanation-item">
                  <span className="explanation-icon">✅</span>
                  <span className="explanation-text">
                    <strong>Raw Accuracy:</strong> {percentage.toFixed(1)}% ({score}/{activeQuestions.length} correct)
                  </span>
                </div>
                <div className="explanation-item">
                  <span className="explanation-icon">⚡</span>
                  <span className="explanation-text">
                    <strong>Time Efficiency:</strong> {(answerTimes.reduce((sum, time) => sum + time, 0) / (activeQuestions.length * selectedTimePerQuestion) * 100).toFixed(0)}% of expected time
                  </span>
                </div>
                <div className="explanation-item">
                  <span className="explanation-icon">🎯</span>
                  <span className="explanation-text">
                    <strong>Performance Score:</strong> {compositeAccuracy.toFixed(1)}% (combines accuracy + speed)
                  </span>
                </div>
              </div>
              <p className="score-note">
                <em>Performance Score rewards both correct answers and efficient completion. 
                Faster completion can boost your score, while slower completion may reduce it.</em>
              </p>
            </div>
            
            <div className="results-details">
              <h3>Detailed Performance Analysis</h3>
              <div className="results-grid">
                {activeQuestions.map((question, index) => {
                  const timeUsed = answerTimes[index] || quizSettings.timePerQuestion;
                  const questionScore = answers[index] === question.correctAnswer ? calculateTimeBasedScore(timeUsed) : 0;
                  
                  return (
                    <div key={question.id} className="result-item">
                      <div className="result-header">
                        <span className="result-number">Q{index + 1}</span>
                        <span className={`result-status ${answers[index] === question.correctAnswer ? 'correct' : 'incorrect'}`}>
                          {answers[index] === question.correctAnswer ? '✓' : 
                           answers[index] === -1 ? '⏰' : '✗'}
                        </span>
                        <span className="result-score">+{questionScore} pts</span>
                      </div>
                      <div className="result-question">{question.question}</div>
                      <div className="result-meta">
                        <span className="result-time">Time: {timeUsed.toFixed(1)}s</span>
                        <span className="result-category">{question.category}</span>
                        <span className={`result-difficulty ${question.difficulty.toLowerCase()}`}>
                          {question.difficulty}
                        </span>
                      </div>
                      {answers[index] !== question.correctAnswer && (
                        <div className="correct-answer">
                          <strong>Correct:</strong> {question.options[question.correctAnswer]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="results-actions">
              <button className="retry-button" onClick={resetQuiz}>
                <span>🔄</span> Take Quiz Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <TotalTimer 
        timeLeft={totalTimeLeft} 
        isActive={isQuizStarted && !isQuizComplete} 
        totalTime={selectedQuestionCount * selectedTimePerQuestion}
      />
      
      <div className="quiz-main-content">
        <div className="floating-elements">
          <div className="floating-icon brain">🧠</div>
          <div className="floating-icon lightbulb">💡</div>
          <div className="floating-icon book">📚</div>
          <div className="floating-icon target">🎯</div>
          <div className="floating-icon star">⭐</div>
          <div className="floating-icon trophy">🏆</div>
        </div>
        <div className="quiz-header">
          <div className="quiz-title">
            <h1>🧠 Professional Quiz Assessment</h1>
            <div className="quiz-progress-info">
              Question {currentQuestionIndex + 1} of {activeQuestions.length}
              {selectedCategory !== null && selectedCategory !== "" && (
                <span className="category-info">
                  {' • '}{enhancedCategories.find(c => c.id === selectedCategory)?.name || "Unknown Category"}
                </span>
              )}
              {selectedDifficulty && (
                <span className="difficulty-info">
                  {' • '}{selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="quiz-body">
          <Question
            question={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={activeQuestions.length}
            onAnswer={handleAnswer}
            isAnswered={isAnswered}
            selectedAnswer={answers[currentQuestionIndex]}
            showCorrectAnswer={showCorrectAnswer}
          />
        </div>
        
        <div className="quiz-footer">
          <div className="current-progress">
            <span>Progress: {currentQuestionIndex + 1}/{activeQuestions.length}</span>
            <div className="mini-progress-bar">
              <div 
                className="mini-progress-fill"
                style={{ width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
