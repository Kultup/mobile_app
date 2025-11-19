import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AchievementDocument = Achievement & Document;

@Schema({ timestamps: true })
export class Achievement {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  icon_url: string;

  @Prop({ required: true })
  category: string; // 'testing', 'activity', 'accuracy', 'rating', 'special'

  @Prop({ required: true })
  condition_type: string; // 'tests_count', 'streak', 'perfect_tests', 'rating_position', 'total_points', 'correct_answers_count', 'average_score', 'consecutive_perfect_tests', 'longest_streak', 'shop_purchases_count', 'total_correct_answers', 'accuracy_percentage'

  @Prop({ required: true })
  condition_value: number;

  @Prop({ type: Object, required: false })
  condition_extra?: any; // Додаткові параметри (наприклад, category_id для tests_in_category)

  @Prop({ default: 0 })
  reward_points: number;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: 0 })
  sort_order: number;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);

// Indexes
AchievementSchema.index({ category: 1, is_active: 1 });
AchievementSchema.index({ sort_order: 1 });

