import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { UserTest } from '../tests/schemas/user-test.schema';
import { PointsTransaction } from '../shop/schemas/points-transaction.schema';
import { UpdateProfileDto } from '../common/dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserTest.name) private userTestModel: Model<UserTest>,
    @InjectModel(PointsTransaction.name) private pointsTransactionModel: Model<PointsTransaction>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('city_id', 'name')
      .populate('position_id', 'name')
      .populate('avatar_id', 'name image_url')
      .populate('profile_frame_id', 'name image_url')
      .populate('active_badges', 'name image_url')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto) {
    const user = await this.userModel.findByIdAndUpdate(userId, updateDto, { new: true }).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getStatistics(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalTests = await this.userTestModel.countDocuments({ user_id: userId, is_completed: true });
    const completedTests = await this.userTestModel.find({ user_id: userId, is_completed: true }).exec();
    
    const correctAnswers = completedTests.reduce((sum, test) => sum + test.correct_answers, 0);
    const totalQuestions = completedTests.reduce((sum, test) => sum + test.questions_count, 0);
    const correctPercentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Останні 30 днів
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTests = await this.userTestModel.find({
      user_id: userId,
      is_completed: true,
      test_date: { $gte: thirtyDaysAgo },
    }).exec();

    const recentCorrect = recentTests.reduce((sum, test) => sum + test.correct_answers, 0);
    const recentTotal = recentTests.reduce((sum, test) => sum + test.questions_count, 0);
    const recentPercentage = recentTotal > 0 ? (recentCorrect / recentTotal) * 100 : 0;

    return {
      total_tests: totalTests,
      total_score: user.total_score,
      correct_answers_percentage: correctPercentage,
      correct_answers_percentage_month: recentPercentage,
      current_streak: user.current_streak,
      longest_streak: user.longest_streak,
      progress_chart: [], // TODO: Implement progress chart data
    };
  }

  async getBalance(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const transactions = await this.pointsTransactionModel
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .limit(10)
      .exec();

    const totalEarned = await this.pointsTransactionModel.aggregate([
      { $match: { user_id: userId, transaction_type: { $in: ['earned', 'bonus'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalSpent = await this.pointsTransactionModel.aggregate([
      { $match: { user_id: userId, transaction_type: 'spent' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return {
      balance: user.points_balance,
      total_earned: totalEarned[0]?.total || 0,
      total_spent: Math.abs(totalSpent[0]?.total || 0),
      recent_transactions: transactions,
    };
  }
}

