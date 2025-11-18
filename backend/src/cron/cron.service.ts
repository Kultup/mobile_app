import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { UserTest } from '../tests/schemas/user-test.schema';
import { Question } from '../questions/schemas/question.schema';
import { PushToken } from '../push/schemas/push-token.schema';
import { PushService } from '../push/push.service';

@Injectable()
export class CronService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserTest.name) private userTestModel: Model<UserTest>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(PushToken.name) private pushTokenModel: Model<PushToken>,
    private pushService: PushService,
  ) {}

  // Генерація щоденних тестів о 00:00
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyTests() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Отримати всіх активних користувачів
    const users = await this.userModel.find({ is_active: true }).exec();

    // Отримати активні питання
    const questions = await this.questionModel.find({ is_active: true }).exec();

    if (questions.length < 5) {
      console.error('Not enough questions available for daily tests');
      return;
    }

    let generated = 0;
    for (const user of users) {
      // Перевірити чи вже є тест на сьогодні
      const existingTest = await this.userTestModel.findOne({
        user_id: user._id,
        test_date: today,
      }).exec();

      if (!existingTest) {
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
}

