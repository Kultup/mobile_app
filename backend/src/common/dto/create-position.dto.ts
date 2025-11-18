import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}

