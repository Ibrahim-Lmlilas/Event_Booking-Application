import apiClient from './client';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELED';

export interface Event {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  price: number;
  seatsTaken: number;
  status: EventStatus;
  bg: string;
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
  price: number;
  status?: EventStatus;
  bg: string;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {}

export interface PaginatedEventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const eventsApi = {
  async list(page: number = 1, limit: number = 10): Promise<PaginatedEventsResponse> {
    const response = await apiClient.get('/events', {
      params: { page, limit },
    });
    return response.data;
  },

  async listPublished(
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      date?: string;
      time?: string;
    },
  ): Promise<PaginatedEventsResponse> {
    const params: any = {
      page,
      limit,
      status: 'PUBLISHED',
    };

    if (filters?.search) params.search = filters.search;
    if (filters?.minPrice !== undefined) params.minPrice = filters.minPrice;
    if (filters?.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
    if (filters?.date) params.date = filters.date;
    if (filters?.time) params.time = filters.time;

    const response = await apiClient.get('/events', { params });
    return response.data;
  },

  async get(id: string): Promise<Event> {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  async create(payload: CreateEventPayload): Promise<Event> {
    const response = await apiClient.post('/events', payload);
    return response.data;
  },

  async update(id: string, payload: UpdateEventPayload): Promise<Event> {
    const response = await apiClient.patch(`/events/${id}`, payload);
    return response.data;
  },

  async updateStatus(id: string, status: EventStatus): Promise<Event> {
    const response = await apiClient.patch(`/events/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },
};
