import api from './api';

export interface DashboardData {
  total_users: number;
  active_today: number;
  tests_completed: number;
  completion_rate: number;
}

export interface User {
  _id: string;
  full_name: string;
  city_id?: { _id: string; name: string };
  position_id?: { _id: string; name: string };
  total_score: number;
  points_balance: number;
  tests_completed: number;
  current_streak: number;
  longest_streak: number;
  is_active: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export const adminService = {
  getDashboard: async (): Promise<DashboardData> => {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },

  getUsers: async (params?: {
    page?: number;
    per_page?: number;
    city_id?: string;
    position_id?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  updateUser: async (id: string, updateData: Partial<User>): Promise<User> => {
    const { data } = await api.put(`/admin/users/${id}`, updateData);
    return data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
};

