import { api } from "./api";
import { DictionaryContribution } from "../types/contribution";

export const contributionService = {
  submitContribution: async (data: any) => {
    const response = await api.post("/contributions", data);
    return response.data;
  },

  getMyContributions: async () => {
    const response = await api.get("/contributions/my");
    return response.data;
  },

  getPendingContributions: async () => {
    const response = await api.get("/contributions/admin/pending");
    return response.data;
  },

  approveContribution: async (id: number, adminNote?: string) => {
    const response = await api.put(`/contributions/admin/${id}/approve`, { adminNote });
    return response.data;
  },

  rejectContribution: async (id: number, adminNote: string) => {
    const response = await api.put(`/contributions/admin/${id}/reject`, { adminNote });
    return response.data;
  },

  uploadContributionVideo: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/contributions/upload-video", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data; // { success: true, videoUrl: "..." }
  },
};
