import apiClient from './client';
import type { Event } from './events';

export interface Reservation {
  _id: string;
  userId: string;
  eventId: string | Event;
  status: 'PENDING' | 'CONFIRMED' | 'REFUSED' | 'CANCELED';
  createdAt?: string;
  updatedAt?: string;
}

export interface ReservationWithEvent extends Omit<Reservation, 'eventId' | 'userId'> {
  eventId: Event;
  userId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface ReservationFilters {
  eventTitle?: string;
  userName?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'REFUSED' | 'CANCELED';
}

export interface CreateReservationPayload {
  eventId: string;
}

export const reservationsApi = {
  async create(payload: CreateReservationPayload): Promise<Reservation> {
    const response = await apiClient.post('/reservations', payload);
    return response.data;
  },

  async findAll(filters?: ReservationFilters): Promise<ReservationWithEvent[]> {
    const response = await apiClient.get('/reservations', { params: filters });
    return response.data;
  },

  async updateStatus(
    id: string,
    status: 'PENDING' | 'CONFIRMED' | 'REFUSED' | 'CANCELED',
  ): Promise<ReservationWithEvent> {
    const response = await apiClient.patch(`/reservations/${id}/status`, { status });
    return response.data;
  },

  /** Cancel own reservation (allowed only ≥24h before event). */
  async cancel(id: string): Promise<ReservationWithEvent> {
    const response = await apiClient.patch(`/reservations/${id}/cancel`);
    return response.data;
  },

  /** EBA-53: Download ticket PDF (CONFIRMED only). */
  async downloadTicket(reservationId: string): Promise<Blob> {
    const response = await apiClient.get(`/reservations/${reservationId}/ticket`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
