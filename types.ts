export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// FIX: Define the missing Hadith type for HadithSelector component.
export interface Hadith {
  id: number | string;
  narrator: string;
  english: string;
}
