import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';

export class CreateSurveyDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['rating', 'multiple_choice', 'text'])
  survey_type: 'rating' | 'multiple_choice' | 'text';

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsDateString()
  starts_at?: string;

  @IsOptional()
  @IsDateString()
  ends_at?: string;

  @IsOptional()
  options?: string[]; // For multiple_choice surveys
}

