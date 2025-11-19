import { IsOptional, IsString, IsBoolean, IsMongoId, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';

class AnswerDto {
  @IsString()
  answer_text: string;

  @IsBoolean()
  is_correct: boolean;

  @IsOptional()
  sort_order?: number;
}

export class UpdateQuestionDto {
  @IsMongoId()
  @IsOptional()
  category_id?: string;

  @IsMongoId()
  @IsOptional()
  position_id?: string;

  @IsString()
  @IsOptional()
  question_text?: string;

  @IsEnum(['single_choice', 'multiple_choice', 'text'])
  @IsOptional()
  question_type?: string;

  @IsEnum(['none', 'image', 'video'])
  @IsOptional()
  media_type?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  video_url?: string;

  @IsString()
  @IsOptional()
  video_thumbnail_url?: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsMongoId()
  @IsOptional()
  knowledge_base_article_id?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  @IsOptional()
  answers?: AnswerDto[];

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

