import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create separate axios instance for auth (without interceptor)
const authClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  async register(data: RegisterData) {
    try {
      const response = await authClient.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(message);
    }
  },

  async login(data: LoginData) {
    try {
      const response = await authClient.post('/auth/login', data);
      return response.data;
    } catch (error: any) {
      let message = 'Login failed';
      if (error.response?.status === 401) {
        message = 'Invalid credentials';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      throw new Error(message);
    }
  },

  async getProfile(token: string) {
    try {
      const response = await authClient.get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Token expired or invalid - 401');
      }
      const message = error.response?.data?.message || error.message || 'Failed to fetch profile';
      throw new Error(`${message} - ${error.response?.status || 'Network error'}`);
    }
  },
};
