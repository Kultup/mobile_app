import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KnowledgeBaseArticle } from '../knowledge-base/schemas/knowledge-base-article.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateKnowledgeArticleDto } from '../common/dto/create-knowledge-article.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Helpers } from '../common/utils/helpers';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('admin/knowledge-base/articles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'training_admin')
export class KnowledgeBaseAdminController {
  constructor(
    @InjectModel(KnowledgeBaseArticle.name) private articleModel: Model<KnowledgeBaseArticle>,
  ) {}

  @Get()
  async getAll(@Query() query: PaginationDto & { category_id?: string; search?: string; is_active?: boolean }) {
    const { page = 1, per_page = 20, category_id, search, is_active } = query;
    const skip = (page - 1) * per_page;

    const filter: any = {};
    if (category_id) filter.category_id = category_id;
    if (is_active !== undefined) filter.is_active = is_active;
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

  @Get(':id')
  async getById(@Param('id') id: string) {
    const article = await this.articleModel
      .findById(id)
      .populate('category_id', 'name')
      .exec();
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  @Post()
  async create(@Body() createDto: CreateKnowledgeArticleDto, @CurrentUser() user: any) {
    const article = new this.articleModel(createDto);
    return article.save();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: Partial<CreateKnowledgeArticleDto>) {
    const article = await this.articleModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .populate('category_id', 'name')
      .exec();
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.articleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Article not found');
    }
    return { message: 'Article deleted successfully' };
  }
}

