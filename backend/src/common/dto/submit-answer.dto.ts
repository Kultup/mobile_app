import { IsMongoId, IsNotEmpty, IsArray, IsOptional, IsString } from 'class-validator';

export class SubmitAnswerDto {
  @IsMongoId()
  @IsNotEmpty()
  question_id: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  selected_answer_ids?: string[];

  @IsString()
  @IsOptional()
  text_answer?: string;
}

