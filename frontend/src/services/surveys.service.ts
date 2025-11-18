import api from './api';

export interface Survey {
  _id: string;
  title: string;
  description?: string;
  survey_type: 'rating' | 'multiple_choice' | 'text';
  is_active: boolean;
  starts_at?: string;
  ends_at?: string;
  options?: string[]; // For multiple_choice surveys
  created_by: { _id: string; username: string };
  created_at: string;
  updated_at: string;
}

export interface SurveyResponse {
  _id: string;
  survey_id: string;
  user_id: { _id: string; full_name: string };
  rating?: number;
  response_text?: string;
  selected_options?: string[];
  created_at: string;
}

export interface CreateSurveyDto {
  title: string;
  description?: string;
  survey_type: 'rating' | 'multiple_choice' | 'text';
  is_active?: boolean;
  starts_at?: string;
  ends_at?: string;
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

export const surveysService = {
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    is_active?: boolean;
  }): Promise<PaginatedResponse<Survey>> => {
    const { data } = await api.get('/admin/surveys', { params });
    return data;
  },

  getById: async (id: string): Promise<Survey> => {
    const { data } = await api.get(`/admin/surveys/${id}`);
    return data;
  },

  create: async (survey: CreateSurveyDto): Promise<Survey> => {
    const { data } = await api.post('/admin/surveys', survey);
    return data;
  },

  update: async (id: string, survey: Partial<CreateSurveyDto>): Promise<Survey> => {
    const { data } = await api.put(`/admin/surveys/${id}`, survey);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/surveys/${id}`);
  },

  getResponses: async (surveyId: string, params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<SurveyResponse>> => {
    const { data } = await api.get(`/admin/surveys/${surveyId}/responses`, { params });
    return data;
  },
};

