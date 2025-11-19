import api from './api';
import type {KnowledgeArticle} from '../types';

export interface KnowledgeBaseCategory {
  _id: string;
  name: string;
  parent_id?: string | {_id: string; name: string};
  sort_order: number;
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export const knowledgeBaseService = {
  /**
   * Get all articles
   */
  async getArticles(params?: {
    page?: number;
    per_page?: number;
    category_id?: string;
    search?: string;
  }): Promise<PaginatedResponse<KnowledgeArticle>> {
    const response = await api.get<PaginatedResponse<KnowledgeArticle>>(
      '/knowledge-base/articles',
      {params},
    );
    return response.data;
  },

  /**
   * Get article by ID
   */
  async getArticle(id: string): Promise<KnowledgeArticle> {
    const response = await api.get<{data: KnowledgeArticle}>(
      `/knowledge-base/articles/${id}`,
    );
    return response.data.data || response.data;
  },

  /**
   * Get categories (using admin endpoint for now, as there's no public endpoint)
   */
  async getCategories(includeInactive = false): Promise<KnowledgeBaseCategory[]> {
    const response = await api.get<{data: KnowledgeBaseCategory[]}>(
      '/admin/knowledge-base/categories',
      {
        params: includeInactive ? {include_inactive: 'true'} : {},
      },
    );
    return response.data.data;
  },
};

