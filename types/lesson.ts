import { SignDictionary, SignMedia } from "./dictionary";

export type LessonLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
export type LessonRegion = 'TOAN_QUOC' | 'MIEN_BAC' | 'MIEN_NAM' | 'MIEN_TRUNG';
export type LessonStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';

export interface QuizQuestion {
  id?: number;
  questionText: string;
  questionType: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  relatedSignId?: number;
  signMedia?: SignMedia;
}

export interface Quiz {
  id?: number;
  title: string;
  description?: string;
  timeLimitMinutes?: number;
  passingScore?: number;
  questions: QuizQuestion[];
}

export interface Lesson {
  id: number;
  topicId?: number;
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  level: LessonLevel;
  region: LessonRegion;
  status: LessonStatus;
  isFeatured: boolean;
  publishAt?: string;
  unpublishAt?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
  signCount?: number;
  signs?: SignDictionary[];
  quiz?: Quiz;
}

export interface LessonRequest extends Partial<Omit<Lesson, 'signs' | 'quiz'>> {
  signIds?: number[];
}
