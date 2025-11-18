import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { FeedbackQuestion, FeedbackQuestionSchema } from '../common/schemas/feedback-question.schema';
import { FeedbackErrorReport, FeedbackErrorReportSchema } from '../common/schemas/feedback-error-report.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeedbackQuestion.name, schema: FeedbackQuestionSchema },
      { name: FeedbackErrorReport.name, schema: FeedbackErrorReportSchema },
    ]),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}

