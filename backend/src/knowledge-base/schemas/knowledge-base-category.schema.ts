import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type KnowledgeBaseCategoryDocument = KnowledgeBaseCategory & Document;

@Schema({ timestamps: true })
export class KnowledgeBaseCategory {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'KnowledgeBaseCategory' })
  parent_id: Types.ObjectId;

  @Prop({ default: 0 })
  sort_order: number;

  @Prop({ default: true })
  is_active: boolean;
}

export const KnowledgeBaseCategorySchema = SchemaFactory.createForClass(KnowledgeBaseCategory);

// Indexes
KnowledgeBaseCategorySchema.index({ parent_id: 1 });
KnowledgeBaseCategorySchema.index({ is_active: 1, sort_order: 1 });

