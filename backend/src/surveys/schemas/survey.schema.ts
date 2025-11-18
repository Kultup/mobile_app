import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SurveyDocument = Survey & Document;

@Schema({ timestamps: true })
export class Survey {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  survey_type: string; // 'rating', 'multiple_choice', 'text'

  @Prop({ type: Types.ObjectId, ref: 'AdminUser' })
  created_by: Types.ObjectId;

  @Prop({ default: true })
  is_active: boolean;

  @Prop()
  expires_at: Date;

  @Prop({ type: [String] })
  options: string[]; // For multiple_choice surveys
}

export const SurveySchema = SchemaFactory.createForClass(Survey);

// Indexes
SurveySchema.index({ is_active: 1, expires_at: 1 });

