import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Achievement } from '../achievements/schemas/achievement.schema';
import { UserAchievement } from '../achievements/schemas/user-achievement.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateAchievementDto } from '../common/dto/create-achievement.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Helpers } from '../common/utils/helpers';

@Controller('admin/achievements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'training_admin')
export class AchievementsAdminController {
  constructor(
    @InjectModel(Achievement.name) private achievementModel: Model<Achievement>,
    @InjectModel(UserAchievement.name) private userAchievementModel: Model<UserAchievement>,
  ) {}

  @Get()
  async getAll(@Query() query: PaginationDto & { category?: string; is_active?: boolean }) {
    const { page = 1, per_page = 20, category, is_active } = query;
    const skip = (page - 1) * per_page;

    const filter: any = {};
    if (category) filter.category = category;
    if (is_active !== undefined) filter.is_active = is_active;

    const [data, total] = await Promise.all([
      this.achievementModel
        .find(filter)
        .skip(skip)
        .limit(per_page)
        .sort({ sort_order: 1, created_at: -1 })
        .exec(),
      this.achievementModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: Helpers.generatePaginationMeta(page, per_page, total),
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const achievement = await this.achievementModel.findById(id).exec();
    if (!achievement) {
      throw new NotFoundException('Achievement not found');
    }
    return achievement;
  }

  @Post()
  async create(@Body() createDto: CreateAchievementDto) {
    return this.achievementModel.create(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: Partial<CreateAchievementDto>) {
    const achievement = await this.achievementModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!achievement) {
      throw new NotFoundException('Achievement not found');
    }
    return achievement;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.achievementModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Achievement not found');
    }
    return { message: 'Achievement deleted successfully' };
  }

  @Get(':id/statistics')
  async getStatistics(@Param('id') id: string, @Query() query: PaginationDto) {
    const { page = 1, per_page = 20 } = query;
    const skip = (page - 1) * per_page;

    const achievement = await this.achievementModel.findById(id).exec();
    if (!achievement) {
      throw new NotFoundException('Achievement not found');
    }

    // Загальна статистика
    const totalUsers = await this.userAchievementModel.countDocuments({ achievement_id: id }).exec();
    const completedUsers = await this.userAchievementModel.countDocuments({
      achievement_id: id,
      is_completed: true,
    }).exec();
    const inProgressUsers = await this.userAchievementModel.countDocuments({
      achievement_id: id,
      is_completed: false,
      progress: { $gt: 0 },
    }).exec();

    // Список користувачів з ачівкою
    const [userAchievements, total] = await Promise.all([
      this.userAchievementModel
        .find({ achievement_id: id })
        .populate('user_id', 'full_name city_id position_id')
        .skip(skip)
        .limit(per_page)
        .sort({ completed_at: -1, progress: -1 })
        .exec(),
      this.userAchievementModel.countDocuments({ achievement_id: id }),
    ]);

    return {
      achievement: {
        id: achievement._id,
        name: achievement.name,
        description: achievement.description,
        condition_type: achievement.condition_type,
        condition_value: achievement.condition_value,
      },
      statistics: {
        total_users: totalUsers,
        completed_users: completedUsers,
        in_progress_users: inProgressUsers,
        locked_users: totalUsers - completedUsers - inProgressUsers,
        completion_rate: totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0,
      },
      users: {
        data: userAchievements.map((ua) => ({
          user: {
            id: ua.user_id['_id'],
            full_name: ua.user_id['full_name'],
            city: ua.user_id['city_id'],
            position: ua.user_id['position_id'],
          },
          progress: ua.progress,
          is_completed: ua.is_completed,
          completed_at: ua.completed_at,
        })),
        meta: Helpers.generatePaginationMeta(page, per_page, total),
      },
    };
  }
}

