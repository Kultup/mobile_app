import api from './api';
import type {User} from '../types';

export const userService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<{data: User}>('/user/profile');
    return response.data.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: {
    full_name?: string;
    city_id?: string;
    position_id?: string;
  }): Promise<User> {
    const response = await api.put<{data: User}>('/user/profile', data);
    return response.data.data;
  },
};

