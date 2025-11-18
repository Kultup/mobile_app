import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CronService } from './cron.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UserTest, UserTestSchema } from '../tests/schemas/user-test.schema';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import { PushToken, PushTokenSchema } from '../push/schemas/push-token.schema';
import { PushModule } from '../push/push.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserTest.name, schema: UserTestSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: PushToken.name, schema: PushTokenSchema },
    ]),
    PushModule,
  ],
  providers: [CronService],
})
export class CronModule {}

