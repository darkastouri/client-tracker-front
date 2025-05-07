"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, AuthResponse } from '@/services/authService';
import { User } from '@/types/User';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = () => {
    const isAuth = AuthService.isAuthenticated();
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
    return isAuth;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    const result = await AuthService.login(email, password);
    
    if (result.success && result.data) {
      setUser(result.data.user);
      // Redirect to dashboard after successful login
      router.push('/dashboard');
    }
    
    setIsLoading(false);
    return result;
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    const result = await AuthService.register(name, email, password);
    
    if (result.success && result.data) {
      setUser(result.data.user);
      // Redirect to dashboard after successful registration
      router.push('/dashboard');
    }
    
    setIsLoading(false);
    return result;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    // Redirect to login page after logout
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 