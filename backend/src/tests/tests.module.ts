import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
import { UserTest, UserTestSchema } from './schemas/user-test.schema';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Position, PositionSchema } from '../common/schemas/position.schema';
import { PointsTransaction, PointsTransactionSchema } from '../shop/schemas/points-transaction.schema';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserTest.name, schema: UserTestSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: User.name, schema: UserSchema },
      { name: Position.name, schema: PositionSchema },
      { name: PointsTransaction.name, schema: PointsTransactionSchema },
    ]),
    forwardRef(() => AchievementsModule),
  ],
  controllers: [TestsController],
  providers: [TestsService],
  exports: [TestsService],
})
export class TestsModule {}

