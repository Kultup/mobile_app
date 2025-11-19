import api from './api';
import type {DailyTest} from '../types';

export interface UserStatistics {
  total_tests: number;
  total_score: number;
  correct_answers_percentage: number;
  correct_answers_percentage_month: number;
  current_streak: number;
  longest_streak: number;
  progress_chart: Array<{
    date: string;
    score?: number;
    correct?: number;
  }>;
}

export interface TestHistoryItem {
  _id: string;
  test_date: string;
  questions_count: number;
  correct_answers: number;
  score: number;
  is_completed: boolean;
}

export const statisticsService = {
  /**
   * Get user statistics
   */
  async getStatistics(): Promise<UserStatistics> {
    const response = await api.get<UserStatistics>('/user/statistics');
    return response.data;
  },

  /**
   * Get test history
   */
  async getTestHistory(
    page = 1,
    perPage = 20,
  ): Promise<{
    data: TestHistoryItem[];
    meta: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  }> {
    const response = await api.get<{
      data: TestHistoryItem[];
      meta: {
        page: number;
        per_page: number;
        total: number;
        total_pages: number;
      };
    }>('/tests/history', {
      params: {page, per_page: perPage},
    });
    return response.data;
  },
};

