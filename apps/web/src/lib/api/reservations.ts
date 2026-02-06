const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

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
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const res = await fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let errorMessage = 'Failed to create reservation';
      try {
        const error = await res.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = res.statusText || `Server error ${res.status}`;
      }
      throw new Error(errorMessage);
    }

    return res.json();
  },

  async findAll(filters?: ReservationFilters): Promise<ReservationWithEvent[]> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const params = new URLSearchParams();
    if (filters?.eventTitle) params.append('eventTitle', filters.eventTitle);
    if (filters?.userName) params.append('userName', filters.userName);
    if (filters?.status) params.append('status', filters.status);

    const res = await fetch(`${API_URL}/reservations?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      let errorMessage = 'Failed to fetch reservations';
      try {
        const error = await res.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = res.statusText || `Server error ${res.status}`;
      }
      throw new Error(errorMessage);
    }

    return res.json();
  },

  async updateStatus(
    id: string,
    status: 'PENDING' | 'CONFIRMED' | 'REFUSED' | 'CANCELED',
  ): Promise<ReservationWithEvent> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const res = await fetch(`${API_URL}/reservations/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      let errorMessage = 'Failed to update reservation status';
      try {
        const error = await res.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = res.statusText || `Server error ${res.status}`;
      }
      throw new Error(errorMessage);
    }

    return res.json();
  },

  /** Cancel own reservation (allowed only ≥24h before event). */
  async cancel(id: string): Promise<ReservationWithEvent> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const res = await fetch(`${API_URL}/reservations/${id}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      let errorMessage = 'Failed to cancel reservation';
      try {
        const error = await res.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = res.statusText || `Server error ${res.status}`;
      }
      throw new Error(errorMessage);
    }

    return res.json();
  },

  /** EBA-53: Download ticket PDF (CONFIRMED only). */
  async downloadTicket(reservationId: string): Promise<Blob> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const res = await fetch(`${API_URL}/reservations/${reservationId}/ticket`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      let errorMessage = 'Failed to download ticket';
      try {
        const error = await res.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = res.statusText || `Server error ${res.status}`;
      }
      throw new Error(errorMessage);
    }

    return res.blob();
  },
};
