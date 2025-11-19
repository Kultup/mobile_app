import api from './api';

export interface City {
  _id: string;
  name: string;
  is_active: boolean;
}

export const citiesService = {
  /**
   * Get all cities
   */
  async getAll(includeInactive = false): Promise<City[]> {
    const response = await api.get<{data: City[]}>('/cities', {
      params: includeInactive ? {include_inactive: 'true'} : {},
    });
    return response.data.data;
  },
};


