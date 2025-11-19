import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class CreateShopProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  product_type: string; // Дозволяємо будь-який тип товару

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  preview_url?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;

  @IsBoolean()
  @IsOptional()
  is_premium?: boolean = false;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  sort_order?: number = 0;
}

