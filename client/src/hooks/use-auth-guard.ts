import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';

/**
 * A custom hook to protect routes based on authentication and role
 * @param requiredRole Optional role requirement ('buyer' or 'seller')
 * @returns Boolean indicating if the user is authorized
 */
export const useAuthGuard = (requiredRole?: 'buyer' | 'seller'): boolean => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check role if required
    if (requiredRole && user?.role !== requiredRole) {
      navigate('/dashboard');
      return;
    }
  }, [isAuthenticated, user, isLoading, requiredRole, navigate]);

  return isAuthenticated && (!requiredRole || user?.role === requiredRole);
};

export default useAuthGuard;
