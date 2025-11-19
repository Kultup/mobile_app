import api from './api';

export interface Question {
  _id: string;
  category_id: { _id: string; name: string };
  position_id?: { _id: string; name: string };
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'text';
  media_type: 'none' | 'image' | 'video';
  image_url?: string;
  video_url?: string;
  video_thumbnail_url?: string;
  explanation?: string;
  knowledge_base_article_id?: { _id: string; title: string };
  answers: Array<{
    answer_text: string;
    is_correct: boolean;
    sort_order?: number;
  }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestionDto {
  category_id: string;
  position_id?: string;
  question_text: string;
  question_type?: 'single_choice' | 'multiple_choice' | 'text';
  media_type?: 'none' | 'image' | 'video';
  image_url?: string;
  video_url?: string;
  video_thumbnail_url?: string;
  explanation?: string;
  knowledge_base_article_id?: string;
  answers: Array<{
    answer_text: string;
    is_correct: boolean;
    sort_order?: number;
  }>;
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

export const questionsService = {
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    category_id?: string;
    position_id?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<Question>> => {
    const { data } = await api.get('/questions', { params });
    return data;
  },

  toggleActive: async (id: string, is_active: boolean): Promise<Question> => {
    if ((import.meta as any).env?.DEV) {
      console.log('[questionsService] toggleActive:', { id, is_active });
    }
    const { data } = await api.patch(`/questions/toggle-active/${id}`, { is_active });
    if ((import.meta as any).env?.DEV) {
      console.log('[questionsService] toggleActive response:', data);
    }
    return data;
  },

  getById: async (id: string): Promise<Question> => {
    const { data } = await api.get(`/questions/${id}`);
    return data;
  },

  create: async (question: CreateQuestionDto): Promise<Question> => {
    const { data } = await api.post('/questions', question);
    return data;
  },

  update: async (id: string, question: Partial<CreateQuestionDto>): Promise<Question> => {
    const { data } = await api.put(`/questions/${id}`, question);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },

  importFromExcel: async (file: File): Promise<{ imported: number; errors: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/questions/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};

