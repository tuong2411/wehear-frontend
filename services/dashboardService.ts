import { api } from "./api";

export interface DashboardStats {
  totalUsers: number;
  totalLessons: number;
  totalSigns: number;
  totalQuizzes: number;
  recentLessons: any[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
  }
};
