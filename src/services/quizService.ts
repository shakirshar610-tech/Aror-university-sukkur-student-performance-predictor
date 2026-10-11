import { supabase } from '@/lib/supabase'

export interface QuizAttempt {
  id: string
  topic: string
  question_type: string
  question: string
  options: string[] | null
  correct_answer: string
  user_answer: string | null
  is_correct: boolean
  difficulty: string
  created_at: string
}

export interface QuizAttemptInput {
  topic: string
  question_type?: string
  question: string
  options?: string[]
  correct_answer: string
  user_answer?: string
  is_correct?: boolean
  difficulty?: string
}

const STORAGE_KEY = 'aspp_quiz_attempts'

function readLocal(): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as QuizAttempt[]
  } catch {
    return []
  }
}

function writeLocal(attempts: QuizAttempt[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts))
  } catch { /* ignore */ }
}

export async function fetchQuizAttempts(): Promise<QuizAttempt[]> {
  if (!supabase) return readLocal()
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return readLocal()
  return (data || []) as QuizAttempt[]
}

export async function createQuizAttempt(input: QuizAttemptInput): Promise<QuizAttempt> {
  const payload = {
    topic: input.topic,
    question_type: input.question_type || 'mcq',
    question: input.question,
    options: input.options || null,
    correct_answer: input.correct_answer,
    user_answer: input.user_answer || null,
    is_correct: input.is_correct ?? false,
    difficulty: input.difficulty || 'medium',
  }
  if (!supabase) {
    const attempt: QuizAttempt = {
      id: crypto.randomUUID(),
      ...payload,
      created_at: new Date().toISOString(),
    }
    const local = readLocal()
    local.unshift(attempt)
    writeLocal(local)
    return attempt
  }
  const { data, error } = await supabase.from('quiz_attempts').insert(payload).select('*').single()
  if (error) throw error
  return data as QuizAttempt
}

export async function deleteQuizAttempt(id: string): Promise<void> {
  if (!supabase) {
    writeLocal(readLocal().filter((a) => a.id !== id))
    return
  }
  const { error } = await supabase.from('quiz_attempts').delete().eq('id', id)
  if (error) throw error
}

export async function clearQuizHistory(): Promise<void> {
  if (!supabase) {
    writeLocal([])
    return
  }
  await supabase.from('quiz_attempts').delete().neq('id', '00000000-0000-0000-0000-000000000000')
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
}

export const practiceQuestions: Record<string, QuizQuestion[]> = {
  'Programming Fundamentals': [
    {
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 1,
      explanation: 'Binary search halves the search space at each step, giving O(log n) time complexity.',
      difficulty: 'easy',
      topic: 'Programming Fundamentals',
    },
    {
      question: 'Which data structure uses FIFO (First In, First Out) ordering?',
      options: ['Stack', 'Queue', 'Tree', 'Graph'],
      correctAnswer: 1,
      explanation: 'A queue follows FIFO ordering — the first element added is the first one removed.',
      difficulty: 'easy',
      topic: 'Programming Fundamentals',
    },
    {
      question: 'What does "polymorphism" mean in object-oriented programming?',
      options: [
        'Many forms of a function',
        'A class with no methods',
        'A function that returns multiple values',
        'A type of loop',
      ],
      correctAnswer: 0,
      explanation: 'Polymorphism allows objects of different classes to be treated as objects of a common superclass, enabling "many forms" of the same interface.',
      difficulty: 'medium',
      topic: 'Programming Fundamentals',
    },
  ],
  'Data Structures': [
    {
      question: 'What is the worst-case time complexity of inserting into a balanced BST?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
      correctAnswer: 2,
      explanation: 'In a balanced BST, the height is log(n), so insertion takes O(log n) in the worst case.',
      difficulty: 'medium',
      topic: 'Data Structures',
    },
    {
      question: 'Which sorting algorithm has the best average-case time complexity?',
      options: ['Bubble Sort O(n²)', 'Quick Sort O(n log n)', 'Selection Sort O(n²)', 'Insertion Sort O(n²)'],
      correctAnswer: 1,
      explanation: 'Quick Sort has an average-case time complexity of O(n log n), making it efficient for general use.',
      difficulty: 'easy',
      topic: 'Data Structures',
    },
    {
      question: 'In a hash table, what is a "collision"?',
      options: [
        'Two keys hash to the same index',
        'The table is full',
        'A key is not found',
        'The hash function is broken',
      ],
      correctAnswer: 0,
      explanation: 'A collision occurs when two different keys produce the same hash value, mapping to the same index.',
      difficulty: 'easy',
      topic: 'Data Structures',
    },
  ],
  'Machine Learning': [
    {
      question: 'What is overfitting in machine learning?',
      options: [
        'The model performs well on training data but poorly on new data',
        'The model is too simple',
        'The training data is insufficient',
        'The model has too few parameters',
      ],
      correctAnswer: 0,
      explanation: 'Overfitting occurs when a model learns the training data too well, including noise, leading to poor generalization on unseen data.',
      difficulty: 'easy',
      topic: 'Machine Learning',
    },
    {
      question: 'Which algorithm is used for classification?',
      options: ['Linear Regression', 'K-Means', 'Logistic Regression', 'PCA'],
      correctAnswer: 2,
      explanation: 'Logistic Regression is used for binary classification, predicting the probability of a categorical outcome.',
      difficulty: 'medium',
      topic: 'Machine Learning',
    },
    {
      question: 'What does "gradient descent" optimize?',
      options: [
        'The learning rate',
        'The loss function',
        'The dataset size',
        'The number of features',
      ],
      correctAnswer: 1,
      explanation: 'Gradient descent iteratively adjusts parameters to minimize the loss function by moving in the direction of steepest descent.',
      difficulty: 'medium',
      topic: 'Machine Learning',
    },
  ],
  'Database Systems': [
    {
      question: 'What does ACID stand for in database transactions?',
      options: [
        'Atomicity, Consistency, Isolation, Durability',
        'Accuracy, Completeness, Integrity, Data',
        'Access, Control, Index, Data',
        'Atomic, Concurrent, Isolated, Distributed',
      ],
      correctAnswer: 0,
      explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability — properties ensuring reliable database transactions.',
      difficulty: 'medium',
      topic: 'Database Systems',
    },
    {
      question: 'Which SQL clause is used to filter results?',
      options: ['ORDER BY', 'GROUP BY', 'WHERE', 'HAVING'],
      correctAnswer: 2,
      explanation: 'The WHERE clause filters rows before grouping, while HAVING filters after GROUP BY.',
      difficulty: 'easy',
      topic: 'Database Systems',
    },
  ],
  'Operating Systems': [
    {
      question: 'What is a "deadlock" in operating systems?',
      options: [
        'A process that cannot proceed because it is waiting for a resource',
        'A program that has crashed',
        'A type of memory allocation',
        'A scheduling algorithm',
      ],
      correctAnswer: 0,
      explanation: 'A deadlock occurs when two or more processes are each waiting for resources held by the other, causing all to block indefinitely.',
      difficulty: 'medium',
      topic: 'Operating Systems',
    },
    {
      question: 'Which scheduling algorithm gives the shortest average waiting time?',
      options: ['First Come First Served', 'Round Robin', 'Shortest Job First', 'Priority Scheduling'],
      correctAnswer: 2,
      explanation: 'Shortest Job First (SJF) minimizes average waiting time by always running the shortest process next.',
      difficulty: 'hard',
      topic: 'Operating Systems',
    },
  ],
}

export const quizTopics = Object.keys(practiceQuestions)

export function getQuestionsByTopic(topic: string): QuizQuestion[] {
  return practiceQuestions[topic] || []
}

export function getRandomQuestions(count: number): QuizQuestion[] {
  const all = Object.values(practiceQuestions).flat()
  const shuffled = [...all]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, Math.min(count, all.length))
}
