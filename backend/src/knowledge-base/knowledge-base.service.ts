import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KnowledgeBaseArticle } from './schemas/knowledge-base-article.schema';
import { User } from '../users/schemas/user.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Helpers } from '../common/utils/helpers';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @InjectModel(KnowledgeBaseArticle.name) private articleModel: Model<KnowledgeBaseArticle>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getArticles(query: PaginationDto & { category_id?: string; search?: string }, userId?: string) {
    const { page = 1, per_page = 20, category_id, search } = query;
    const skip = (page - 1) * per_page;

    // Отримати користувача з position_id для фільтрації
    let userPositionId: any = null;
    if (userId) {
      const user = await this.userModel.findById(userId).exec();
      if (user && user.position_id) {
        userPositionId = user.position_id;
      }
    }

    const filter: any = { is_active: true };
    if (category_id) filter.category_id = category_id;
    if (search) {
      filter.$text = { $search: search };
    }

    // Фільтр статей: доступні всім (без position_id) або для посади користувача
    if (userPositionId) {
      filter.$or = [
        { position_id: { $exists: false } },
        { position_id: null },
        { position_id: userPositionId },
      ];
    }

    const [data, total] = await Promise.all([
      this.articleModel
        .find(filter)
        .skip(skip)
        .limit(per_page)
        .populate('category_id', 'name')
        .populate('position_id', 'name')
        .sort({ createdAt: -1 })
        .exec(),
      this.articleModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: Helpers.generatePaginationMeta(page, per_page, total),
    };
  }

  async getArticle(id: string, userId?: string) {
    // Отримати користувача з position_id для перевірки доступу
    let userPositionId: any = null;
    if (userId) {
      const user = await this.userModel.findById(userId).exec();
      if (user && user.position_id) {
        userPositionId = user.position_id;
      }
    }

    const article = await this.articleModel
      .findById(id)
      .populate('category_id', 'name')
      .populate('position_id', 'name')
      .exec();

    if (!article || !article.is_active) {
      throw new NotFoundException('Article not found');
    }

    // Перевірити, чи стаття доступна для користувача
    // Стаття доступна, якщо вона без position_id або position_id відповідає посаді користувача
    if (article.position_id) {
      const articlePositionId = typeof article.position_id === 'object' && article.position_id !== null
        ? (article.position_id as any)._id?.toString() 
        : (article.position_id as any)?.toString();
      
      if (userPositionId && articlePositionId && articlePositionId !== userPositionId.toString()) {
        throw new NotFoundException('Article not found');
      }
    }

    // Збільшити кількість переглядів
    await this.articleModel.findByIdAndUpdate(id, { $inc: { views_count: 1 } }).exec();

    return article;
  }
}

