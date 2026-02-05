import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStatus } from '@/hooks/useAuthGuard';

/**
 * Auth Tab Index - Redirects based on authentication status
 * - Logged in: Profile screen
 * - Not logged in: Login screen
 */
export default function AuthIndexScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStatus();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.replace('/(tabs)/(auth)/profile' as any);
    } else {
      router.replace('/(tabs)/(auth)/login' as any);
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while determining auth state
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#020617" />
    </View>
  );
}
