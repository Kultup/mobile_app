import { IsMongoId, IsNotEmpty } from 'class-validator';

export class PurchaseProductDto {
  @IsMongoId()
  @IsNotEmpty()
  product_id: string;
}

