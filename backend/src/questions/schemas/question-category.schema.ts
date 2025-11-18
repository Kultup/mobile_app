import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionCategoryDocument = QuestionCategory & Document;

@Schema({ timestamps: true })
export class QuestionCategory {
  @Prop()
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'QuestionCategory' })
  parent_id: Types.ObjectId;

  @Prop({ default: 0 })
  sort_order: number;

  @Prop({ default: true })
  is_active: boolean;
}

export const QuestionCategorySchema = SchemaFactory.createForClass(QuestionCategory);

// Indexes
QuestionCategorySchema.index({ parent_id: 1 });
QuestionCategorySchema.index({ is_active: 1, sort_order: 1 });

