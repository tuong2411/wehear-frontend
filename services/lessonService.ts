import { api } from "./api";
import { Lesson, LessonRequest } from "@/types/lesson";

export const lessonService = {
  // Public APIs
  getAllLessons: async (): Promise<Lesson[]> => {
    const response = await api.get("/lessons");
    return response.data;
  },

  getLessonById: async (id: number): Promise<Lesson> => {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
  },

  getLessonBySlug: async (slug: string): Promise<Lesson> => {
    const response = await api.get(`/lessons/slug/${slug}`);
    return response.data;
  },

  generateAILesson: async (prompt: string): Promise<Lesson> => {
    const response = await api.get(`/lessons/generate-ai`, {
      params: { prompt },
    });
    return response.data;
  },

  // Admin APIs
  adminGetAll: async (): Promise<Lesson[]> => {
    const response = await api.get("/admin/lessons");
    return response.data;
  },

  adminGetById: async (id: number): Promise<Lesson> => {
    const response = await api.get(`/admin/lessons/${id}`);
    return response.data;
  },

  createLesson: async (data: LessonRequest): Promise<number> => {
    const response = await api.post("/admin/lessons", data);
    return response.data;
  },

  updateLesson: async (id: number, data: LessonRequest): Promise<string> => {
    const response = await api.put(`/admin/lessons/${id}`, data);
    return response.data;
  },

  deleteLesson: async (id: number): Promise<string> => {
    const response = await api.delete(`/admin/lessons/${id}`);
    return response.data;
  },

  generateAIQuiz: async (signWords: string[]): Promise<any[]> => {
    const response = await api.post("/admin/lessons/generate-quiz", signWords);
    return response.data;
  },

  suggestLessonSigns: async (title: string, description: string): Promise<any[]> => {
    const response = await api.post("/admin/lessons/suggest-signs", { title, description });
    return response.data;
  },

  uploadLessonCover: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/admin/upload/lesson-cover", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.url;
  }
};
