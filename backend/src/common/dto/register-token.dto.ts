import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class RegisterTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEnum(['ios', 'android'])
  @IsNotEmpty()
  platform: string;
}

