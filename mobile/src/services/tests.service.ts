import api from './api';
import type {DailyTest} from '../types';

export interface DailyTestResponse {
  test: DailyTest;
}

export const testsService = {
  /**
   * Get daily test
   */
  async getDailyTest(): Promise<DailyTest> {
    const response = await api.get<DailyTestResponse>('/tests/daily');
    return response.data.test;
  },

  /**
   * Start test
   */
  async startTest(testId: string): Promise<void> {
    await api.post(`/tests/${testId}/start`);
  },

  /**
   * Submit answer
   */
  async submitAnswer(
    testId: string,
    questionId: string,
    selectedAnswerIds: string[],
    textAnswer?: string,
  ): Promise<{
    is_correct: boolean;
    correct_answer?: string;
    explanation?: string;
    knowledge_base_article_id?: string;
  }> {
    const response = await api.post<{
      is_correct: boolean;
      correct_answer?: string;
      explanation?: string;
      knowledge_base_article_id?: string;
    }>(`/tests/${testId}/answer`, {
      question_id: questionId,
      selected_answer_ids: selectedAnswerIds,
      text_answer: textAnswer,
    });
    return response.data;
  },

  /**
   * Complete test
   */
  async completeTest(testId: string): Promise<{
    score: number;
    correct_answers: number;
    total_questions: number;
  }> {
    const response = await api.post<{
      score: number;
      correct_answers: number;
      total_questions: number;
    }>(`/tests/${testId}/complete`);
    return response.data;
  },

  /**
   * Get test history
   */
  async getHistory(page = 1, perPage = 10) {
    const response = await api.get<{
      data: DailyTest[];
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

