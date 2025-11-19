import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShopProductCategoryDocument = ShopProductCategory & Document;

@Schema({ timestamps: true })
export class ShopProductCategory {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'ShopProductCategory' })
  parent_id: Types.ObjectId;

  @Prop({ default: 0 })
  sort_order: number;

  @Prop({ default: true })
  is_active: boolean;
}

export const ShopProductCategorySchema = SchemaFactory.createForClass(ShopProductCategory);

// Indexes
ShopProductCategorySchema.index({ parent_id: 1 });
ShopProductCategorySchema.index({ is_active: 1 });

