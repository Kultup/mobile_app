import { IsNumber, IsOptional, IsString, IsArray, Min, Max } from 'class-validator';

export class SurveyResponseDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  response_text?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  selected_options?: string[];
}

