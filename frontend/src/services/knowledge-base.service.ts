import api from './api';

export interface KnowledgeBaseArticle {
  _id: string;
  category_id: { _id: string; name: string };
  position_id?: { _id: string; name: string };
  title: string;
  content: string;
  image_url?: string;
  pdf_url?: string;
  is_active: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateKnowledgeArticleDto {
  category_id: string;
  position_id?: string;
  title: string;
  content: string;
  image_url?: string;
  pdf_url?: string;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export const knowledgeBaseService = {
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    category_id?: string;
    search?: string;
  }): Promise<PaginatedResponse<KnowledgeBaseArticle>> => {
    const { data } = await api.get('/knowledge-base/articles', { params });
    return data;
  },

  getArticles: async (params?: {
    page?: number;
    per_page?: number;
    category_id?: string;
    search?: string;
  }): Promise<PaginatedResponse<KnowledgeBaseArticle>> => {
    const { data } = await api.get('/knowledge-base/articles', { params });
    return data;
  },

  getArticle: async (id: string): Promise<KnowledgeBaseArticle> => {
    // Використовуємо адмін endpoint для редагування (не збільшує перегляди)
    const { data } = await api.get(`/admin/knowledge-base/articles/${id}`);
    return data;
  },

  create: async (article: CreateKnowledgeArticleDto): Promise<KnowledgeBaseArticle> => {
    const { data } = await api.post('/admin/knowledge-base/articles', article);
    return data;
  },

  update: async (id: string, article: Partial<CreateKnowledgeArticleDto>): Promise<KnowledgeBaseArticle> => {
    const { data } = await api.put(`/admin/knowledge-base/articles/${id}`, article);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/knowledge-base/articles/${id}`);
  },
};

