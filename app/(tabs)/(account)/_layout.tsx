import { Stack } from 'expo-router';
import AppHeader from '@/components/navigation/AppHeader';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
                headerShown: false,

        animation: 'slide_from_right',
      }}
    />
  );
}
