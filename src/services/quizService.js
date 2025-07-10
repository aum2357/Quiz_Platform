/**
 * Quiz Service - Fetch questions from Open Trivia Database API
 * with fallback to local computer science questions
 */
import { csQuestions } from '../data/csQuestions';

// API Base URLs
const API_BASE_URL = 'https://opentdb.com/api.php';
const QUIZ_API_BASE_URL = 'https://quizapi.io/api/v1/questions';

// QuizAPI.io API Key (you'll need to get this from https://quizapi.io/clientarea)
const QUIZ_API_KEY = import.meta.env.VITE_QUIZ_API_KEY || 'YOUR_API_KEY_HERE';

/**
 * Quiz configuration constants
 */
export const QUIZ_CONFIG = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 30,
  DEFAULT_QUESTIONS: 10,
  DEFAULT_MAX_AVAILABLE: 26,
  MIN_TIME_PER_QUESTION: 30,
  MAX_TIME_PER_QUESTION: 180,
  DEFAULT_TIME_PER_QUESTION: 60,
  TIME_STEP: 15
};

/**
 * Technical fields categories for our quiz app
 * Note: For API calls, we map these to the closest Open Trivia DB categories
 * - Computers (18) for CS topics
 * - Science & Nature (17) for technical topics
 * - Mathematics (19) for math-related topics
 * Only includes categories that have actual questions available
 */
export const categories = [
  // General Category
  { id: 0, name: "General Computer", apiCategory: 18, localCategory: "general", group: "General" },
  
  // Computer Science Core Topics - These have local questions available
  { id: 1, name: "Database Management (DBMS)", apiCategory: 18, localCategory: "cs-dbms", group: "Computer Science Core" },
  { id: 2, name: "Operating Systems", apiCategory: 18, localCategory: "cs-os", group: "Computer Science Core" },
  { id: 3, name: "Computer Networks", apiCategory: 18, localCategory: "cs-networking", group: "Computer Science Core" },
  { id: 4, name: "Programming Languages", apiCategory: 18, localCategory: "cs-programming", group: "Computer Science Core" },
  
  // Additional categories available through APIs and local questions
  { id: 5, name: "Web Development", apiCategory: 18, localCategory: "tech-web", group: "Software Development" },
  { id: 6, name: "Data Science & Analytics", apiCategory: 19, localCategory: "tech-data-science", group: "Data & AI" },
  { id: 7, name: "Machine Learning", apiCategory: 18, localCategory: "tech-ml", group: "Data & AI" },
  { id: 8, name: "Cybersecurity", apiCategory: 18, localCategory: "tech-security", group: "Systems & Security" },
  { id: 9, name: "Cloud Computing", apiCategory: 18, localCategory: "tech-cloud", group: "Systems & Security" },
  { id: 10, name: "Algorithms & Data Structures", apiCategory: 19, localCategory: "tech-algorithms", group: "Computing Fundamentals" }
];

/**
 * Difficulty levels for the quiz
 */
export const difficulties = [
  { id: "easy", name: "Easy" },
  { id: "medium", name: "Medium" },
  { id: "hard", name: "Hard" }
];

/**
 * Fetches questions from QuizAPI.io
 * @param {number} amount - Number of questions to fetch
 * @param {string|null} category - QuizAPI category
 * @param {string|null} difficulty - Difficulty level
 * @param {Array|null} tags - Specific tags to filter by
 * @returns {Promise<Array>} - Formatted questions
 */
const fetchQuizAPIQuestions = async (amount = 10, category = null, difficulty = null, tags = null) => {
  try {
    // Check if API key is available
    if (!QUIZ_API_KEY || QUIZ_API_KEY === 'YOUR_API_KEY_HERE') {
      console.warn('QuizAPI.io API key not configured. Please set VITE_QUIZ_API_KEY environment variable.');
      return [];
    }

    // Build the API URL with query parameters
    let url = `${QUIZ_API_BASE_URL}?apiKey=${QUIZ_API_KEY}&limit=${Math.min(amount, 20)}`;
    
    if (category) url += `&category=${category}`;
    if (difficulty) {
      // QuizAPI.io uses different difficulty levels
      const quizApiDifficulty = difficulty === 'medium' ? 'Medium' : 
                               difficulty === 'hard' ? 'Hard' : 'Easy';
      url += `&difficulty=${quizApiDifficulty}`;
    }
    
    // Add tags if provided (use the first tag as primary filter)
    if (tags && tags.length > 0) {
      url += `&tags=${tags[0]}`;
    }
    
    console.log('Fetching from QuizAPI.io:', url.replace(QUIZ_API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`QuizAPI.io HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from QuizAPI.io');
    }
    
    // Transform QuizAPI.io response to match our app's question format
    return data.map((q, index) => {
      // QuizAPI.io returns questions with answer_a, answer_b, etc.
      const options = [];
      const correctAnswers = [];
      
      // Extract options and identify correct answers
      Object.keys(q.answers).forEach(key => {
        if (q.answers[key] && q.answers[key].trim() !== '') {
          options.push(q.answers[key]);
          if (q.correct_answers && q.correct_answers[`${key}_correct`] === 'true') {
            correctAnswers.push(options.length - 1);
          }
        }
      });
      
      // Ensure we have at least 2 options, otherwise skip this question
      if (options.length < 2) {
        console.warn('Skipping question with insufficient options:', q.question);
        return null;
      }
      
      // For multiple choice, we typically take the first correct answer
      const correctAnswerIndex = correctAnswers.length > 0 ? correctAnswers[0] : 0;
      
      return {
        id: index + 1,
        question: decodeHTMLEntities(q.question),
        options: options.map(option => decodeHTMLEntities(option)),
        correctAnswer: correctAnswerIndex,
        category: q.category || 'General',
        difficulty: capitalizeFirstLetter(q.difficulty || 'medium')
      };
    }).filter(q => q !== null); // Remove any null questions
  } catch (error) {
    console.error('Error fetching from QuizAPI.io:', error);
    return [];
  }
};

/**
 * Fetches random quiz questions from multiple sources:
 * 1. QuizAPI.io for technical categories (preferred for tech content)
 * 2. Open Trivia Database API as fallback
 * 3. Local questions from csQuestions.js as final fallback
 * 
 * @param {number} amount - Number of questions to fetch (default: 10)
 * @param {string|null} categoryId - Category ID (optional)
 * @param {string|null} difficulty - Difficulty level: easy, medium, hard (optional)
 * @param {string} type - Question type: multiple (default) or boolean
 * @returns {Promise<Array>} - Formatted questions
 */
export const fetchQuizQuestions = async (
  amount = QUIZ_CONFIG.DEFAULT_QUESTIONS,
  categoryId = null,
  difficulty = null,
  type = 'multiple'
) => {
  // Ensure we don't try to fetch more than the maximum allowed
  amount = Math.min(amount, QUIZ_CONFIG.MAX_QUESTIONS);
  
  try {
    // If we have a specific category selected, try different sources
    if (categoryId) {
      const selectedCategory = categories.find(c => c.id === parseInt(categoryId));
      const enhancedCategory = enhancedCategories.find(c => c.id === parseInt(categoryId));
      
      if (selectedCategory && enhancedCategory) {
        // Try to get questions from our local bank first
        const localQuestions = getLocalQuestions(selectedCategory.localCategory, difficulty, amount);
        
        // If we have enough local questions, return them (they're better tailored for our topics)
        if (localQuestions.length >= amount) {
          console.log(`Using ${localQuestions.length} local questions for ${selectedCategory.name}`);
          return localQuestions;
        }
        
        // Try QuizAPI.io for technical categories
        let quizApiQuestions = [];
        if (enhancedCategory.quizApiCategory) {
          console.log(`Trying QuizAPI.io for ${selectedCategory.name} with category: ${enhancedCategory.quizApiCategory} and tags: ${enhancedCategory.quizApiTags?.join(', ')}`);
          quizApiQuestions = await fetchQuizAPIQuestions(
            amount - localQuestions.length,
            enhancedCategory.quizApiCategory,
            difficulty,
            enhancedCategory.quizApiTags
          );
        }
        
        // If we have local + QuizAPI questions and they're enough, use them
        if (localQuestions.length + quizApiQuestions.length >= amount) {
          console.log(`Using ${localQuestions.length} local + ${quizApiQuestions.length} QuizAPI questions for ${selectedCategory.name}`);
          const combinedQuestions = [...localQuestions, ...quizApiQuestions];
          return shuffleArray(combinedQuestions).slice(0, amount);
        }
        
        // If we still need more questions, try Open Trivia DB API
        if (localQuestions.length + quizApiQuestions.length < amount) {
          console.log(`Need more questions for ${selectedCategory.name}, trying Open Trivia DB API`);
          
          try {
            const remainingAmount = amount - localQuestions.length - quizApiQuestions.length;
            const apiUrl = `${API_BASE_URL}?amount=${remainingAmount}&type=${type}&category=${selectedCategory.apiCategory}${difficulty ? `&difficulty=${difficulty}` : ''}`;
            const apiResponse = await fetch(apiUrl);
            const apiData = await apiResponse.json();
            
            if (apiData.response_code === 0 && apiData.results.length > 0) {
              // Transform API questions
              const apiQuestions = apiData.results.map((q, index) => {
                const allOptions = [...q.incorrect_answers, q.correct_answer];
                const shuffledOptions = shuffleArray(allOptions);
                const correctAnswerIndex = shuffledOptions.findIndex(option => option === q.correct_answer);
                
                return {
                  id: localQuestions.length + quizApiQuestions.length + index + 1,
                  question: decodeHTMLEntities(q.question),
                  options: shuffledOptions.map(option => decodeHTMLEntities(option)),
                  correctAnswer: correctAnswerIndex,
                  category: selectedCategory.name,
                  difficulty: capitalizeFirstLetter(q.difficulty)
                };
              });
              
              // Combine all sources
              const allQuestions = [...localQuestions, ...quizApiQuestions, ...apiQuestions];
              console.log(`Using ${localQuestions.length} local + ${quizApiQuestions.length} QuizAPI + ${apiQuestions.length} Open Trivia questions for ${selectedCategory.name}`);
              return shuffleArray(allQuestions).slice(0, amount);
            }
          } catch (apiError) {
            console.warn('Failed to fetch additional questions from Open Trivia DB:', apiError);
          }
        }
        
        // If we have any questions from local + QuizAPI, return them
        if (localQuestions.length + quizApiQuestions.length > 0) {
          console.log(`Using available ${localQuestions.length} local + ${quizApiQuestions.length} QuizAPI questions for ${selectedCategory.name}`);
          return shuffleArray([...localQuestions, ...quizApiQuestions]);
        }
        
        // Otherwise, try to fetch from Open Trivia DB with mapped category
        console.log(`Falling back to Open Trivia DB API for ${selectedCategory.name}`);
        categoryId = selectedCategory.apiCategory;
      }
    }

    // Build the Open Trivia DB API URL with query parameters
    let url = `${API_BASE_URL}?amount=${amount}&type=${type}`;
    
    if (categoryId) url += `&category=${categoryId}`;
    if (difficulty) url += `&difficulty=${difficulty}`;
    
    // Fetch data from Open Trivia DB API
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.response_code !== 0) {
      throw new Error('Failed to fetch questions from Open Trivia DB API');
    }
    
    // Transform API response to match our app's question format
    return data.results.map((q, index) => {
      // Create an array with all options (correct + incorrect)
      const allOptions = [
        ...q.incorrect_answers,
        q.correct_answer
      ];
      
      // Shuffle the options
      const shuffledOptions = shuffleArray(allOptions);
      
      // Find the index of the correct answer in the shuffled array
      const correctAnswerIndex = shuffledOptions.findIndex(
        option => option === q.correct_answer
      );
      
      // Find the actual selected category based on the API category
      let displayCategory = q.category;
      if (categoryId) {
        const selectedCategory = categories.find(c => c.id === parseInt(categoryId));
        if (selectedCategory) {
          displayCategory = selectedCategory.name;
        }
      }
      
      return {
        id: index + 1,
        question: decodeHTMLEntities(q.question),
        options: shuffledOptions.map(option => decodeHTMLEntities(option)),
        correctAnswer: correctAnswerIndex,
        // Use our category name instead of the generic API category name
        category: displayCategory, 
        difficulty: capitalizeFirstLetter(q.difficulty)
      };
    });
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    
    // Fallback to local questions
    let localCategory = null;
    
    // If a category was selected, find its corresponding local category
    if (categoryId) {
      const selectedCategory = categories.find(c => c.id === parseInt(categoryId));
      if (selectedCategory) {
        localCategory = selectedCategory.localCategory;
      }
    }
    
    // Get local questions for the specified category (or all categories if not specified)
    return getLocalQuestions(localCategory, difficulty, amount);
  }
};

/**
 * Decode HTML entities in the text
 * @param {string} text - Text with HTML entities
 * @returns {string} - Decoded text
 */
const decodeHTMLEntities = (text) => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Capitalize the first letter of a string
 * @param {string} string - Input string
 * @returns {string} - String with first letter capitalized
 */
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Get questions from local questions bank
 * @param {string|null} category - Local category key (cs-dbms, tech-web, etc.) or null for all
 * @param {string|null} difficulty - Difficulty level (easy, medium, hard) or null for all
 * @param {number} amount - Number of questions to return
 * @returns {Array} - Formatted local questions
 */
const getLocalQuestions = (category = null, difficulty = null, amount = 10) => {
  let availableQuestions = [];
  
  // If category is specified, get questions from that category only
  if (category && csQuestions[category]) {
    availableQuestions = [...csQuestions[category]];
  } else if (category) {
    // If the category doesn't exist in our questions bank, try to find a fallback
    // First check if it's a tech-* category, we can use cs-* questions as fallback
    const categoryPrefix = category.split('-')[0];
    const csCategory = categoryPrefix === 'tech' ? 
      Object.keys(csQuestions).find(key => key.startsWith('cs-')) : null;
    
    if (csCategory) {
      // Use a CS category as fallback
      availableQuestions = [...csQuestions[csCategory]];
    } else {
      // If no specific fallback, use all questions
      Object.values(csQuestions).forEach(categoryQuestions => {
        availableQuestions = [...availableQuestions, ...categoryQuestions];
      });
    }
  } else {
    // If no category specified, get questions from all categories
    Object.values(csQuestions).forEach(categoryQuestions => {
      availableQuestions = [...availableQuestions, ...categoryQuestions];
    });
  }
  
  // Filter by difficulty if specified
  if (difficulty) {
    const normalizedDifficulty = difficulty.toLowerCase();
    availableQuestions = availableQuestions.filter(q => 
      q.difficulty.toLowerCase() === normalizedDifficulty
    );
  }
  
  // If we still don't have enough questions, just return what we have
  if (availableQuestions.length < amount) {
    console.warn(`Only ${availableQuestions.length} questions available for requested ${amount}`);
  }
  
  // Shuffle and limit to requested amount
  return shuffleArray(availableQuestions).slice(0, Math.min(availableQuestions.length, amount));
};

/**
 * Get the count of available questions for a specific category and difficulty
 * Takes into account local questions, QuizAPI.io questions, and Open Trivia DB questions
 * @param {string|null} categoryId - Category ID 
 * @param {string|null} difficulty - Difficulty level
 * @returns {Promise<number>} - Number of available questions
 */
export const getAvailableQuestionCount = async (categoryId = null, difficulty = null) => {
  try {
    // Check for local questions first
    let localCategory = null;
    let enhancedCategory = null;
    
    if (categoryId) {
      const selectedCategory = categories.find(c => c.id === parseInt(categoryId));
      enhancedCategory = enhancedCategories.find(c => c.id === parseInt(categoryId));
      if (selectedCategory) {
        localCategory = selectedCategory.localCategory;
      }
    }
    
    // Get count from local questions
    const localCount = countLocalQuestions(localCategory, difficulty);
    
    // Estimate additional questions from QuizAPI.io for technical categories
    let quizApiCount = 0;
    if (enhancedCategory && enhancedCategory.quizApiCategory && QUIZ_API_KEY && QUIZ_API_KEY !== 'YOUR_API_KEY_HERE') {
      // QuizAPI.io typically has good coverage for technical topics
      quizApiCount = 15; // Conservative estimate
    }
    
    // For API questions, we can potentially get additional questions from Open Trivia DB
    let openTriviaCount = 0;
    if (categoryId) {
      // Open Trivia DB has varying question counts per category
      openTriviaCount = 10; // Conservative estimate
    }
    
    // Calculate total available questions
    const totalAvailable = localCount + quizApiCount + openTriviaCount;
    
    // Return the minimum of calculated total or our maximum allowed
    const finalCount = Math.min(QUIZ_CONFIG.MAX_QUESTIONS, Math.max(totalAvailable, QUIZ_CONFIG.MIN_QUESTIONS));
    
    console.log(`Available questions for category ${categoryId}: ${localCount} local + ${quizApiCount} QuizAPI + ${openTriviaCount} OpenTrivia = ${finalCount} total`);
    
    return finalCount;
  } catch (error) {
    console.error('Error getting available question count:', error);
    return QUIZ_CONFIG.DEFAULT_MAX_AVAILABLE;
  }
};

/**
 * Count the number of questions available in the local question bank
 * @param {string|null} category - Local category key
 * @param {string|null} difficulty - Difficulty level
 * @returns {number} - Count of available questions
 */
const countLocalQuestions = (category = null, difficulty = null) => {
  let count = 0;
  
  // Logic similar to getLocalQuestions but we just count instead of returning questions
  if (category && csQuestions[category]) {
    count = csQuestions[category].length;
  } else if (category) {
    // Try to find a fallback category
    const categoryPrefix = category.split('-')[0];
    const csCategory = categoryPrefix === 'tech' ? 
      Object.keys(csQuestions).find(key => key.startsWith('cs-')) : null;
    
    if (csCategory) {
      count = csQuestions[csCategory].length;
    } else {
      // Count all questions if no specific fallback
      Object.values(csQuestions).forEach(categoryQuestions => {
        count += categoryQuestions.length;
      });
    }
  } else {
    // Count all questions if no category specified
    Object.values(csQuestions).forEach(categoryQuestions => {
      count += categoryQuestions.length;
    });
  }
  
  // Filter by difficulty if specified
  if (difficulty && count > 0) {
    const normalizedDifficulty = difficulty.toLowerCase();
    
    // For each applicable category, count only matching difficulty
    let difficultyCount = 0;
    
    if (category && csQuestions[category]) {
      difficultyCount = csQuestions[category].filter(q => 
        q.difficulty.toLowerCase() === normalizedDifficulty
      ).length;
    } else {
      // Count across all categories
      Object.values(csQuestions).forEach(categoryQuestions => {
        difficultyCount += categoryQuestions.filter(q => 
          q.difficulty.toLowerCase() === normalizedDifficulty
        ).length;
      });
    }
    
    count = difficultyCount;
  }
  
  return count;
};

/**
 * Enhanced categories with QuizAPI.io support
 * This maps to both the original categories and includes QuizAPI.io category mappings
 * Only includes categories that have actual questions available
 */
export const enhancedCategories = [
  // General Category - Maps to all available questions
  { id: 0, name: "General Computer", apiCategory: 18, localCategory: "general", group: "General", quizApiCategory: "code", quizApiTags: ["HTML", "CSS", "JavaScript"] },
  
  // Computer Science Core Topics - These have local questions available
  { id: 1, name: "Database Management (DBMS)", apiCategory: 18, localCategory: "cs-dbms", group: "Computer Science Core", quizApiCategory: "code", quizApiTags: ["MySQL", "SQL"] },
  { id: 2, name: "Operating Systems", apiCategory: 18, localCategory: "cs-os", group: "Computer Science Core", quizApiCategory: "code", quizApiTags: ["Linux", "bash"] },
  { id: 3, name: "Computer Networks", apiCategory: 18, localCategory: "cs-networking", group: "Computer Science Core", quizApiCategory: "code", quizApiTags: ["Docker", "Kubernetes"] },
  { id: 4, name: "Programming Languages", apiCategory: 18, localCategory: "cs-programming", group: "Computer Science Core", quizApiCategory: "code", quizApiTags: ["JavaScript", "Python", "PHP"] },
  
  // Additional categories available through APIs and local questions
  { id: 5, name: "Web Development", apiCategory: 18, localCategory: "tech-web", group: "Software Development", quizApiCategory: "code", quizApiTags: ["HTML", "CSS", "JavaScript", "Laravel"] },
  { id: 6, name: "Data Science & Analytics", apiCategory: 19, localCategory: "tech-data-science", group: "Data & AI", quizApiCategory: "code", quizApiTags: ["Python"] },
  { id: 7, name: "Machine Learning", apiCategory: 18, localCategory: "tech-ml", group: "Data & AI", quizApiCategory: "code", quizApiTags: ["Python"] },
  { id: 8, name: "Cybersecurity", apiCategory: 18, localCategory: "tech-security", group: "Systems & Security", quizApiCategory: "code", quizApiTags: ["Linux", "bash"] },
  { id: 9, name: "Cloud Computing", apiCategory: 18, localCategory: "tech-cloud", group: "Systems & Security", quizApiCategory: "devops", quizApiTags: ["Docker", "Kubernetes"] },
  { id: 10, name: "Algorithms & Data Structures", apiCategory: 19, localCategory: "tech-algorithms", group: "Computing Fundamentals", quizApiCategory: "code", quizApiTags: ["Python", "JavaScript"] }
];

// End of file
