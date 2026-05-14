import { api } from './api';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<string> => {
    return (await api.post<string>('/auth/register', data)).data;
  },

  forgotPassword: async (email: string): Promise<string> => {
    return (await api.post<string>(`/auth/forgot-password?email=${email}`)).data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<string> => {
    return (await api.post<string>(`/auth/reset-password?token=${token}&newPassword=${newPassword}`)).data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
