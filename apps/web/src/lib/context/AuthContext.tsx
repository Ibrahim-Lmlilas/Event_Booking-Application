'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import type { IUser } from '@/types';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (token: string, userData: IUser) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  // Check JWT & fetch user profile on app load
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    // If no token, check if we have stored user data (fallback)
    if (!token) {
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
      return;
    }

    // Try to use stored user data first for faster initial load
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('user');
      }
    }

    try {
      // Validate token and fetch user profile from API
      const response = await authApi.getProfile(token);

      if (response.user) {
        // Update stored user data with fresh data from API
        const userData: IUser = {
          _id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          role: response.user.role,
        };

        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error: any) {
      // Only clear storage if token is definitely invalid (401)
      // For other errors (network, 500, etc.), keep using stored user data
      if (
        error.message?.includes('Token expired') ||
        error.message?.includes('invalid') ||
        error.message?.includes('401')
      ) {
        console.error('Auth check failed - token invalid:', error.message);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } else {
        // Network error or server error - keep using stored data
        console.warn('Auth check failed - using stored data:', error.message);
        // User data already set from storedUser above
      }
    } finally {
      setLoading(false);
    }
  };

  const login = (token: string, userData: IUser) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    // Redirect based on role
    // Role values from API are lowercase: 'admin' or 'participant'
    const role = String(userData.role || '')
      .toLowerCase()
      .trim();

    // Use router.push for client-side navigation without refresh
    if (role === 'admin') {
      router.push('/dashboard/admin');
    } else {
      // Default to participant dashboard for 'participant' or any other role
      router.push('/dashboard/participant');
    }
  };

  // Implement logout (clear JWT, redirect to public page)
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
