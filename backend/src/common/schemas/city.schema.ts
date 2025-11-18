import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CityDocument = City & Document;

@Schema({ timestamps: true })
export class City {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: true })
  is_active: boolean;
}

export const CitySchema = SchemaFactory.createForClass(City);

CitySchema.index({ name: 1 }, { unique: true });

