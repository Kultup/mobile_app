import api from './api';
import { PaginatedResponse } from '../types/pagination';

export interface FeedbackQuestion {
  _id: string;
  user_id: {
    _id: string;
    full_name: string;
    city_id?: { _id: string; name: string };
    position_id?: { _id: string; name: string };
  };
  question_text: string;
  suggested_answers?: string[];
  category_id?: { _id: string; name: string };
  comment?: string;
  is_reviewed: boolean;
  reviewed_by?: { _id: string; username: string };
  created_at: string;
}

export interface FeedbackErrorReport {
  _id: string;
  user_id: {
    _id: string;
    full_name: string;
    city_id?: { _id: string; name: string };
    position_id?: { _id: string; name: string };
  };
  question_id: {
    _id: string;
    question_text: string;
  };
  description: string;
  screenshot_url?: string;
  is_reviewed: boolean;
  reviewed_by?: { _id: string; username: string };
  created_at: string;
}

export const feedbackService = {
  getQuestions: async (params?: {
    page?: number;
    per_page?: number;
    is_reviewed?: boolean;
  }): Promise<PaginatedResponse<FeedbackQuestion>> => {
    const { data } = await api.get('/admin/feedback/questions', { params });
    return data;
  },

  getErrorReports: async (params?: {
    page?: number;
    per_page?: number;
    is_reviewed?: boolean;
  }): Promise<PaginatedResponse<FeedbackErrorReport>> => {
    const { data } = await api.get('/admin/feedback/error-reports', { params });
    return data;
  },

  markQuestionReviewed: async (id: string): Promise<FeedbackQuestion> => {
    const { data } = await api.put(`/admin/feedback/questions/${id}/review`);
    return data;
  },

  markErrorReportReviewed: async (id: string): Promise<FeedbackErrorReport> => {
    const { data } = await api.put(`/admin/feedback/error-reports/${id}/review`);
    return data;
  },
};

