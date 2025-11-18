import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedbackQuestion } from '../common/schemas/feedback-question.schema';
import { FeedbackErrorReport } from '../common/schemas/feedback-error-report.schema';
import { SuggestQuestionDto } from '../common/dto/suggest-question.dto';
import { ReportErrorDto } from '../common/dto/report-error.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(FeedbackQuestion.name) private feedbackQuestionModel: Model<FeedbackQuestion>,
    @InjectModel(FeedbackErrorReport.name) private feedbackErrorReportModel: Model<FeedbackErrorReport>,
  ) {}

  async suggestQuestion(userId: string, dto: SuggestQuestionDto) {
    const feedback = new this.feedbackQuestionModel({
      user_id: userId,
      question_text: dto.question_text,
      suggested_answers: dto.suggested_answers || [],
      category_id: dto.category_id,
      comment: dto.comment,
    });

    await feedback.save();

    return {
      message: 'Дякуємо за пропозицію! Ваше питання буде розглянуто адміністратором.',
    };
  }

  async reportError(userId: string, dto: ReportErrorDto) {
    const report = new this.feedbackErrorReportModel({
      user_id: userId,
      question_id: dto.question_id,
      description: dto.description,
      screenshot_url: dto.screenshot_url,
    });

    await report.save();

    return {
      message: 'Дякуємо за повідомлення! Помилка буде перевірена адміністратором.',
    };
  }
}

