import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type KnowledgeBaseArticleDocument = KnowledgeBaseArticle & Document;

@Schema({ timestamps: true })
export class KnowledgeBaseArticle {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'KnowledgeBaseCategory', required: true })
  category_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position' })
  position_id: Types.ObjectId;

  @Prop()
  image_url: string;

  @Prop()
  pdf_url: string;

  @Prop({ default: 0 })
  views_count: number;

  @Prop({ default: true })
  is_active: boolean;
}

export const KnowledgeBaseArticleSchema = SchemaFactory.createForClass(KnowledgeBaseArticle);

// Indexes
KnowledgeBaseArticleSchema.index({ category_id: 1, is_active: 1 });
KnowledgeBaseArticleSchema.index({ position_id: 1, is_active: 1 });
// Text search index (MongoDB text index)
KnowledgeBaseArticleSchema.index({ title: 'text', content: 'text' });

