import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { UserTest } from '../tests/schemas/user-test.schema';
import { Question } from '../questions/schemas/question.schema';
import { Position } from '../common/schemas/position.schema';
import { PushToken } from '../push/schemas/push-token.schema';
import { AdminActivityLog } from '../common/schemas/admin-activity-log.schema';
import { PushService } from '../push/push.service';

@Injectable()
export class CronService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserTest.name) private userTestModel: Model<UserTest>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(Position.name) private positionModel: Model<Position>,
    @InjectModel(PushToken.name) private pushTokenModel: Model<PushToken>,
    @InjectModel(AdminActivityLog.name) private adminActivityLogModel: Model<AdminActivityLog>,
    private pushService: PushService,
  ) {}

  // Генерація щоденних тестів о 00:00
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyTests() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Отримати всіх активних користувачів
    const users = await this.userModel.find({ is_active: true }).exec();

    let generated = 0;
    for (const user of users) {
      // Перевірити чи вже є тест на сьогодні
      const existingTest = await this.userTestModel.findOne({
        user_id: user._id,
        test_date: today,
      }).exec();

      if (!existingTest) {
        // Отримати посаду користувача з категоріями
        let positionCategoryIds: any[] = [];
        if (user.position_id) {
          const position = await this.positionModel.findById(user.position_id).exec();
          if (position && position.category_ids && position.category_ids.length > 0) {
            positionCategoryIds = position.category_ids.map((id: any) => id.toString ? id.toString() : id);
          }
        }

        // Фільтр питань: доступні всім (без position_id) або для посади користувача
        const questionFilter: any = {
          is_active: true,
          $or: [
            { position_id: { $exists: false } },
            { position_id: null },
            ...(user.position_id ? [{ position_id: user.position_id }] : []),
          ],
        };

        // Якщо у посади є прив'язані категорії, фільтруємо питання за цими категоріями
        if (positionCategoryIds.length > 0) {
          questionFilter.category_id = { $in: positionCategoryIds };
        }

        // Отримати активні питання для цього користувача (з урахуванням посади та категорій посади)
        const questions = await this.questionModel.find(questionFilter).exec();

        if (questions.length < 5) {
          console.warn(`Not enough questions available for user ${user._id} (position: ${user.position_id})`);
          continue;
        }

        // Випадково вибрати 5 питань
        const shuffled = questions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffled.slice(0, 5);

        const test = new this.userTestModel({
          user_id: user._id,
          test_date: today,
          questions_count: 5,
          answers: selectedQuestions.map((q) => ({
            question_id: q._id,
            selected_answer_ids: [],
            is_correct: false,
          })),
        });

        await test.save();
        generated++;
      }
    }

    console.log(`Generated ${generated} daily tests for ${today.toISOString().split('T')[0]}`);
  }

  // Розсилка push-повідомлень о 12:00
  @Cron('0 12 * * *')
  async sendDailyTestNotifications() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Знайти користувачів, які ще не почали тест сьогодні
    const tests = await this.userTestModel.find({
      test_date: today,
      started_at: null,
    }).populate('user_id').exec();

    let sent = 0;
    for (const test of tests) {
      const user = test.user_id as any;
      if (user && user.is_active) {
        // Отримати push-токени користувача
        const tokens = await this.pushTokenModel.find({
          user_id: user._id,
          is_active: true,
        }).exec();

        for (const token of tokens) {
          await this.pushService.sendNotification(user._id.toString(), {
            title: 'Новий щоденний тест!',
            body: 'Час пройти сьогоднішній тест з 5 питань',
            data: {
              type: 'daily_test',
              test_id: test._id.toString(),
            },
          });
        }
        sent++;
      }
    }

    console.log(`Sent ${sent} daily test notifications`);
  }

  // Нагадування за 3 години до дедлайну (21:00)
  @Cron('0 21 * * *')
  async sendReminder3Hours() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Знайти тести, які не завершені
    const tests = await this.userTestModel.find({
      test_date: today,
      is_completed: false,
    }).populate('user_id').exec();

    let sent = 0;
    for (const test of tests) {
      const user = test.user_id as any;
      if (user && user.is_active) {
        const tokens = await this.pushTokenModel.find({
          user_id: user._id,
          is_active: true,
        }).exec();

        for (const token of tokens) {
          await this.pushService.sendNotification(user._id.toString(), {
            title: 'Нагадування про тест',
            body: 'Залишилось 3 години до завершення сьогоднішнього тесту',
            data: {
              type: 'test_reminder',
              test_id: test._id.toString(),
            },
          });
        }
        sent++;
      }
    }

    console.log(`Sent ${sent} 3-hour reminders`);
  }

  // Нагадування за 1 годину до дедлайну (23:00)
  @Cron('0 23 * * *')
  async sendReminder1Hour() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Знайти тести, які не завершені
    const tests = await this.userTestModel.find({
      test_date: today,
      is_completed: false,
    }).populate('user_id').exec();

    let sent = 0;
    for (const test of tests) {
      const user = test.user_id as any;
      if (user && user.is_active) {
        const tokens = await this.pushTokenModel.find({
          user_id: user._id,
          is_active: true,
        }).exec();

        for (const token of tokens) {
          await this.pushService.sendNotification(user._id.toString(), {
            title: 'Останнє нагадування!',
            body: 'Залишилась 1 година до завершення сьогоднішнього тесту',
            data: {
              type: 'test_reminder',
              test_id: test._id.toString(),
            },
          });
        }
        sent++;
      }
    }

    console.log(`Sent ${sent} 1-hour reminders`);
  }

  // Оновлення рейтингів (щогодини) - перевірка та логування статистики
  @Cron('0 * * * *') // Кожну годину
  async updateRatings() {
    try {
      // Підрахунок загальної статистики рейтингів
      const totalUsers = await this.userModel.countDocuments({ is_active: true }).exec();
      const usersWithScore = await this.userModel.countDocuments({
        is_active: true,
        total_score: { $gt: 0 },
      }).exec();

      // Топ-10 користувачів
      const topUsers = await this.userModel
        .find({ is_active: true })
        .sort({ total_score: -1 })
        .limit(10)
        .select('full_name total_score tests_completed current_streak')
        .exec();

      console.log(`[CronService] Ratings update check:`, {
        totalUsers,
        usersWithScore,
        topUsersCount: topUsers.length,
        topScore: topUsers[0]?.total_score || 0,
      });

      // Можна додати кешування або інші операції тут
    } catch (error) {
      console.error('[CronService] Error updating ratings:', error);
    }
  }

  // Очищення старих логів (щодня о 02:00)
  @Cron('0 2 * * *') // О 02:00 щодня
  async cleanOldLogs() {
    try {
      // Видаляємо логи старше 90 днів
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      cutoffDate.setHours(0, 0, 0, 0);

      const result = await this.adminActivityLogModel.deleteMany({
        createdAt: { $lt: cutoffDate },
      }).exec();

      console.log(`[CronService] Cleaned ${result.deletedCount} old activity logs (older than 90 days)`);
    } catch (error) {
      console.error('[CronService] Error cleaning old logs:', error);
    }
  }
}

