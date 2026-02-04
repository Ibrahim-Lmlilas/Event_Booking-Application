const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELED';

export interface Event {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  seatsTaken: number;
  status: EventStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  status?: EventStatus;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {}

export const eventsApi = {
  async list(): Promise<Event[]> {
    const res = await fetch(`${API_URL}/events`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch events');
    }
    return res.json();
  },

  async get(id: string): Promise<Event> {
    const res = await fetch(`${API_URL}/events/${id}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch event');
    }
    return res.json();
  },

  async create(payload: CreateEventPayload): Promise<Event> {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create event');
    }
    return res.json();
  },

  async update(id: string, payload: UpdateEventPayload): Promise<Event> {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_URL}/events/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update event');
    }
    return res.json();
  },

  async updateStatus(id: string, status: EventStatus): Promise<Event> {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_URL}/events/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update status');
    }
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_URL}/events/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete event');
    }
  },
};
