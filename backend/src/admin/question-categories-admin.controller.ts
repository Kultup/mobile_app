import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QuestionCategory } from '../questions/schemas/question-category.schema';
import { Question } from '../questions/schemas/question.schema';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin/questions/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'training_admin')
export class QuestionCategoriesAdminController {
  constructor(
    @InjectModel(QuestionCategory.name) private categoryModel: Model<QuestionCategory>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  @Get()
  async getAll(@Query('include_inactive') includeInactive?: string) {
    const filter: any = {};
    if (includeInactive !== 'true') {
      filter.is_active = true;
    }
    const categories = await this.categoryModel
      .find(filter)
      .populate('parent_id', 'name')
      .sort({ sort_order: 1, name: 1 })
      .exec();
    return { data: categories };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const category = await this.categoryModel
      .findById(id)
      .populate('parent_id', 'name')
      .exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  @Post()
  async create(@Body() createDto: { name: string; parent_id?: string; sort_order?: number; is_active?: boolean }) {
    const category = new this.categoryModel(createDto);
    return category.save();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: Partial<{ name: string; parent_id?: string; sort_order?: number; is_active?: boolean }>) {
    const category = await this.categoryModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    // Перевірити чи є питання в цій категорії
    const questionsCount = await this.questionModel.countDocuments({ category_id: id }).exec();
    
    if (questionsCount > 0) {
      throw new BadRequestException(`Cannot delete category: ${questionsCount} question(s) are using this category`);
    }

    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Category not found');
    }
    return { message: 'Category deleted successfully' };
  }
}

