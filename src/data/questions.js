// Default questions if API fails
export const quizQuestions = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correctAnswer: 2,
    category: "Geography",
    difficulty: "Easy"
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    category: "Science",
    difficulty: "Easy"
  },
  {
    id: 3,
    question: "What is the largest mammal in the world?",
    options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correctAnswer: 1,
    category: "Biology",
    difficulty: "Medium"
  },
  {
    id: 4,
    question: "In which year did the Titanic sink?",
    options: ["1910", "1911", "1912", "1913"],
    correctAnswer: 2,
    category: "History",
    difficulty: "Medium"
  },
  {
    id: 5,
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: 2,
    category: "Chemistry",
    difficulty: "Medium"
  },
  {
    id: 6,
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctAnswer: 2,
    category: "Art",
    difficulty: "Easy"
  },
  {
    id: 7,
    question: "What is the square root of 144?",
    options: ["10", "11", "12", "13"],
    correctAnswer: 2,
    category: "Mathematics",
    difficulty: "Easy"
  },
  {
    id: 8,
    question: "Which programming language is known for its use in web development and has a coffee-related name?",
    options: ["Python", "JavaScript", "Java", "C++"],
    correctAnswer: 1,
    category: "Technology",
    difficulty: "Easy"
  },
  {
    id: 9,
    question: "What is the smallest unit of matter?",
    options: ["Molecule", "Atom", "Electron", "Proton"],
    correctAnswer: 1,
    category: "Physics",
    difficulty: "Medium"
  },
  {
    id: 10,
    question: "Which country hosted the 2016 Summer Olympics?",
    options: ["China", "United Kingdom", "Brazil", "Russia"],
    correctAnswer: 2,
    category: "Sports",
    difficulty: "Easy"
  },
  {
    id: 11,
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctAnswer: 3,
    category: "Geography",
    difficulty: "Easy"
  },
  {
    id: 12,
    question: "Who wrote the novel '1984'?",
    options: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "H.G. Wells"],
    correctAnswer: 1,
    category: "Literature",
    difficulty: "Medium"
  },
  {
    id: 13,
    question: "What is the speed of light in vacuum?",
    options: ["299,792,458 m/s", "300,000,000 m/s", "299,000,000 m/s", "298,792,458 m/s"],
    correctAnswer: 0,
    category: "Physics",
    difficulty: "Hard"
  },
  {
    id: 14,
    question: "Which element has the highest melting point?",
    options: ["Tungsten", "Carbon", "Iron", "Platinum"],
    correctAnswer: 0,
    category: "Chemistry",
    difficulty: "Hard"
  },
  {
    id: 15,
    question: "In React, what hook is used to manage state in functional components?",
    options: ["useEffect", "useState", "useContext", "useReducer"],
    correctAnswer: 1,
    category: "Technology",
    difficulty: "Medium"
  }
];

export const quizSettings = {
  timePerQuestion: 30, // seconds
  totalQuestions: 15,
  passingScore: 70 // percentage
};
