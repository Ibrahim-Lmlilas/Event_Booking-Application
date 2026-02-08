import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReservationStatus } from '../../common/enums/reservation-status.enum.js';

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status!: ReservationStatus;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

// Composite index: prevent duplicate reservations (user + event unique)
ReservationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

// Index for queries
ReservationSchema.index({ status: 1 });
ReservationSchema.index({ userId: 1, status: 1 });
ReservationSchema.index({ eventId: 1, status: 1 });
