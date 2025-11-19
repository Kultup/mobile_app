import api from './api';
import type {AchievementsResponse} from '../types';

export const achievementsService = {
  /**
   * Get user achievements (completed only)
   */
  async getAchievements(): Promise<AchievementsResponse> {
    const response = await api.get<AchievementsResponse>('/achievements');
    return response.data;
  },

  /**
   * Get all achievements with progress
   */
  async getAllAchievements(): Promise<AchievementsResponse> {
    const response = await api.get<AchievementsResponse>('/achievements/all');
    return response.data;
  },
};

