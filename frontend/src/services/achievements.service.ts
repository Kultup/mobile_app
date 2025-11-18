import api from './api';

export interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon_url: string;
  category: 'testing' | 'activity' | 'accuracy' | 'rating' | 'special';
  condition_type: 'tests_count' | 'streak' | 'perfect_tests' | 'rating_position';
  condition_value: number;
  reward_points: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAchievementDto {
  name: string;
  description: string;
  icon_url: string;
  category: 'testing' | 'activity' | 'accuracy' | 'rating' | 'special';
  condition_type: 'tests_count' | 'streak' | 'perfect_tests' | 'rating_position';
  condition_value: number;
  reward_points: number;
  is_active?: boolean;
  sort_order?: number;
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

export const achievementsService = {
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    category?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<Achievement>> => {
    const { data } = await api.get('/admin/achievements', { params });
    return data;
  },

  getById: async (id: string): Promise<Achievement> => {
    const { data } = await api.get(`/admin/achievements/${id}`);
    return data;
  },

  create: async (achievement: CreateAchievementDto): Promise<Achievement> => {
    const { data } = await api.post('/admin/achievements', achievement);
    return data;
  },

  update: async (id: string, achievement: Partial<CreateAchievementDto>): Promise<Achievement> => {
    const { data } = await api.put(`/admin/achievements/${id}`, achievement);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/achievements/${id}`);
  },
};

