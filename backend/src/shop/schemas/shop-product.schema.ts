import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShopProductDocument = ShopProduct & Document;

@Schema({ timestamps: true })
export class ShopProduct {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  product_type: string; // 'avatar', 'profile_frame', 'badge', 'theme', 'customization', 'gift'

  @Prop({ required: true })
  price: number;

  @Prop()
  image_url: string;

  @Prop()
  preview_url: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  is_premium: boolean;

  @Prop()
  category: string;

  @Prop({ default: 0 })
  sort_order: number;
}

export const ShopProductSchema = SchemaFactory.createForClass(ShopProduct);

// Indexes
ShopProductSchema.index({ product_type: 1, is_active: 1 });
ShopProductSchema.index({ category: 1 });
ShopProductSchema.index({ sort_order: 1 });

