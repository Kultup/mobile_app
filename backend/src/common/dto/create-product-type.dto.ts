import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateProductTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;

  @IsNumber()
  @IsOptional()
  sort_order?: number = 0;
}

export class UpdateProductTypeDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsNumber()
  @IsOptional()
  sort_order?: number;
}

