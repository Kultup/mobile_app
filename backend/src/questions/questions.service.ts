import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from './schemas/question.schema';
import { QuestionCategory } from './schemas/question-category.schema';
import { CreateQuestionDto } from '../common/dto/create-question.dto';
import { UpdateQuestionDto } from '../common/dto/update-question.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { Helpers } from '../common/utils/helpers';
import { FilesService } from '../files/files.service';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(QuestionCategory.name) private categoryModel: Model<QuestionCategory>,
    private filesService: FilesService,
  ) {}

  async findAll(query: PaginationDto & { category_id?: string; position_id?: string; is_active?: boolean; search?: string }) {
    const { page = 1, per_page = 20, category_id, position_id, is_active, search } = query;
    const skip = (page - 1) * per_page;

    const filter: any = {};
    if (category_id) filter.category_id = category_id;
    if (position_id) filter.position_id = position_id;
    if (is_active !== undefined) filter.is_active = is_active;
    if (search) {
      filter.$text = { $search: search };
    }

    const [data, total] = await Promise.all([
      this.questionModel
        .find(filter)
        .skip(skip)
        .limit(per_page)
        .populate('category_id', 'name')
        .populate('position_id', 'name')
        .populate('knowledge_base_article_id', 'title')
        .sort({ createdAt: -1 })
        .exec(),
      this.questionModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: Helpers.generatePaginationMeta(page, per_page, total),
    };
  }

  async findOne(id: string) {
    const question = await this.questionModel
      .findById(id)
      .populate('category_id', 'name')
      .populate('position_id', 'name')
      .populate('knowledge_base_article_id', 'title')
      .exec();

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async create(createDto: CreateQuestionDto) {
    const question = new this.questionModel(createDto);
    return question.save();
  }

  async update(id: string, updateDto: UpdateQuestionDto) {
    const question = await this.questionModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async toggleActive(id: string, is_active: boolean) {
    const question = await this.questionModel.findByIdAndUpdate(
      id,
      { is_active },
      { new: true },
    )
      .populate('category_id', 'name')
      .populate('position_id', 'name')
      .populate('knowledge_base_article_id', 'title')
      .exec();

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async remove(id: string) {
    // Спочатку отримуємо питання, щоб видалити пов'язані файли
    const question = await this.questionModel.findById(id).exec();
    
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Видаляємо пов'язані файли (зображення, відео та thumbnail)
    const deletePromises: Promise<boolean>[] = [];
    
    if (question.image_url) {
      deletePromises.push(this.filesService.deleteFile(question.image_url));
    }
    
    if (question.video_url) {
      deletePromises.push(this.filesService.deleteFile(question.video_url));
    }
    
    if (question.video_thumbnail_url) {
      deletePromises.push(this.filesService.deleteFile(question.video_thumbnail_url));
    }

    // Виконуємо видалення файлів паралельно
    await Promise.all(deletePromises);

    // Видаляємо питання з бази даних
    await this.questionModel.findByIdAndDelete(id).exec();

    return { message: 'Question and associated files deleted successfully' };
  }

  async getCategories() {
    const categories = await this.categoryModel.find({ is_active: true }).sort({ sort_order: 1, name: 1 }).exec();
    return { data: categories };
  }
}

