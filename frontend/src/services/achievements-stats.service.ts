import api from './api';

export interface AchievementStatistics {
  achievement: {
    id: string;
    name: string;
    description: string;
    condition_type: string;
    condition_value: number;
  };
  statistics: {
    total_users: number;
    completed_users: number;
    in_progress_users: number;
    locked_users: number;
    completion_rate: number;
  };
  users: {
    data: Array<{
      user: {
        id: string;
        full_name: string;
        city?: { _id: string; name: string };
        position?: { _id: string; name: string };
      };
      progress: number;
      is_completed: boolean;
      completed_at?: string;
    }>;
    meta: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

export const achievementsStatsService = {
  getStatistics: async (achievementId: string, params?: { page?: number; per_page?: number }): Promise<AchievementStatistics> => {
    const { data } = await api.get(`/admin/achievements/${achievementId}/statistics`, { params });
    return data;
  },
};

