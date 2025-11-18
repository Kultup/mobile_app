import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SystemSettingsDocument = SystemSettings & Document;

@Schema({ timestamps: true })
export class SystemSettings {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  value: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'AdminUser' })
  updated_by: Types.ObjectId;
}

export const SystemSettingsSchema = SchemaFactory.createForClass(SystemSettings);

SystemSettingsSchema.index({ key: 1 }, { unique: true });

