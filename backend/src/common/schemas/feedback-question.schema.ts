import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeedbackQuestionDocument = FeedbackQuestion & Document;

@Schema({ timestamps: true })
export class FeedbackQuestion {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  question_text: string;

  @Prop({ type: [String], default: [] })
  suggested_answers: string[];

  @Prop({ type: Types.ObjectId, ref: 'QuestionCategory' })
  category_id: Types.ObjectId;

  @Prop()
  comment: string;

  @Prop({ default: false })
  is_reviewed: boolean;

  @Prop({ type: Types.ObjectId, ref: 'AdminUser' })
  reviewed_by: Types.ObjectId;
}

export const FeedbackQuestionSchema = SchemaFactory.createForClass(FeedbackQuestion);

FeedbackQuestionSchema.index({ user_id: 1, created_at: -1 });
FeedbackQuestionSchema.index({ is_reviewed: 1 });

