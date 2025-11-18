import api from './api';

export interface RatingUser {
  position: number;
  user: {
    id: string;
    full_name: string;
    city?: { _id: string; name: string };
    position?: { _id: string; name: string };
  };
  total_score: number;
  tests_completed: number;
  current_streak: number;
}

export interface RatingsResponse {
  data: RatingUser[];
}

export const ratingsService = {
  getGlobal: async (params?: { limit?: number; page?: number }): Promise<RatingsResponse> => {
    const { data } = await api.get('/ratings/global', { params });
    return data;
  },

  getByCity: async (cityId: string, params?: { limit?: number; page?: number }): Promise<RatingsResponse> => {
    const { data } = await api.get('/ratings/by-city', { params: { city_id: cityId, ...params } });
    return data;
  },

  getByPosition: async (positionId: string, params?: { limit?: number; page?: number }): Promise<RatingsResponse> => {
    const { data } = await api.get('/ratings/by-position', { params: { position_id: positionId, ...params } });
    return data;
  },
};

