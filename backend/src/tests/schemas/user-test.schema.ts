import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserTestDocument = UserTest & Document;

@Schema({ timestamps: true })
export class UserTest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  test_date: Date;

  @Prop({ default: 5 })
  questions_count: number;

  @Prop({ default: 0 })
  correct_answers: number;

  @Prop({ default: 0 })
  score: number;

  @Prop()
  started_at: Date;

  @Prop()
  completed_at: Date;

  @Prop({ default: false })
  is_completed: boolean;

  @Prop({
    type: [
      {
        question_id: { type: Types.ObjectId, ref: 'Question' },
        selected_answer_ids: { type: [String], default: [] }, // Зберігаємо як string[] (індекси відповідей)
        is_correct: Boolean,
        answered_at: Date,
      },
    ],
    default: [],
  })
  answers: Array<{
    question_id: Types.ObjectId;
    selected_answer_ids: string[]; // Індекси відповідей як рядки
    is_correct: boolean;
    answered_at: Date;
  }>;
}

export const UserTestSchema = SchemaFactory.createForClass(UserTest);

// Indexes
UserTestSchema.index({ user_id: 1, test_date: 1 }, { unique: true });
UserTestSchema.index({ user_id: 1, is_completed: 1 });

