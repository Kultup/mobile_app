import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Achievement } from './schemas/achievement.schema';
import { UserAchievement } from './schemas/user-achievement.schema';
import { User } from '../users/schemas/user.schema';
import { UserTest } from '../tests/schemas/user-test.schema';
import { PointsTransaction } from '../shop/schemas/points-transaction.schema';
import { PushService } from '../push/push.service';

@Injectable()
export class AchievementsCheckerService {
  constructor(
    @InjectModel(Achievement.name) private achievementModel: Model<Achievement>,
    @InjectModel(UserAchievement.name) private userAchievementModel: Model<UserAchievement>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserTest.name) private userTestModel: Model<UserTest>,
    @InjectModel(PointsTransaction.name) private pointsTransactionModel: Model<PointsTransaction>,
    private pushService: PushService,
  ) {}

  async checkAchievements(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return { new_achievements: [] };

    // Отримати всі активні ачівки
    const achievements = await this.achievementModel.find({ is_active: true }).exec();

    // Отримати поточні ачівки користувача
    const userAchievements = await this.userAchievementModel.find({ user_id: userId }).exec();
    const userAchievementsMap = new Map(
      userAchievements.map((ua) => [ua.achievement_id.toString(), ua]),
    );

    const newAchievements = [];

    for (const achievement of achievements) {
      const userAchievement = userAchievementsMap.get(achievement._id.toString());
      
      // Якщо вже отримано, пропускаємо
      if (userAchievement?.is_completed) continue;

      let progress = 0;
      let isCompleted = false;

      // Перевірити умову залежно від типу
      switch (achievement.condition_type) {
        case 'tests_count':
          progress = user.tests_completed;
          isCompleted = progress >= achievement.condition_value;
          break;

        case 'streak':
          progress = user.current_streak;
          isCompleted = progress >= achievement.condition_value;
          break;

        case 'perfect_tests':
          // Підрахувати ідеальні тести (5/5)
          const perfectTests = await this.userTestModel.countDocuments({
            user_id: userId,
            is_completed: true,
            correct_answers: 5,
            questions_count: 5,
          }).exec();
          progress = perfectTests;
          isCompleted = progress >= achievement.condition_value;
          break;

        case 'rating_position':
          // TODO: Реалізувати перевірку позиції в рейтингу
          // Потрібно підрахувати позицію користувача в глобальному рейтингу
          break;
      }

      // Оновити або створити user_achievement
      if (userAchievement) {
        userAchievement.progress = progress;
        if (isCompleted && !userAchievement.is_completed) {
          userAchievement.is_completed = true;
          userAchievement.completed_at = new Date();
          newAchievements.push(achievement);

          // Нарахувати бонусні бали
          if (achievement.reward_points > 0) {
            const newBalance = user.points_balance + achievement.reward_points;
            await this.userModel.findByIdAndUpdate(userId, {
              points_balance: newBalance,
            }).exec();

            await this.pointsTransactionModel.create({
              user_id: userId,
              transaction_type: 'bonus',
              amount: achievement.reward_points,
              source: 'achievement',
              source_id: achievement._id,
              description: `Achievement unlocked: ${achievement.name}`,
              balance_after: newBalance,
            });

            // Відправити push-повідомлення
            await this.pushService.sendNotification(userId, {
              title: '🎉 Нова ачівка!',
              body: `Ви отримали ачівку "${achievement.name}"`,
              data: {
                type: 'achievement',
                achievement_id: achievement._id.toString(),
              },
            });
          }
        }
        await userAchievement.save();
      } else {
        // Створити новий user_achievement
        const newUserAchievement = new this.userAchievementModel({
          user_id: userId,
          achievement_id: achievement._id,
          progress: progress,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date() : null,
        });

        if (isCompleted) {
          newAchievements.push(achievement);

          // Нарахувати бонусні бали
          if (achievement.reward_points > 0) {
            const newBalance = user.points_balance + achievement.reward_points;
            await this.userModel.findByIdAndUpdate(userId, {
              points_balance: newBalance,
            }).exec();

            await this.pointsTransactionModel.create({
              user_id: userId,
              transaction_type: 'bonus',
              amount: achievement.reward_points,
              source: 'achievement',
              source_id: achievement._id,
              description: `Achievement unlocked: ${achievement.name}`,
              balance_after: newBalance,
            });

            // Відправити push-повідомлення
            await this.pushService.sendNotification(userId, {
              title: '🎉 Нова ачівка!',
              body: `Ви отримали ачівку "${achievement.name}"`,
              data: {
                type: 'achievement',
                achievement_id: achievement._id.toString(),
              },
            });
          }
        }

        await newUserAchievement.save();
      }
    }

    return {
      new_achievements: newAchievements.map((a) => ({
        id: a._id,
        name: a.name,
        description: a.description,
        icon_url: a.icon_url,
        reward_points: a.reward_points,
      })),
    };
  }
}

