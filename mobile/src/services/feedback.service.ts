import api from './api';
import type {Survey, SuggestQuestionData, ReportErrorData} from '../types';

export interface SurveyResponse {
  data: Survey[];
}

export const feedbackService = {
  /**
   * Get active surveys
   */
  async getSurveys(): Promise<SurveyResponse> {
    const response = await api.get<SurveyResponse>('/surveys');
    return response.data;
  },

  /**
   * Respond to survey
   */
  async respondToSurvey(
    surveyId: string,
    data: {
      rating?: number;
      response_text?: string;
      selected_options?: string[];
    },
  ): Promise<{message: string}> {
    const response = await api.post<{message: string}>(
      `/surveys/${surveyId}/respond`,
      data,
    );
    return response.data;
  },

  /**
   * Suggest a question
   */
  async suggestQuestion(
    data: SuggestQuestionData,
  ): Promise<{message: string}> {
    const response = await api.post<{message: string}>(
      '/feedback/question',
      data,
    );
    return response.data;
  },

  /**
   * Report an error
   */
  async reportError(data: ReportErrorData): Promise<{message: string}> {
    const response = await api.post<{message: string}>(
      '/feedback/report-error',
      data,
    );
    return response.data;
  },
};

