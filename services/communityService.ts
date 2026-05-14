import { api } from "./api";
import { CommunityPost, CommunityComment, CommunityReport } from "../types/community";

export const communityService = {
  // User APIs
  getPosts: async (page: number = 0, size: number = 10) => {
    const response = await api.get(`/community/posts?page=${page}&size=${size}`);
    return response.data;
  },

  getPostDetail: async (id: number) => {
    const response = await api.get(`/community/posts/${id}`);
    return response.data;
  },

  createPost: async (post: CommunityPost) => {
    const response = await api.post("/community/posts", post);
    return response.data;
  },

  addComment: async (comment: Partial<CommunityComment>) => {
    const response = await api.post("/community/comments", comment);
    return response.data;
  },

  toggleLike: async (target: { postId?: number; commentId?: number }) => {
    const response = await api.post("/community/like", target);
    return response.data;
  },

  reportContent: async (report: CommunityReport) => {
    const response = await api.post("/community/report", report);
    return response.data;
  },

  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/community/upload-media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data; // { success: true, url: "..." }
  },

  // Admin APIs
  adminGetPosts: async (page: number = 0, size: number = 20) => {
    const response = await api.get(`/admin/community/posts?page=${page}&size=${size}`);
    return response.data;
  },

  hidePost: async (id: number) => {
    const response = await api.put(`/admin/community/posts/${id}/hide`);
    return response.data;
  },

  showPost: async (id: number) => {
    const response = await api.put(`/admin/community/posts/${id}/show`);
    return response.data;
  },

  hideComment: async (id: number) => {
    const response = await api.put(`/admin/community/comments/${id}/hide`);
    return response.data;
  },

  showComment: async (id: number) => {
    const response = await api.put(`/admin/community/comments/${id}/show`);
    return response.data;
  },

  getReports: async () => {
    const response = await api.get("/admin/community/reports");
    return response.data;
  },

  resolveReport: async (id: number) => {
    const response = await api.put(`/admin/community/reports/${id}/resolve`);
    return response.data;
  },
};
