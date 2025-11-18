import { IsString, IsNotEmpty, IsMongoId, IsArray, ValidateNested, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsString()
  @IsNotEmpty()
  answer_text: string;

  @IsBoolean()
  is_correct: boolean;

  @IsOptional()
  sort_order?: number;
}

export class CreateQuestionDto {
  @IsMongoId()
  @IsNotEmpty()
  category_id: string;

  @IsString()
  @IsNotEmpty()
  question_text: string;

  @IsEnum(['single_choice', 'multiple_choice', 'text'])
  @IsOptional()
  question_type?: string = 'single_choice';

  @IsEnum(['none', 'image', 'video'])
  @IsOptional()
  media_type?: string = 'none';

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
  answers: AnswerDto[];

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}

