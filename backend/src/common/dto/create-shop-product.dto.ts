import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class CreateShopProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['avatar', 'profile_frame', 'badge', 'theme', 'customization', 'gift'])
  @IsNotEmpty()
  product_type: string;

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

