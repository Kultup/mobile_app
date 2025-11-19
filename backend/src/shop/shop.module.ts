import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { ProductTypeService } from './product-type.service';
import { ShopProduct, ShopProductSchema } from './schemas/shop-product.schema';
import { UserPurchase, UserPurchaseSchema } from './schemas/user-purchase.schema';
import { PointsTransaction, PointsTransactionSchema } from './schemas/points-transaction.schema';
import { ProductType, ProductTypeSchema } from './schemas/product-type.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShopProduct.name, schema: ShopProductSchema },
      { name: UserPurchase.name, schema: UserPurchaseSchema },
      { name: PointsTransaction.name, schema: PointsTransactionSchema },
      { name: ProductType.name, schema: ProductTypeSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ShopController],
  providers: [ShopService, ProductTypeService],
  exports: [ShopService, ProductTypeService],
})
export class ShopModule {}

