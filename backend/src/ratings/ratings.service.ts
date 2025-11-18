import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getGlobalRating(query: { limit?: number; page?: number }) {
    const { limit = 100, page = 1 } = query;
    const skip = (page - 1) * limit;

    const users = await this.userModel
      .find({ is_active: true })
      .populate('city_id', 'name')
      .populate('position_id', 'name')
      .sort({ total_score: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data: users.map((user, index) => ({
        position: skip + index + 1,
        user: {
          id: user._id,
          full_name: user.full_name,
          city: user.city_id,
          position: user.position_id,
        },
        total_score: user.total_score,
        tests_completed: user.tests_completed,
        current_streak: user.current_streak,
      })),
    };
  }

  async getByCity(query: { city_id: string; limit?: number; page?: number }) {
    const { city_id, limit = 100, page = 1 } = query;
    const skip = (page - 1) * limit;

    const users = await this.userModel
      .find({ is_active: true, city_id })
      .populate('city_id', 'name')
      .populate('position_id', 'name')
      .sort({ total_score: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data: users.map((user, index) => ({
        position: skip + index + 1,
        user: {
          id: user._id,
          full_name: user.full_name,
          city: user.city_id,
          position: user.position_id,
        },
        total_score: user.total_score,
        tests_completed: user.tests_completed,
        current_streak: user.current_streak,
      })),
    };
  }

  async getByPosition(query: { position_id: string; limit?: number; page?: number }) {
    const { position_id, limit = 100, page = 1 } = query;
    const skip = (page - 1) * limit;

    const users = await this.userModel
      .find({ is_active: true, position_id })
      .populate('city_id', 'name')
      .populate('position_id', 'name')
      .sort({ total_score: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data: users.map((user, index) => ({
        position: skip + index + 1,
        user: {
          id: user._id,
          full_name: user.full_name,
          city: user.city_id,
          position: user.position_id,
        },
        total_score: user.total_score,
        tests_completed: user.tests_completed,
        current_streak: user.current_streak,
      })),
    };
  }
}

