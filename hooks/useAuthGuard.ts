import { useEffect, useState } from 'react';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, useGetMeQuery } from '@/store/features/auth/authSlice';

interface UseAuthGuardOptions {
  /** The route to redirect to within the same tab stack */
  loginRoute?: string;
  /** Whether this hook should perform redirect */
  enabled?: boolean;
}

interface UseAuthGuardResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
}

/**
 * Hook for auth-guarding screens within tab stacks.
 * Automatically redirects to login screen within the same tab context.
 * 
 * @example
 * // In (wishlist)/index.tsx
 * const { isAuthenticated, isLoading } = useAuthGuard({
 *   loginRoute: '/(tabs)/(wishlist)/login'
 * });
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}): UseAuthGuardResult {
  const { loginRoute, enabled = true } = options;
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: user, isLoading, isFetching } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Skip if disabled or still loading
    if (!enabled || isLoading || isFetching) return;
    
    // Skip if already on login page
    if (pathname.includes('/login') || pathname.includes('/register')) return;
    
    // Redirect to login if not authenticated
    if (!isAuthenticated && loginRoute && !hasRedirected) {
      setHasRedirected(true);
      router.replace(loginRoute as any);
    }
    
    // Reset redirect state when user becomes authenticated
    if (isAuthenticated && hasRedirected) {
      setHasRedirected(false);
    }
  }, [isAuthenticated, isLoading, isFetching, enabled, loginRoute, pathname, hasRedirected, router]);

  return {
    isAuthenticated,
    isLoading: isLoading || isFetching,
    user,
  };
}

/**
 * Simple hook to check auth status without redirecting.
 * Useful for conditional rendering.
 */
export function useAuthStatus() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: user, isLoading } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  return {
    isAuthenticated,
    isLoading,
    user,
  };
}
