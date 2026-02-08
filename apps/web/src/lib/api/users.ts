import apiClient from './client';
import type { IUser, IUserUpdate } from '@/types';

export const usersApi = {
  async findAll(): Promise<IUser[]> {
    const response = await apiClient.get('/users');
    return response.data;
  },

  async update(id: string, data: IUserUpdate): Promise<IUser> {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
