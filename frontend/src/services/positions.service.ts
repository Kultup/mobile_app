import api from './api';

export interface Position {
  _id: string;
  name: string;
  category_ids?: string[] | Array<{ _id: string; name: string }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePositionDto {
  name: string;
  category_ids?: string[];
  is_active?: boolean;
}

export const positionsService = {
  getAll: async (includeInactive?: boolean): Promise<{ data: Position[] }> => {
    const { data } = await api.get('/positions', {
      params: includeInactive ? { include_inactive: 'true' } : {},
    });
    return data;
  },

  create: async (position: CreatePositionDto): Promise<Position> => {
    const { data } = await api.post('/positions', position);
    return data;
  },

  update: async (id: string, position: Partial<CreatePositionDto>): Promise<Position> => {
    const { data } = await api.put(`/positions/${id}`, position);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/positions/${id}`);
  },
};

