import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PositionDocument = Position & Document;

@Schema({ timestamps: true })
export class Position {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: true })
  is_active: boolean;
}

export const PositionSchema = SchemaFactory.createForClass(Position);

PositionSchema.index({ name: 1 }, { unique: true });

