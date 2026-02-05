import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EventStatus } from '../../common/enums/event-status.enum';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  date!: Date;

  @Prop({ required: true })
  time!: string;

  @Prop({ required: true })
  location!: string;

  @Prop({ required: true, min: 1 })
  capacity!: number;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ default: 0, min: 0 })
  seatsTaken!: number;

  @Prop({ type: String, enum: EventStatus, default: EventStatus.DRAFT })
  status!: EventStatus;

  @Prop({ required: true })
  bg!: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Index for queries
EventSchema.index({ status: 1, date: 1 });
