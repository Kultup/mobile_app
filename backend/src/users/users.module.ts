import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { UserTest, UserTestSchema } from '../tests/schemas/user-test.schema';
import { PointsTransaction, PointsTransactionSchema } from '../shop/schemas/points-transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserTest.name, schema: UserTestSchema },
      { name: PointsTransaction.name, schema: PointsTransactionSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

