import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Achievement } from './schemas/achievement.schema';
import { UserAchievement } from './schemas/user-achievement.schema';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectModel(Achievement.name) private achievementModel: Model<Achievement>,
    @InjectModel(UserAchievement.name) private userAchievementModel: Model<UserAchievement>,
  ) {}

  async getAchievements(userId: string) {
    const userAchievements = await this.userAchievementModel
      .find({ user_id: userId })
      .populate('achievement_id')
      .exec();

    return {
      data: userAchievements.map((ua) => ({
        id: ua.achievement_id['_id'],
        name: ua.achievement_id['name'],
        description: ua.achievement_id['description'],
        icon_url: ua.achievement_id['icon_url'],
        category: ua.achievement_id['category'],
        progress: ua.progress,
        condition_value: ua.achievement_id['condition_value'],
        is_completed: ua.is_completed,
        completed_at: ua.completed_at,
        reward_points: ua.achievement_id['reward_points'],
      })),
    };
  }

  async getAllAchievements(userId: string) {
    const allAchievements = await this.achievementModel.find({ is_active: true }).sort({ sort_order: 1 }).exec();
    const userAchievements = await this.userAchievementModel.find({ user_id: userId }).exec();

    const userAchievementsMap = new Map(
      userAchievements.map((ua) => [ua.achievement_id.toString(), ua]),
    );

    const result = allAchievements.map((achievement) => {
      const userAchievement = userAchievementsMap.get(achievement._id.toString());
      return {
        id: achievement._id,
        name: achievement.name,
        description: achievement.description,
        icon_url: achievement.icon_url,
        category: achievement.category,
        progress: userAchievement?.progress || 0,
        condition_value: achievement.condition_value,
        is_completed: userAchievement?.is_completed || false,
        completed_at: userAchievement?.completed_at || null,
        reward_points: achievement.reward_points,
      };
    });

    return {
      total_achievements: result.length,
      completed: result.filter((a) => a.is_completed).length,
      in_progress: result.filter((a) => !a.is_completed && a.progress > 0).length,
      locked: result.filter((a) => !a.is_completed && a.progress === 0).length,
      achievements: result,
    };
  }
}

