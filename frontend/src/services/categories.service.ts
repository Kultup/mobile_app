import api from './api';

export interface Category {
  _id: string;
  name: string;
  parent_id?: string | { _id: string; name: string };
  sort_order?: number;
  is_active?: boolean;
}

export interface CreateCategoryDto {
  name: string;
  parent_id?: string;
  sort_order?: number;
  is_active?: boolean;
}

export const categoriesService = {
  // Question Categories
  getQuestionCategories: async (includeInactive?: boolean): Promise<{ data: Category[] }> => {
    const { data } = await api.get('/admin/questions/categories', {
      params: includeInactive ? { include_inactive: 'true' } : {},
    });
    return data;
  },

  getQuestionCategory: async (id: string): Promise<Category> => {
    const { data } = await api.get(`/admin/questions/categories/${id}`);
    return data;
  },

  createQuestionCategory: async (category: CreateCategoryDto): Promise<Category> => {
    const { data } = await api.post('/admin/questions/categories', category);
    return data;
  },

  updateQuestionCategory: async (id: string, category: Partial<CreateCategoryDto>): Promise<Category> => {
    const { data } = await api.put(`/admin/questions/categories/${id}`, category);
    return data;
  },

  deleteQuestionCategory: async (id: string): Promise<void> => {
    await api.delete(`/admin/questions/categories/${id}`);
  },

  // Knowledge Base Categories
  getKnowledgeBaseCategories: async (includeInactive?: boolean): Promise<{ data: Category[] }> => {
    try {
      const { data } = await api.get('/admin/knowledge-base/categories', {
        params: includeInactive ? { include_inactive: 'true' } : {},
      });
      console.log('[categoriesService] getKnowledgeBaseCategories response:', data);
      return data;
    } catch (error: any) {
      console.error('[categoriesService] getKnowledgeBaseCategories error:', error.response?.data || error.message);
      throw error;
    }
  },

  getKnowledgeBaseCategory: async (id: string): Promise<Category> => {
    const { data } = await api.get(`/admin/knowledge-base/categories/${id}`);
    return data;
  },

  createKnowledgeBaseCategory: async (category: CreateCategoryDto): Promise<Category> => {
    const { data } = await api.post('/admin/knowledge-base/categories', category);
    return data;
  },

  updateKnowledgeBaseCategory: async (id: string, category: Partial<CreateCategoryDto>): Promise<Category> => {
    const { data } = await api.put(`/admin/knowledge-base/categories/${id}`, category);
    return data;
  },

  deleteKnowledgeBaseCategory: async (id: string): Promise<void> => {
    await api.delete(`/admin/knowledge-base/categories/${id}`);
  },

  // Shop Product Categories
  getShopCategories: async (): Promise<{ data: Category[] }> => {
    const { data } = await api.get('/admin/shop/categories');
    return data;
  },

  getShopCategory: async (id: string): Promise<Category> => {
    const { data } = await api.get(`/admin/shop/categories/${id}`);
    return data;
  },

  createShopCategory: async (category: CreateCategoryDto): Promise<Category> => {
    const { data } = await api.post('/admin/shop/categories', category);
    return data;
  },

  updateShopCategory: async (id: string, category: CreateCategoryDto): Promise<Category> => {
    const { data } = await api.put(`/admin/shop/categories/${id}`, category);
    return data;
  },

  deleteShopCategory: async (id: string): Promise<void> => {
    await api.delete(`/admin/shop/categories/${id}`);
  },
};

