import { ReservationStatus } from '../enums/index.js';
import { IEvent } from './event.types.js';
import { IUser } from './user.types.js';

export interface IReservation {
  _id: string;
  userId: string;
  eventId: string;
  status: ReservationStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReservationWithDetails {
  _id: string;
  userId: IUser;
  eventId: IEvent;
  status: ReservationStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReservationCreate {
  eventId: string;
}

export interface IReservationUpdate {
  status: ReservationStatus;
}

export interface ReservationFilters {
  eventTitle?: string;
  userName?: string;
  status?: ReservationStatus;
}

export interface CreateReservationPayload {
  eventId: string;
}
