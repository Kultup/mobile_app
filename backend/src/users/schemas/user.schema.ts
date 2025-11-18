import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  full_name: string;

  @Prop({ type: Types.ObjectId, ref: 'City', required: true })
  city_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position', required: true })
  position_id: Types.ObjectId;

  @Prop({ default: 0 })
  total_score: number;

  @Prop({ default: 0 })
  points_balance: number;

  @Prop({ default: 0 })
  tests_completed: number;

  @Prop({ default: 0 })
  current_streak: number;

  @Prop({ default: 0 })
  longest_streak: number;

  @Prop()
  last_test_date: Date;

  @Prop({ type: Types.ObjectId, ref: 'ShopProduct' })
  avatar_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ShopProduct' })
  profile_frame_id: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'ShopProduct' }], default: [] })
  active_badges: Types.ObjectId[];

  @Prop({ default: true })
  is_active: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ full_name: 1, city_id: 1, position_id: 1 }, { unique: true });
UserSchema.index({ city_id: 1 });
UserSchema.index({ position_id: 1 });
UserSchema.index({ is_active: 1 });
UserSchema.index({ points_balance: -1 });

