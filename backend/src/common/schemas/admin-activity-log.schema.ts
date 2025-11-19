import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdminActivityLogDocument = AdminActivityLog & Document;

@Schema({ timestamps: true })
export class AdminActivityLog {
  @Prop({ type: Types.ObjectId, ref: 'AdminUser', required: true })
  admin_user_id: Types.ObjectId;

  @Prop({ required: true })
  action: string; // 'create', 'update', 'delete', 'view', 'export', 'login', 'logout'

  @Prop({ required: true })
  entity_type: string; // 'question', 'user', 'article', 'achievement', 'shop_product', 'survey', 'settings', 'admin_user'

  @Prop({ type: Types.ObjectId })
  entity_id: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object })
  details: any;

  @Prop()
  ip_address: string;

  @Prop()
  user_agent: string;
}

export const AdminActivityLogSchema = SchemaFactory.createForClass(AdminActivityLog);

// Indexes
AdminActivityLogSchema.index({ admin_user_id: 1, created_at: -1 });
AdminActivityLogSchema.index({ entity_type: 1 });

