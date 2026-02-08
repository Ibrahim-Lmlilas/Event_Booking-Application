import { EventStatus } from '../enums/index.js';

export interface IEvent {
  _id: string;
  title: string;
  description?: string;
  date: Date | string;
  time: string;
  location: string;
  capacity: number;
  price: number;
  seatsTaken: number;
  status: EventStatus;
  bg: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEventCreate {
  title: string;
  description?: string;
  date: Date | string;
  time: string;
  location: string;
  capacity: number;
  price: number;
  status?: EventStatus;
  bg: string;
}

export interface IEventUpdate {
  title?: string;
  description?: string;
  date?: Date | string;
  time?: string;
  location?: string;
  capacity?: number;
  price?: number;
  status?: EventStatus;
  bg?: string;
}

export interface IPaginatedEvents {
  events: IEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
