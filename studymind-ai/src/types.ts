export type Tab = "notes" | "flashcards" | "quiz" | "doubt" | "explain" | "summary" | "library";

export type Language = "english" | "malayalam";

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface SavedNote {
  id: string;
  topic: string;
  detailLevel: string;
  language: Language;
  content: string;
  createdAt: string;
}

export interface SavedFlashcardDeck {
  id: string;
  topic: string;
  language: Language;
  cards: Flashcard[];
  createdAt: string;
}

export interface SavedQuiz {
  id: string;
  topic: string;
  difficulty: string;
  language: Language;
  questions: QuizQuestion[];
  score?: {
    correct: number;
    total: number;
  };
  createdAt: string;
}

export interface SavedDoubt {
  id: string;
  question: string;
  context?: string;
  language: Language;
  answer: string;
  createdAt: string;
}

export interface SavedSimpleExplanation {
  id: string;
  topic: string;
  language: Language;
  explanation: string;
  createdAt: string;
}

export interface SavedSummary {
  id: string;
  originalText: string;
  targetLength: string;
  language: Language;
  summary: string;
  createdAt: string;
}
