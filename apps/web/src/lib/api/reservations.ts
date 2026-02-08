import apiClient from './client';
import type {
  IReservation,
  IReservationWithDetails,
  ReservationFilters,
  CreateReservationPayload,
} from '@/types';
import { ReservationStatus } from '@/types';

export type { ReservationFilters };

export const reservationsApi = {
  async create(payload: CreateReservationPayload): Promise<IReservation> {
    const response = await apiClient.post('/reservations', payload);
    return response.data;
  },

  async findAll(filters?: ReservationFilters): Promise<IReservationWithDetails[]> {
    const response = await apiClient.get('/reservations', { params: filters });
    return response.data;
  },

  async updateStatus(id: string, status: ReservationStatus): Promise<IReservationWithDetails> {
    const response = await apiClient.patch(`/reservations/${id}/status`, { status });
    return response.data;
  },

  /** Cancel own reservation (allowed only ≥24h before event). */
  async cancel(id: string): Promise<IReservationWithDetails> {
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
