import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SurveyResponseDocument = SurveyResponse & Document;

@Schema({ timestamps: true })
export class SurveyResponse {
  @Prop({ type: Types.ObjectId, ref: 'Survey', required: true })
  survey_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop()
  rating: number;

  @Prop()
  response_text: string;

  @Prop()
  selected_options: string[];
}

export const SurveyResponseSchema = SchemaFactory.createForClass(SurveyResponse);

// Indexes
SurveyResponseSchema.index({ survey_id: 1, user_id: 1 }, { unique: true });

