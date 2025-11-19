import api from './api';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface AdminActivityLog {
  _id: string;
  admin_user_id: {
    _id: string;
    username: string;
    email?: string;
  };
  action: string; // Схема використовує 'action', а не 'action_type'
  entity_type: string;
  entity_id?: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
  createdAt?: string; // Mongoose timestamps
}

export const activityLogsService = {
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    admin_user_id?: string;
    action_type?: string;
    entity_type?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<AdminActivityLog>> => {
    const { data } = await api.get('/admin/activity-logs', { params });
    return data;
  },
};

