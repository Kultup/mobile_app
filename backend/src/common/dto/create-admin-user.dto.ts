import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class CreateAdminUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(['super_admin', 'training_admin', 'viewer'])
  @IsOptional()
  role?: string = 'viewer';
}

