import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeedbackErrorReportDocument = FeedbackErrorReport & Document;

@Schema({ timestamps: true })
export class FeedbackErrorReport {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
  question_id: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop()
  screenshot_url: string;

  @Prop({ default: false })
  is_reviewed: boolean;

  @Prop({ type: Types.ObjectId, ref: 'AdminUser' })
  reviewed_by: Types.ObjectId;
}

export const FeedbackErrorReportSchema = SchemaFactory.createForClass(FeedbackErrorReport);

FeedbackErrorReportSchema.index({ user_id: 1, created_at: -1 });
FeedbackErrorReportSchema.index({ question_id: 1 });
FeedbackErrorReportSchema.index({ is_reviewed: 1 });

