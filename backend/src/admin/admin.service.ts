import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AdminUser } from './schemas/admin-user.schema';
import { User } from '../users/schemas/user.schema';
import { UserTest } from '../tests/schemas/user-test.schema';
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

    return {
      total_users: totalUsers,
      active_today: activeToday,
      tests_completed: testsCompleted,
      completion_rate: activeToday > 0 ? (testsCompleted / activeToday) * 100 : 0,
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
}

