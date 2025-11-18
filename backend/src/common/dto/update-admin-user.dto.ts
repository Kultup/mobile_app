import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean, IsEnum, IsString } from 'class-validator';
import { CreateAdminUserDto } from './create-admin-user.dto';

export class UpdateAdminUserDto extends PartialType(CreateAdminUserDto) {
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsEnum(['super_admin', 'training_admin', 'viewer'])
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  password?: string;
}

