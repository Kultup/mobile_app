import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsMongoId()
  @IsNotEmpty()
  city_id: string;

  @IsMongoId()
  @IsNotEmpty()
  position_id: string;
}

