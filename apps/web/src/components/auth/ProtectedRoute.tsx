'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
};

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth check to complete

    // If no user, redirect to home
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // If roles are specified, check if user has required role
    if (allowedRoles.length > 0) {
      const userRole = String(user.role || '')
        .toLowerCase()
        .trim();
      const hasAccess = allowedRoles.some(role => role.toLowerCase().trim() === userRole);

      if (!hasAccess) {
        // Redirect to appropriate dashboard based on user role
        if (userRole === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/participant');
        }
        return;
      }
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If no user, don't render children (redirect will happen)
  if (!user) {
    return null;
  }

  // If roles are specified, check access
  if (allowedRoles.length > 0) {
    const userRole = String(user.role || '')
      .toLowerCase()
      .trim();
    const hasAccess = allowedRoles.some(role => role.toLowerCase().trim() === userRole);

    if (!hasAccess) {
      return null; // Redirect will happen
    }
  }

  return <>{children}</>;
}
