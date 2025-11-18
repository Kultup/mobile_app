import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminUserDocument = AdminUser & Document;

@Schema({ timestamps: true })
export class AdminUser {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password_hash: string;

  @Prop({ default: 'viewer' })
  role: string; // 'super_admin', 'training_admin', 'viewer'

  @Prop({ default: true })
  is_active: boolean;

  @Prop()
  last_login_at: Date;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);

// Indexes
AdminUserSchema.index({ username: 1 }, { unique: true });
AdminUserSchema.index({ email: 1 }, { unique: true });
AdminUserSchema.index({ role: 1, is_active: 1 });

