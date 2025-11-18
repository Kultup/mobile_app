import { IsString, IsNotEmpty, IsOptional, IsArray, IsMongoId } from 'class-validator';

export class SuggestQuestionDto {
  @IsString()
  @IsNotEmpty()
  question_text: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  suggested_answers?: string[];

  @IsMongoId()
  @IsOptional()
  category_id?: string;

  @IsString()
  @IsOptional()
  comment?: string;
}

