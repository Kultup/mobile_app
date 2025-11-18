import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Survey } from './schemas/survey.schema';
import { SurveyResponse } from './schemas/survey-response.schema';
import { SurveyResponseDto } from '../common/dto/survey-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Helpers } from '../common/utils/helpers';

@Injectable()
export class SurveysService {
  constructor(
    @InjectModel(Survey.name) private surveyModel: Model<Survey>,
    @InjectModel(SurveyResponse.name) private surveyResponseModel: Model<SurveyResponse>,
  ) {}

  async getSurveys(userId: string) {
    const now = new Date();
    const surveys = await this.surveyModel
      .find({
        is_active: true,
        $or: [{ expires_at: { $gte: now } }, { expires_at: null }],
      })
      .exec();

    const responses = await this.surveyResponseModel.find({ user_id: userId }).exec();
    const respondedIds = new Set(responses.map((r) => r.survey_id.toString()));

    return {
      data: surveys.map((survey) => ({
        id: survey._id,
        title: survey.title,
        description: survey.description,
        survey_type: survey.survey_type,
        is_completed: respondedIds.has(survey._id.toString()),
      })),
    };
  }

  async respond(surveyId: string, userId: string, responseDto: SurveyResponseDto) {
    const survey = await this.surveyModel.findById(surveyId).exec();
    if (!survey || !survey.is_active) {
      throw new NotFoundException('Survey not found');
    }

    // Перевірка чи вже відповідали
    const existingResponse = await this.surveyResponseModel.findOne({
      survey_id: surveyId,
      user_id: userId,
    }).exec();

    if (existingResponse) {
      throw new BadRequestException('You have already responded to this survey');
    }

    const response = new this.surveyResponseModel({
      survey_id: surveyId,
      user_id: userId,
      rating: responseDto.rating,
      response_text: responseDto.response_text,
      selected_options: responseDto.selected_options,
    });

    await response.save();

    return { message: 'Дякуємо за відповідь!' };
  }

  async getSurveysForAdmin(query: PaginationDto & { is_active?: boolean }) {
    const { page = 1, per_page = 20, is_active } = query;
    const skip = (page - 1) * per_page;

    const filter: any = {};
    if (is_active !== undefined) filter.is_active = is_active;

    const [data, total] = await Promise.all([
      this.surveyModel
        .find(filter)
        .skip(skip)
        .limit(per_page)
        .populate('created_by', 'username')
        .sort({ created_at: -1 })
        .exec(),
      this.surveyModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: Helpers.generatePaginationMeta(page, per_page, total),
    };
  }

  async getSurveyForAdmin(id: string) {
    const survey = await this.surveyModel
      .findById(id)
      .populate('created_by', 'username')
      .exec();

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    return survey;
  }

  async createSurvey(createDto: any) {
    const survey = new this.surveyModel(createDto);
    return survey.save();
  }

  async updateSurvey(id: string, updateDto: Partial<any>) {
    const survey = await this.surveyModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    if (!survey) {
      throw new NotFoundException('Survey not found');
    }
    return survey;
  }

  async deleteSurvey(id: string) {
    const result = await this.surveyModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Survey not found');
    }
    return { message: 'Survey deleted successfully' };
  }

  async getResponses(surveyId: string, query: PaginationDto) {
    const { page = 1, per_page = 20 } = query;
    const skip = (page - 1) * per_page;

    const [data, total] = await Promise.all([
      this.surveyResponseModel
        .find({ survey_id: surveyId })
        .skip(skip)
        .limit(per_page)
        .populate('user_id', 'full_name')
        .sort({ created_at: -1 })
        .exec(),
      this.surveyResponseModel.countDocuments({ survey_id: surveyId }),
    ]);

    return {
      data,
      meta: Helpers.generatePaginationMeta(page, per_page, total),
    };
  }
}

