"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/about'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip this check during server-side rendering or while loading auth state
    if (typeof window === 'undefined' || isLoading) return;

    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || pathname.startsWith('/api/')
    );

    if (!isAuthenticated && !isPublicRoute) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Don't render anything while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if it's a protected route and user is not authenticated
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/api/')
  );

  if (!isAuthenticated && !isPublicRoute) {
    // Don't render protected content
    return null;
  }

  // User is authenticated or this is a public route, render children
  return <>{children}</>;
} 