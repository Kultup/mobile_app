import api from './api';
import type {RatingsResponse} from '../types';

export const ratingService = {
  /**
   * Get global rating
   */
  async getGlobal(params?: {
    limit?: number;
    page?: number;
  }): Promise<RatingsResponse> {
    const response = await api.get<RatingsResponse>('/ratings/global', {
      params,
    });
    return response.data;
  },

  /**
   * Get rating by city
   */
  async getByCity(
    cityId: string,
    params?: {limit?: number; page?: number},
  ): Promise<RatingsResponse> {
    const response = await api.get<RatingsResponse>('/ratings/by-city', {
      params: {city_id: cityId, ...params},
    });
    return response.data;
  },

  /**
   * Get rating by position
   */
  async getByPosition(
    positionId: string,
    params?: {limit?: number; page?: number},
  ): Promise<RatingsResponse> {
    const response = await api.get<RatingsResponse>('/ratings/by-position', {
      params: {position_id: positionId, ...params},
    });
    return response.data;
  },
};

