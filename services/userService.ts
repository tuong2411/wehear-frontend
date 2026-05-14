import { api } from './api';
import { User } from '@/types/auth';

export const userService = {
  // User Profile APIs
  getProfile: async (): Promise<User> => {
    return (await api.get<User>('/users/profile')).data;
  },

  updateProfile: async (data: Partial<User>): Promise<string> => {
    return (await api.put<string>('/users/profile', data)).data;
  },

  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return (await api.post<{ url: string }>('/users/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
  },

  // Admin APIs
  getAllUsers: async (): Promise<User[]> => {
    return (await api.get<User[]>('/admin/users')).data;
  },

  updateUserStatus: async (id: number, status: number): Promise<string> => {
    return (await api.put<string>(`/admin/users/${id}/status?status=${status}`)).data;
  },

  deleteUser: async (id: number): Promise<string> => {
    return (await api.delete<string>(`/admin/users/${id}`)).data;
  },

  resetPassword: async (id: number): Promise<string> => {
    return (await api.post<string>(`/admin/users/${id}/reset-password`)).data;
  },

  bulkAction: async (ids: number[], action: string): Promise<string> => {
    return (await api.post<string>('/admin/users/bulk-action', { ids, action })).data;
  }
};
