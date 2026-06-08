export interface SignMedia {
  id: number;
  signId: number;
  mediaType: 'image' | 'video' | 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface SignDictionary {
  id: number;
  labelCode: string;
  signWord: string;
  description: string;
  region: string;
  difficultyLevel: string;
  exampleSentence: string;
  isActive: boolean;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  media?: SignMedia[];
}
