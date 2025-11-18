import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KnowledgeBaseArticle } from './schemas/knowledge-base-article.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Helpers } from '../common/utils/helpers';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @InjectModel(KnowledgeBaseArticle.name) private articleModel: Model<KnowledgeBaseArticle>,
  ) {}

  async getArticles(query: PaginationDto & { category_id?: string; search?: string }) {
    const { page = 1, per_page = 20, category_id, search } = query;
    const skip = (page - 1) * per_page;

    const filter: any = { is_active: true };
    if (category_id) filter.category_id = category_id;
    if (search) {
      filter.$text = { $search: search };
    }

    const [data, total] = await Promise.all([
      this.articleModel
        .find(filter)
        .skip(skip)
        .limit(per_page)
        .populate('category_id', 'name')
        .sort({ createdAt: -1 })
        .exec(),
      this.articleModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: Helpers.generatePaginationMeta(page, per_page, total),
    };
  }

  async getArticle(id: string) {
    const article = await this.articleModel
      .findById(id)
      .populate('category_id', 'name')
      .exec();

    if (!article || !article.is_active) {
      throw new NotFoundException('Article not found');
    }

    // Збільшити кількість переглядів
    await this.articleModel.findByIdAndUpdate(id, { $inc: { views_count: 1 } }).exec();

    return article;
  }
}

