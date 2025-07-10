/**
 * Computer Science specific questions for our quiz
 */

export const csQuestions = {
  "cs-programming": [
    {
      id: "p1",
      question: "Which programming paradigm treats computation as the evaluation of mathematical functions and avoids changing state and mutable data?",
      options: ["Object-Oriented Programming", "Procedural Programming", "Functional Programming", "Event-Driven Programming"],
      correctAnswer: 2,
      category: "Programming Languages",
      difficulty: "Medium"
    },
    {
      id: "p2",
      question: "In JavaScript, what is the output of: console.log(typeof NaN)?",
      options: ["undefined", "object", "number", "NaN"],
      correctAnswer: 2,
      category: "Programming Languages",
      difficulty: "Medium"
    },
    {
      id: "p3",
      question: "Which of these is NOT a JavaScript data type?",
      options: ["String", "Boolean", "Float", "Symbol"],
      correctAnswer: 2,
      category: "Programming Languages",
      difficulty: "Easy"
    },
    {
      id: "p4",
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n log n)", "O(n²)"],
      correctAnswer: 1,
      category: "Programming Languages",
      difficulty: "Medium"
    },
    {
      id: "p5",
      question: "What does CSS stand for?",
      options: ["Computer Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"],
      correctAnswer: 2,
      category: "Programming Languages",
      difficulty: "Easy"
    },
    {
      id: "p6",
      question: "What is React.js?",
      options: ["A server-side programming language", "A JavaScript library for building user interfaces", "A database management system", "An operating system"],
      correctAnswer: 1,
      category: "Programming Languages",
      difficulty: "Easy"
    },
    {
      id: "p7",
      question: "What is the purpose of the 'async/await' feature in JavaScript?",
      options: ["To create synchronous code blocks", "To work with promises in a more readable way", "To handle UI events", "To optimize memory usage"],
      correctAnswer: 1,
      category: "Programming Languages",
      difficulty: "Medium"
    },
    {
      id: "p8",
      question: "In Python, what is a lambda function?",
      options: ["A built-in security function", "An anonymous function defined with the lambda keyword", "A function that automatically parallelizes code", "A function that can only be called once"],
      correctAnswer: 1,
      category: "Programming Languages",
      difficulty: "Medium"
    }
  ],
  "cs-dbms": [
    {
      id: "db1",
      question: "What is ACID in the context of databases?",
      options: ["A database security protocol", "A type of database architecture", "Properties of database transactions (Atomicity, Consistency, Isolation, Durability)", "A data encryption standard"],
      correctAnswer: 2,
      category: "Database Management",
      difficulty: "Medium"
    },
    {
      id: "db2",
      question: "Which of the following is NOT a type of SQL join?",
      options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "PARALLEL JOIN"],
      correctAnswer: 3,
      category: "Database Management",
      difficulty: "Medium"
    },
    {
      id: "db3",
      question: "Which normal form deals with removing transitive dependencies?",
      options: ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Fourth Normal Form (4NF)"],
      correctAnswer: 2,
      category: "Database Management",
      difficulty: "Hard"
    },
    {
      id: "db4",
      question: "What is the purpose of an SQL INDEX?",
      options: ["To enforce data integrity", "To speed up data retrieval", "To secure the database from unauthorized access", "To normalize data"],
      correctAnswer: 1,
      category: "Database Management",
      difficulty: "Medium"
    },
    {
      id: "db5",
      question: "What does NoSQL stand for?",
      options: ["Non-SQL", "Not Only SQL", "New SQL", "No Sequential Query Language"],
      correctAnswer: 1,
      category: "Database Management",
      difficulty: "Easy"
    },
    {
      id: "db6",
      question: "Which of the following is a NoSQL database?",
      options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
      correctAnswer: 2,
      category: "Database Management",
      difficulty: "Easy"
    }
  ],
  "cs-os": [
    {
      id: "os1",
      question: "What is a deadlock in operating systems?",
      options: ["A security mechanism", "A permanent blocking of processes that cannot be resolved without external intervention", "A type of malware", "A special CPU scheduling algorithm"],
      correctAnswer: 1,
      category: "Operating Systems",
      difficulty: "Medium"
    },
    {
      id: "os2",
      question: "Which scheduling algorithm prioritizes processes with the shortest estimated processing time?",
      options: ["Round Robin", "First Come First Served (FCFS)", "Shortest Job First (SJF)", "Priority Scheduling"],
      correctAnswer: 2,
      category: "Operating Systems",
      difficulty: "Medium"
    },
    {
      id: "os3",
      question: "What is virtual memory in operating systems?",
      options: ["A technique that provides an 'idealized abstraction of the storage resources' to the software", "The physical memory installed on the computer", "A backup memory system", "A memory management approach that only uses RAM"],
      correctAnswer: 0,
      category: "Operating Systems",
      difficulty: "Medium"
    },
    {
      id: "os4",
      question: "What is a process in operating systems?",
      options: ["A program in execution", "A segment of code", "A section of the memory", "A CPU scheduling method"],
      correctAnswer: 0,
      category: "Operating Systems",
      difficulty: "Easy"
    },
    {
      id: "os5",
      question: "Which of the following is not a common state of a process?",
      options: ["Ready", "Running", "Waiting", "Terminated", "Suspended"],
      correctAnswer: 4,
      category: "Operating Systems",
      difficulty: "Medium"
    },
    {
      id: "os6",
      question: "What is the primary purpose of an operating system?",
      options: ["To provide games and entertainment", "To manage hardware resources and provide services for users and applications", "To protect the computer from viruses", "To speed up the computer processor"],
      correctAnswer: 1,
      category: "Operating Systems",
      difficulty: "Easy"
    }
  ],
  "cs-networking": [
    {
      id: "net1",
      question: "What is the purpose of DNS in networking?",
      options: ["To encrypt data transmission", "To translate domain names to IP addresses", "To control network traffic flow", "To detect network intrusions"],
      correctAnswer: 1,
      category: "Computer Networks",
      difficulty: "Easy"
    },
    {
      id: "net2",
      question: "Which protocol is used for secure communication over the web?",
      options: ["HTTP", "FTP", "HTTPS", "SMTP"],
      correctAnswer: 2,
      category: "Computer Networks",
      difficulty: "Easy"
    },
    {
      id: "net3",
      question: "What does TCP/IP stand for?",
      options: ["Transmission Control Protocol/Internet Protocol", "Technical Control Protocol/Internet Protocol", "Transfer Control Protocol/Internet Protocol", "Transmission Communication Protocol/Internet Protocol"],
      correctAnswer: 0,
      category: "Computer Networks",
      difficulty: "Easy"
    },
    {
      id: "net4",
      question: "Which OSI layer is responsible for routing and forwarding?",
      options: ["Physical Layer", "Data Link Layer", "Network Layer", "Transport Layer"],
      correctAnswer: 2,
      category: "Computer Networks",
      difficulty: "Medium"
    },
    {
      id: "net5",
      question: "What is a subnet mask used for?",
      options: ["To hide the network identity", "To identify which portion of an IP address refers to the network and which portion refers to the host", "To encrypt network traffic", "To speed up network transmission"],
      correctAnswer: 1,
      category: "Computer Networks",
      difficulty: "Medium"
    },
    {
      id: "net6",
      question: "What is the maximum number of IP addresses possible in a /24 subnet?",
      options: ["254", "255", "256", "253"],
      correctAnswer: 2,
      category: "Computer Networks",
      difficulty: "Hard"
    }
  ],
  "tech-web": [
    {
      id: "web1",
      question: "What does HTML stand for?",
      options: ["Hypertext Markup Language", "High-level Text Markup Language", "Hyperlink and Text Markup Language", "Home Tool Markup Language"],
      correctAnswer: 0,
      category: "Web Development",
      difficulty: "Easy"
    },
    {
      id: "web2",
      question: "Which CSS property is used to change the text color?",
      options: ["font-color", "text-color", "color", "foreground-color"],
      correctAnswer: 2,
      category: "Web Development",
      difficulty: "Easy"
    },
    {
      id: "web3",
      question: "What is the purpose of the <head> tag in HTML?",
      options: ["To display the main content", "To contain metadata about the document", "To create a header section", "To define navigation links"],
      correctAnswer: 1,
      category: "Web Development",
      difficulty: "Easy"
    },
    {
      id: "web4",
      question: "Which HTTP method is used to retrieve data from a server?",
      options: ["POST", "GET", "PUT", "DELETE"],
      correctAnswer: 1,
      category: "Web Development",
      difficulty: "Medium"
    },
    {
      id: "web5",
      question: "What is responsive web design?",
      options: ["Design that responds to user clicks", "Design that works on different screen sizes", "Design that loads quickly", "Design that uses animations"],
      correctAnswer: 1,
      category: "Web Development",
      difficulty: "Medium"
    }
  ],
  "tech-algorithms": [
    {
      id: "algo1",
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n log n)", "O(n²)"],
      correctAnswer: 1,
      category: "Algorithms",
      difficulty: "Medium"
    },
    {
      id: "algo2",
      question: "Which sorting algorithm has the best average-case time complexity?",
      options: ["Bubble Sort", "Quick Sort", "Insertion Sort", "Selection Sort"],
      correctAnswer: 1,
      category: "Algorithms",
      difficulty: "Medium"
    },
    {
      id: "algo3",
      question: "What is a hash table?",
      options: ["A sorted array", "A data structure that maps keys to values", "A type of tree", "A linked list"],
      correctAnswer: 1,
      category: "Algorithms",
      difficulty: "Easy"
    },
    {
      id: "algo4",
      question: "What is the space complexity of merge sort?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correctAnswer: 2,
      category: "Algorithms",
      difficulty: "Hard"
    }
  ],
  "tech-security": [
    {
      id: "sec1",
      question: "What is the primary purpose of a firewall?",
      options: ["To prevent virus infections", "To filter network traffic based on security rules", "To encrypt data", "To backup data"],
      correctAnswer: 1,
      category: "Cybersecurity",
      difficulty: "Easy"
    },
    {
      id: "sec2",
      question: "What does SSL/TLS provide?",
      options: ["Network speed optimization", "Data encryption in transit", "Data compression", "Network routing"],
      correctAnswer: 1,
      category: "Cybersecurity",
      difficulty: "Easy"
    },
    {
      id: "sec3",
      question: "Which of the following is a common type of cyber attack?",
      options: ["SQL Injection", "HTML Parsing", "CSS Rendering", "JavaScript Compilation"],
      correctAnswer: 0,
      category: "Cybersecurity",
      difficulty: "Medium"
    },
    {
      id: "sec4",
      question: "What is the principle of least privilege?",
      options: ["Giving users maximum access to prevent requests", "Providing users with the minimum level of access needed to perform their job", "Restricting all access to administrators only", "Allowing guest access to all systems"],
      correctAnswer: 1,
      category: "Cybersecurity",
      difficulty: "Medium"
    },
    {
      id: "sec5",
      question: "What is two-factor authentication (2FA)?",
      options: ["Using two different passwords", "A security process that requires two different authentication factors", "Having two security questions", "Using two different browsers"],
      correctAnswer: 1,
      category: "Cybersecurity",
      difficulty: "Easy"
    },
    {
      id: "sec6",
      question: "What is a zero-day vulnerability?",
      options: ["A vulnerability that takes zero days to fix", "A vulnerability that is discovered and exploited before a patch is available", "A vulnerability in zero-rated software", "A vulnerability that occurs at midnight"],
      correctAnswer: 1,
      category: "Cybersecurity",
      difficulty: "Hard"
    },
    {
      id: "sec7",
      question: "What is the purpose of penetration testing?",
      options: ["To test network speed", "To evaluate security by simulating cyber attacks", "To test software functionality", "To measure system performance"],
      correctAnswer: 1,
      category: "Cybersecurity",
      difficulty: "Medium"
    },
    {
      id: "sec8",
      question: "What is malware?",
      options: ["Software that improves system performance", "Software designed to damage or disrupt systems", "Software used for data analysis", "Software for network configuration"],
      correctAnswer: 1,
      category: "Cybersecurity",
      difficulty: "Easy"
    }
  ]
};
