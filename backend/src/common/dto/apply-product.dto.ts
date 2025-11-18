import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ApplyProductDto {
  @IsMongoId()
  @IsNotEmpty()
  purchase_id: string;
}

