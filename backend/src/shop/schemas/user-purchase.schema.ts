import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserPurchaseDocument = UserPurchase & Document;

@Schema({ timestamps: true })
export class UserPurchase {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ShopProduct', required: true })
  product_id: Types.ObjectId;

  @Prop({ required: true })
  price_paid: number;

  @Prop({ default: false })
  is_applied: boolean;

  @Prop()
  purchased_at: Date;

  @Prop()
  applied_at: Date;
}

export const UserPurchaseSchema = SchemaFactory.createForClass(UserPurchase);

// Indexes
UserPurchaseSchema.index({ user_id: 1, purchased_at: -1 });
UserPurchaseSchema.index({ product_id: 1 });

