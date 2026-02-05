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

export interface ReservationWithEvent extends Omit<Reservation, 'eventId'> {
  eventId: Event;
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

  async findAll(): Promise<ReservationWithEvent[]> {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const res = await fetch(`${API_URL}/reservations`, {
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
};
