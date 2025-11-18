import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { AchievementsCheckerService } from './achievements-checker.service';
import { Achievement, AchievementSchema } from './schemas/achievement.schema';
import { UserAchievement, UserAchievementSchema } from './schemas/user-achievement.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UserTest, UserTestSchema } from '../tests/schemas/user-test.schema';
import { PointsTransaction, PointsTransactionSchema } from '../shop/schemas/points-transaction.schema';
import { PushModule } from '../push/push.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Achievement.name, schema: AchievementSchema },
      { name: UserAchievement.name, schema: UserAchievementSchema },
      { name: User.name, schema: UserSchema },
      { name: UserTest.name, schema: UserTestSchema },
      { name: PointsTransaction.name, schema: PointsTransactionSchema },
    ]),
    PushModule,
  ],
  controllers: [AchievementsController],
  providers: [AchievementsService, AchievementsCheckerService],
  exports: [AchievementsService, AchievementsCheckerService],
})
export class AchievementsModule {}

