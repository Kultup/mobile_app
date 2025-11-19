import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
  @Prop({ type: Types.ObjectId, ref: 'QuestionCategory', required: true })
  category_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position' })
  position_id: Types.ObjectId;

  @Prop({ required: true })
  question_text: string;

  @Prop({ default: 'single_choice' })
  question_type: string;

  @Prop({ default: 'none' })
  media_type: string; // 'none', 'image', 'video'

  @Prop()
  image_url: string;

  @Prop()
  video_url: string;

  @Prop()
  video_thumbnail_url: string;

  @Prop()
  explanation: string;

  @Prop({ type: Types.ObjectId, ref: 'KnowledgeBaseArticle' })
  knowledge_base_article_id: Types.ObjectId;

  @Prop({
    type: [
      {
        answer_text: String,
        is_correct: Boolean,
        sort_order: Number,
      },
    ],
    required: true,
  })
  answers: Array<{
    answer_text: string;
    is_correct: boolean;
    sort_order: number;
  }>;

  @Prop({ default: true })
  is_active: boolean;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

// Indexes
QuestionSchema.index({ category_id: 1, is_active: 1 });
QuestionSchema.index({ position_id: 1, is_active: 1 });
QuestionSchema.index({ question_text: 'text' });

