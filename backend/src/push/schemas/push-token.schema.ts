import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PushTokenDocument = PushToken & Document;

@Schema({ timestamps: true })
export class PushToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  platform: string; // 'ios', 'android'

  @Prop({ default: true })
  is_active: boolean;

  @Prop()
  last_used_at: Date;
}

export const PushTokenSchema = SchemaFactory.createForClass(PushToken);

// Indexes
PushTokenSchema.index({ user_id: 1, platform: 1, is_active: 1 });
PushTokenSchema.index({ token: 1 }, { unique: true });

