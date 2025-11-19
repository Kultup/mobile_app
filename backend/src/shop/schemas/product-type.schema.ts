import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductTypeDocument = ProductType & Document;

@Schema({ timestamps: true })
export class ProductType {
  @Prop({ required: true, unique: true })
  name: string; // Назва типу (наприклад, 'avatar', 'profile_frame')

  @Prop({ required: true })
  label: string; // Відображувана назва (наприклад, 'Аватарка', 'Рамка профілю')

  @Prop()
  description?: string; // Опис типу

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: 0 })
  sort_order: number;
}

export const ProductTypeSchema = SchemaFactory.createForClass(ProductType);

// Indexes
ProductTypeSchema.index({ name: 1 }, { unique: true });
ProductTypeSchema.index({ is_active: 1, sort_order: 1 });

