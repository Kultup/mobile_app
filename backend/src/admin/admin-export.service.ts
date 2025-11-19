import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as ExcelJS from 'exceljs';
import { User } from '../users/schemas/user.schema';
import { UserTest } from '../tests/schemas/user-test.schema';
import { SurveyResponse } from '../surveys/schemas/survey-response.schema';
import { Survey } from '../surveys/schemas/survey.schema';

@Injectable()
export class AdminExportService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserTest.name) private userTestModel: Model<UserTest>,
    @InjectModel(SurveyResponse.name) private surveyResponseModel: Model<SurveyResponse>,
    @InjectModel(Survey.name) private surveyModel: Model<Survey>,
  ) {}

  async exportStatisticsToExcel(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Статистика');

    worksheet.columns = [
      { header: 'ПІБ', key: 'full_name', width: 30 },
      { header: 'Місто', key: 'city', width: 20 },
      { header: 'Посада', key: 'position', width: 20 },
      { header: 'Загальний бал', key: 'total_score', width: 15 },
      { header: 'Баланс балів', key: 'points_balance', width: 15 },
      { header: 'Завершено тестів', key: 'tests_completed', width: 15 },
      { header: 'Поточна серія', key: 'current_streak', width: 15 },
      { header: 'Найдовша серія', key: 'longest_streak', width: 15 },
      { header: 'Останній тест', key: 'last_test_date', width: 15 },
      { header: 'Статус', key: 'status', width: 15 },
    ];

    const users = await this.userModel
      .find()
      .populate('city_id', 'name')
      .populate('position_id', 'name')
      .exec();

    users.forEach((user) => {
      worksheet.addRow({
        full_name: user.full_name,
        city: (user.city_id as any)?.name || '',
        position: (user.position_id as any)?.name || '',
        total_score: user.total_score,
        points_balance: user.points_balance,
        tests_completed: user.tests_completed,
        current_streak: user.current_streak,
        longest_streak: user.longest_streak,
        last_test_date: user.last_test_date ? new Date(user.last_test_date).toLocaleDateString('uk-UA') : '',
        status: user.is_active ? 'Активний' : 'Неактивний',
      });
    });

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  async exportSurveyResponsesToExcel(surveyId: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Відповіді');

    const survey = await this.surveyModel.findById(surveyId).exec();
    if (!survey) {
      throw new Error('Survey not found');
    }

    worksheet.columns = [
      { header: 'ПІБ', key: 'full_name', width: 30 },
      { header: 'Рейтинг', key: 'rating', width: 10 },
      { header: 'Відповідь', key: 'response_text', width: 50 },
      { header: 'Вибрані опції', key: 'selected_options', width: 40 },
      { header: 'Дата', key: 'date', width: 20 },
    ];

    const responses = await this.surveyResponseModel
      .find({ survey_id: surveyId })
      .populate('user_id', 'full_name')
      .sort({ createdAt: -1 })
      .exec();

    responses.forEach((response) => {
      worksheet.addRow({
        full_name: (response.user_id as any)?.full_name || '',
        rating: response.rating || '',
        response_text: response.response_text || '',
        selected_options: response.selected_options?.join(', ') || '',
        date: (response as any).createdAt ? new Date((response as any).createdAt).toLocaleDateString('uk-UA') : new Date().toLocaleDateString('uk-UA'),
      });
    });

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  async exportTestHistoryToExcel(userId?: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Історія тестів');

    worksheet.columns = [
      { header: 'ПІБ', key: 'full_name', width: 30 },
      { header: 'Дата тесту', key: 'test_date', width: 15 },
      { header: 'Правильних відповідей', key: 'correct_answers', width: 20 },
      { header: 'Всього питань', key: 'total_questions', width: 15 },
      { header: 'Балів', key: 'score', width: 10 },
      { header: 'Завершено', key: 'completed_at', width: 20 },
    ];

    const filter: any = { is_completed: true };
    if (userId) {
      filter.user_id = userId;
    }

    const tests = await this.userTestModel
      .find(filter)
      .populate('user_id', 'full_name')
      .sort({ completed_at: -1 })
      .exec();

    tests.forEach((test) => {
      worksheet.addRow({
        full_name: (test.user_id as any)?.full_name || '',
        test_date: new Date(test.test_date).toLocaleDateString('uk-UA'),
        correct_answers: test.correct_answers || 0,
        total_questions: test.questions_count || (test.answers?.length || 0),
        score: test.score || 0,
        completed_at: test.completed_at ? new Date(test.completed_at).toLocaleDateString('uk-UA') : ((test as any).updatedAt ? new Date((test as any).updatedAt).toLocaleDateString('uk-UA') : ''),
      });
    });

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }
}

