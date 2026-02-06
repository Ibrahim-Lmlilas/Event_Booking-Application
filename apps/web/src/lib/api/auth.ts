const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = 'Registration failed';

        // Try to parse error response
        try {
          const error = await response.json();
          // NestJS returns errors in format: { statusCode, message, error }
          errorMessage = error.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || `Server error ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error: any) {
      // Re-throw with better error message if it's already an Error
      if (error instanceof Error) {
        throw error;
      }
      // Network errors (no response)
      throw new Error('Network error: Failed to connect to server');
    }
  },

  async login(data: LoginData) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';

        // Try to parse error response
        try {
          const error = await response.json();
          // NestJS returns errors in format: { statusCode, message, error }
          errorMessage = error.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          if (response.status === 401) {
            errorMessage = 'Invalid credentials';
          } else {
            errorMessage = response.statusText || `Server error ${response.status}`;
          }
        }

        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error: any) {
      // Re-throw with better error message if it's already an Error
      if (error instanceof Error) {
        throw error;
      }
      // Network errors (no response)
      throw new Error('Network error: Failed to connect to server');
    }
  },

  async getProfile(token: string) {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token expired or invalid - 401');
        }
        let errorMessage = 'Failed to fetch profile';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || `Server error ${response.status}`;
        }
        // Include status code in error message for better handling
        throw new Error(`${errorMessage} - ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      // Re-throw with better error message
      if (error.message && error.message.includes('-')) {
        throw error;
      }
      // Network errors (no response)
      if (error.message) {
        throw new Error(`Network error: ${error.message}`);
      }
      throw new Error('Network error: Failed to connect to server');
    }
  },
};
