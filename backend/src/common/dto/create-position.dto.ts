import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsMongoId } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  category_ids?: string[];

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}

