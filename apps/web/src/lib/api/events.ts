import apiClient from './client';
import type { EventStatus, IEvent, IEventCreate, IEventUpdate, IPaginatedEvents } from '@/types';

export const eventsApi = {
  async list(page: number = 1, limit: number = 10): Promise<IPaginatedEvents> {
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
  ): Promise<IPaginatedEvents> {
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

  async get(id: string): Promise<IEvent> {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  async create(payload: IEventCreate): Promise<IEvent> {
    const response = await apiClient.post('/events', payload);
    return response.data;
  },

  async update(id: string, payload: IEventUpdate): Promise<IEvent> {
    const response = await apiClient.patch(`/events/${id}`, payload);
    return response.data;
  },

  async updateStatus(id: string, status: EventStatus): Promise<IEvent> {
    const response = await apiClient.patch(`/events/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },
};
