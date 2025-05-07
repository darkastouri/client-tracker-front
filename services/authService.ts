import { User } from "@/types/User";

const API_URL = 'https://client-tracker-back.onrender.com/api';

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

export const AuthService = {
  // Login user
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          message: data.message || 'Invalid email or password',
          error: data.message || 'Authentication failed',
        };
      }

      // Store token in localStorage
      if (data.data?.token) {
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // Register new user
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          message: data.message || 'Registration failed',
          error: data.message || 'Could not create account',
        };
      }

      // Store token in localStorage upon successful registration
      if (data.data?.token) {
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An error occurred during registration',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // Logout user
  logout: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false; // For server-side rendering
    return !!localStorage.getItem('auth_token');
  },

  // Get current user
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null; // For server-side rendering
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Get auth token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null; // For server-side rendering
    return localStorage.getItem('auth_token');
  }
};

// Create a function to add auth headers to requests
export const applyAuthHeader = (headers: HeadersInit = {}): HeadersInit => {
  const token = AuthService.getToken();
  if (token) {
    return {
      ...headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return headers;
}; 