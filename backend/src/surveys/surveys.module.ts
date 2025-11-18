import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SurveysController } from './surveys.controller';
import { SurveysAdminController } from './surveys-admin.controller';
import { SurveysService } from './surveys.service';
import { Survey, SurveySchema } from './schemas/survey.schema';
import { SurveyResponse, SurveyResponseSchema } from './schemas/survey-response.schema';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Survey.name, schema: SurveySchema },
      { name: SurveyResponse.name, schema: SurveyResponseSchema },
    ]),
    forwardRef(() => AdminModule),
  ],
  controllers: [SurveysController, SurveysAdminController],
  providers: [SurveysService],
  exports: [SurveysService],
})
export class SurveysModule {}

