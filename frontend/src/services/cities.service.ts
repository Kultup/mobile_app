import api from './api';

export interface City {
  _id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCityDto {
  name: string;
  is_active?: boolean;
}

export const citiesService = {
  getAll: async (includeInactive?: boolean): Promise<{ data: City[] }> => {
    const { data } = await api.get('/cities', {
      params: includeInactive ? { include_inactive: 'true' } : {},
    });
    return data;
  },

  create: async (city: CreateCityDto): Promise<City> => {
    const { data } = await api.post('/cities', city);
    return data;
  },

  update: async (id: string, city: Partial<CreateCityDto>): Promise<City> => {
    const { data } = await api.put(`/cities/${id}`, city);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/cities/${id}`);
  },
};

