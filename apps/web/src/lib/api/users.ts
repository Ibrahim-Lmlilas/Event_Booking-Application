import apiClient from './client';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'PARTICIPANT';
  createdAt?: string;
  updatedAt?: string;
}

export const usersApi = {
  async findAll(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return response.data;
  },

  async update(
    id: string,
    data: Partial<Pick<User, 'firstName' | 'lastName' | 'role'>>,
  ): Promise<User> {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
