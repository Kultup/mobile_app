import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { QuestionsImportService } from './questions-import.service';
import { Question, QuestionSchema } from './schemas/question.schema';
import { QuestionCategory, QuestionCategorySchema } from './schemas/question-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: QuestionCategory.name, schema: QuestionCategorySchema },
    ]),
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionsImportService],
  exports: [QuestionsService],
})
export class QuestionsModule {}

