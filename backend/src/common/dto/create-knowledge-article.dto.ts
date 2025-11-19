import { IsString, IsNotEmpty, IsMongoId, IsOptional, IsBoolean } from 'class-validator';

export class CreateKnowledgeArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  @IsNotEmpty()
  category_id: string;

  @IsMongoId()
  @IsOptional()
  position_id?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  pdf_url?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}

