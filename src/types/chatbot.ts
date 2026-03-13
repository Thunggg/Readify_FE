export interface ChatBook {
  title: string;
  author: string;
  category: string;
  price: number;
  currency: string;
  soldCount?: number;
  stockQuantity?: number;
  available?: boolean;
  slug?: string;
}

export interface ChatResponse {
  answer: string;
  books: ChatBook[];
  quickQuestions?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  books?: ChatBook[];
  quickQuestions?: string[];
  timestamp: Date;
}
