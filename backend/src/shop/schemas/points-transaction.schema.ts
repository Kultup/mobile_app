import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PointsTransactionDocument = PointsTransaction & Document;

@Schema({ timestamps: true })
export class PointsTransaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  transaction_type: string; // 'earned', 'spent', 'bonus'

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  source: string; // 'test', 'achievement', 'streak_bonus', 'purchase'

  @Prop({ type: Types.ObjectId })
  source_id: Types.ObjectId;

  @Prop()
  description: string;

  @Prop({ required: true })
  balance_after: number;
}

export const PointsTransactionSchema = SchemaFactory.createForClass(PointsTransaction);

// Indexes
PointsTransactionSchema.index({ user_id: 1, created_at: -1 });
PointsTransactionSchema.index({ transaction_type: 1 });

