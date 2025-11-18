import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsUrl } from 'class-validator';

export class ReportErrorDto {
  @IsMongoId()
  @IsNotEmpty()
  question_id: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  screenshot_url?: string;
}

