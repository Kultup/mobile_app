import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserAchievementDocument = UserAchievement & Document;

@Schema({ timestamps: true })
export class UserAchievement {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Achievement', required: true })
  achievement_id: Types.ObjectId;

  @Prop({ default: 0 })
  progress: number;

  @Prop({ default: false })
  is_completed: boolean;

  @Prop()
  completed_at: Date;
}

export const UserAchievementSchema = SchemaFactory.createForClass(UserAchievement);

// Indexes
UserAchievementSchema.index({ user_id: 1, achievement_id: 1 }, { unique: true });
UserAchievementSchema.index({ user_id: 1, is_completed: 1 });

