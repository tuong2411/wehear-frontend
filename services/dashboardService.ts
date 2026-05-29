import { api } from "./api";
import type { Lesson } from "@/types/lesson";

export interface DashboardStats {
  totalUsers: number;
  totalLessons: number;
  totalSigns: number;
  totalQuizzes: number;
  recentLessons: Lesson[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
  }
};
