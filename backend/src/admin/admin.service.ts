import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AdminUser } from './schemas/admin-user.schema';
import { User } from '../users/schemas/user.schema';
import { UserTest } from '../tests/schemas/user-test.schema';
import { FeedbackQuestion } from '../common/schemas/feedback-question.schema';
import { FeedbackErrorReport } from '../common/schemas/feedback-error-report.schema';
import { AdminActivityLog } from '../common/schemas/admin-activity-log.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Helpers } from '../common/utils/helpers';
import { CreateAdminUserDto } from '../common/dto/create-admin-user.dto';
import { UpdateAdminUserDto } from '../common/dto/update-admin-user.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(AdminUser.name) private adminUserModel: Model<AdminUser>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserTest.name) private userTestModel: Model<UserTest>,
    @InjectModel(FeedbackQuestion.name) private feedbackQuestionModel: Model<FeedbackQuestion>,
    @InjectModel(FeedbackErrorReport.name) private feedbackErrorReportModel: Model<FeedbackErrorReport>,
    @InjectModel(AdminActivityLog.name) private adminActivityLogModel: Model<AdminActivityLog>,
  ) {}

  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalUsers = await this.userModel.countDocuments({ is_active: true });
    
    // Активні сьогодні (які мають тест на сьогодні)
    const activeToday = await this.userTestModel.countDocuments({
      test_date: { $gte: today, $lt: tomorrow },
    });

    const testsCompleted = await this.userTestModel.countDocuments({
      is_completed: true,
      test_date: { $gte: today, $lt: tomorrow },
    });

    // Топ міст за кількістю користувачів
    const topCities = await this.userModel.aggregate([
      { $match: { is_active: true, city_id: { $exists: true, $ne: null } } },
      { $group: { _id: '$city_id', userCount: { $sum: 1 } } },
      { $sort: { userCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'cities',
          localField: '_id',
          foreignField: '_id',
          as: 'city',
        },
      },
      { $unwind: '$city' },
      { $project: { city_id: '$_id', city_name: '$city.name', userCount: 1 } },
    ]);

    // Топ посад за кількістю користувачів
    const topPositions = await this.userModel.aggregate([
      { $match: { is_active: true, position_id: { $exists: true, $ne: null } } },
      { $group: { _id: '$position_id', userCount: { $sum: 1 } } },
      { $sort: { userCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'positions',
          localField: '_id',
          foreignField: '_id',
          as: 'position',
        },
      },
      { $unwind: '$position' },
      { $project: { position_id: '$_id', position_name: '$position.name', userCount: 1 } },
    ]);

    // Активність за останні 7 днів
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const completed = await this.userTestModel.countDocuments({
        is_completed: true,
        test_date: { $gte: date, $lt: nextDate },
      });

      const total = await this.userTestModel.countDocuments({
        test_date: { $gte: date, $lt: nextDate },
      });

      last7Days.push({
        date: date.toISOString().split('T')[0],
        completed,
        total,
      });
    }

    // Останні події (останні 10 дій адміністраторів)
    const recentActivity = await this.adminActivityLogModel
      .find()
      .populate('admin_user_id', 'username')
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();

    // Дані для теплової карти (останній рік)
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const heatmapData = await this.userTestModel.aggregate([
      {
        $match: {
          is_completed: true,
          test_date: { $gte: oneYearAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$test_date' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          date: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    return {
      total_users: totalUsers,
      active_today: activeToday,
      tests_completed: testsCompleted,
      completion_rate: activeToday > 0 ? (testsCompleted / activeToday) * 100 : 0,
      top_cities: topCities,
      top_positions: topPositions,
      activity_last_7_days: last7Days,
      recent_activity: recentActivity.map((log) => ({
        id: log._id.toString(),
        admin_user: (log.admin_user_id as any)?.username || 'Unknown',
        action: log.action,
        entity_type: log.entity_type,
        description: log.description,
        created_at: (log as any).createdAt || log._id.getTimestamp(),
      })),
      heatmap_data: heatmapData,
    };
  }

  async getUsers(query: PaginationDto & { city_id?: string; position_id?: string; is_active?: boolean; search?: string }) {
    const { page = 1, per_page = 20, city_id, position_id, is_active, search } = query;
    const skip = (page - 1) * per_page;

    const filter: any = {};
    if (city_id) filter.city_id = city_id;
    if (position_id) filter.position_id = position_id;
    if (is_active !== undefined) filter.is_active = is_active;
    if (search) {
      filter.full_name = { $regex: search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .skip(skip)
        .limit(per_page)
        .populate('city_id', 'name')
        .populate('position_id', 'name')
        .sort({ created_at: -1 })
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: Helpers.generatePaginationMeta(page, per_page, total),
    };
  }

  async updateUser(id: string, updateDto: any) {
    const user = await this.userModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findByIdAndUpdate(id, { is_active: false }, { new: true }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deactivated successfully' };
  }

  async getAdminUsers(query: PaginationDto) {
    const { page = 1, per_page = 20 } = query;
    const skip = (page - 1) * per_page;

    const [data, total] = await Promise.all([
      this.adminUserModel
        .find()
        .skip(skip)
        .limit(per_page)
        .select('-password_hash')
        .sort({ created_at: -1 })
        .exec(),
      this.adminUserModel.countDocuments(),
    ]);

    return {
      data,
      meta: Helpers.generatePaginationMeta(page, per_page, total),
    };
  }

  async createAdminUser(createDto: CreateAdminUserDto) {
    // Перевірити чи не існує
    const existing = await this.adminUserModel.findOne({
      $or: [{ username: createDto.username }, { email: createDto.email }],
    }).exec();

    if (existing) {
      throw new Error('Admin user with this username or email already exists');
    }

    const passwordHash = await bcrypt.hash(createDto.password, 10);
    const adminUser = new this.adminUserModel({
      username: createDto.username,
      email: createDto.email,
      password_hash: passwordHash,
      role: createDto.role || 'viewer',
    });

    await adminUser.save();
    const { password_hash, ...result } = adminUser.toObject();
    return result;
  }

  async updateAdminUser(id: string, updateDto: UpdateAdminUserDto) {
    const updateData: any = { ...updateDto };
    
    if (updateDto.password) {
      updateData.password_hash = await bcrypt.hash(updateDto.password, 10);
      delete updateData.password;
    }

    const adminUser = await this.adminUserModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!adminUser) {
      throw new NotFoundException('Admin user not found');
    }

    const { password_hash, ...result } = adminUser.toObject();
    return result;
  }

  async deleteAdminUser(id: string) {
    const adminUser = await this.adminUserModel.findByIdAndUpdate(id, { is_active: false }, { new: true }).exec();
    if (!adminUser) {
      throw new NotFoundException('Admin user not found');
    }
    return { message: 'Admin user deactivated successfully' };
  }

  async getFeedbackQuestions(query: PaginationDto & { is_reviewed?: boolean }) {
    const { page = 1, per_page = 20, is_reviewed } = query;
    const skip = (page - 1) * per_page;

    const filter: any = {};
    if (is_reviewed !== undefined) {
      filter.is_reviewed = is_reviewed;
    }

    const [data, total] = await Promise.all([
      this.feedbackQuestionModel
        .find(filter)
        .skip(skip)
        .limit(per_page)
        .populate('user_id', 'full_name city_id position_id')
        .populate('category_id', 'name')
        .populate('reviewed_by', 'username')
        .sort({ created_at: -1 })
        .exec(),
      this.feedbackQuestionModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: Helpers.generatePaginationMeta(page, per_page, total),
    };
  }

  async getFeedbackErrorReports(query: PaginationDto & { is_reviewed?: boolean }) {
    const { page = 1, per_page = 20, is_reviewed } = query;
    const skip = (page - 1) * per_page;

    const filter: any = {};
    if (is_reviewed !== undefined) {
      filter.is_reviewed = is_reviewed;
    }

    const [data, total] = await Promise.all([
      this.feedbackErrorReportModel
        .find(filter)
        .skip(skip)
        .limit(per_page)
        .populate('user_id', 'full_name city_id position_id')
        .populate('question_id', 'question_text')
        .populate('reviewed_by', 'username')
        .sort({ created_at: -1 })
        .exec(),
      this.feedbackErrorReportModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: Helpers.generatePaginationMeta(page, per_page, total),
    };
  }

  async markFeedbackQuestionReviewed(id: string, adminUserId: string) {
    const feedback = await this.feedbackQuestionModel.findByIdAndUpdate(
      id,
      { is_reviewed: true, reviewed_by: adminUserId },
      { new: true },
    ).exec();
    if (!feedback) {
      throw new NotFoundException('Feedback question not found');
    }
    return feedback;
  }

  async markErrorReportReviewed(id: string, adminUserId: string) {
    const report = await this.feedbackErrorReportModel.findByIdAndUpdate(
      id,
      { is_reviewed: true, reviewed_by: adminUserId },
      { new: true },
    ).exec();
    if (!report) {
      throw new NotFoundException('Error report not found');
    }
    return report;
  }

  async getActivityLogs(query: PaginationDto & { admin_user_id?: string; action_type?: string; entity_type?: string; start_date?: string; end_date?: string }) {
    const { page = 1, per_page = 20, admin_user_id, action_type, entity_type, start_date, end_date } = query;
    const skip = (page - 1) * per_page;

    const filter: any = {};
    if (admin_user_id) filter.admin_user_id = admin_user_id;
    if (action_type) filter.action = action_type; // Схема використовує 'action', а не 'action_type'
    if (entity_type) filter.entity_type = entity_type;
    if (start_date || end_date) {
      filter.createdAt = {}; // Mongoose timestamps використовує createdAt
      if (start_date) filter.createdAt.$gte = new Date(start_date);
      if (end_date) {
        const end = new Date(end_date);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const [data, total] = await Promise.all([
      this.adminActivityLogModel
        .find(filter)
        .skip(skip)
        .limit(per_page)
        .populate('admin_user_id', 'username email')
        .sort({ createdAt: -1 })
        .exec(),
      this.adminActivityLogModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: Helpers.generatePaginationMeta(page, per_page, total),
    };
  }

  async getUserDetails(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate('city_id', 'name')
      .populate('position_id', 'name')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalTests = await this.userTestModel.countDocuments({ user_id: userId, is_completed: true });
    const completedTests = await this.userTestModel
      .find({ user_id: userId, is_completed: true })
      .sort({ test_date: -1 })
      .limit(30)
      .exec();

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

    // Статистика за останні 7 днів для графіка
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayTests = await this.userTestModel.find({
        user_id: userId,
        is_completed: true,
        test_date: { $gte: date, $lt: nextDate },
      }).exec();

      const dayCorrect = dayTests.reduce((sum, test) => sum + test.correct_answers, 0);
      const dayTotal = dayTests.reduce((sum, test) => sum + test.questions_count, 0);
      const dayPercentage = dayTotal > 0 ? (dayCorrect / dayTotal) * 100 : 0;

      last7Days.push({
        date: date.toISOString().split('T')[0],
        tests_completed: dayTests.length,
        correct_percentage: dayPercentage,
      });
    }

    return {
      user: {
        _id: user._id,
        full_name: user.full_name,
        city_id: user.city_id,
        position_id: user.position_id,
        total_score: user.total_score,
        points_balance: user.points_balance,
        tests_completed: user.tests_completed,
        current_streak: user.current_streak,
        longest_streak: user.longest_streak,
        is_active: user.is_active,
        created_at: (user as any).created_at || user._id.getTimestamp(),
      },
      statistics: {
        total_tests: totalTests,
        correct_answers_percentage: correctPercentage,
        correct_answers_percentage_month: recentPercentage,
        progress_last_7_days: last7Days,
        recent_tests: completedTests.slice(0, 10).map((test) => ({
          _id: test._id,
          test_date: test.test_date,
          questions_count: test.questions_count,
          correct_answers: test.correct_answers,
          score: test.score,
        })),
      },
    };
  }
}

