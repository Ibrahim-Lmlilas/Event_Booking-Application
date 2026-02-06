const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

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
    const token = getToken();
    if (!token) throw new Error('Authentication required');

    const res = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      let msg = 'Failed to load users';
      try {
        const err = await res.json();
        msg = err.message || msg;
      } catch {
        msg = res.statusText || msg;
      }
      throw new Error(msg);
    }
    return res.json();
  },

  async update(
    id: string,
    data: Partial<Pick<User, 'firstName' | 'lastName' | 'role'>>,
  ): Promise<User> {
    const token = getToken();
    if (!token) throw new Error('Authentication required');

    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let msg = 'Failed to update user';
      try {
        const err = await res.json();
        msg = err.message || msg;
      } catch {
        msg = res.statusText || msg;
      }
      throw new Error(msg);
    }
    return res.json();
  },

  async remove(id: string): Promise<void> {
    const token = getToken();
    if (!token) throw new Error('Authentication required');

    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      let msg = 'Failed to delete user';
      try {
        const err = await res.json();
        msg = err.message || msg;
      } catch {
        msg = res.statusText || msg;
      }
      throw new Error(msg);
    }
  },
};
