import api from './api';

export interface Position {
  _id: string;
  name: string;
  is_active: boolean;
}

export const positionsService = {
  /**
   * Get all positions
   */
  async getAll(includeInactive = false): Promise<Position[]> {
    const response = await api.get<{data: Position[]}>('/positions', {
      params: includeInactive ? {include_inactive: 'true'} : {},
    });
    return response.data.data;
  },
};


