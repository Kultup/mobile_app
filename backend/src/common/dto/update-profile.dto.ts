import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  full_name?: string;

  @IsMongoId()
  @IsOptional()
  city_id?: string;

  @IsMongoId()
  @IsOptional()
  position_id?: string;
}

