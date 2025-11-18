import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QuestionsModule } from './questions/questions.module';
import { TestsModule } from './tests/tests.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { RatingsModule } from './ratings/ratings.module';
import { SurveysModule } from './surveys/surveys.module';
import { AchievementsModule } from './achievements/achievements.module';
import { ShopModule } from './shop/shop.module';
import { AdminModule } from './admin/admin.module';
import { PushModule } from './push/push.module';
import { FilesModule } from './files/files.module';
import { CronModule } from './cron/cron.module';
import { FeedbackModule } from './feedback/feedback.module';
import { CommonModule } from './common/common.module';

// Common
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Schedule
    ScheduleModule.forRoot(),

    // Logger
    LoggerModule,

    // Feature modules
    AuthModule,
    UsersModule,
    QuestionsModule,
    TestsModule,
    KnowledgeBaseModule,
    RatingsModule,
    SurveysModule,
    AchievementsModule,
    ShopModule,
    AdminModule,
    PushModule,
    FilesModule,
    CronModule,
    FeedbackModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Rate limiting middleware is handled by ThrottlerGuard
  }
}

