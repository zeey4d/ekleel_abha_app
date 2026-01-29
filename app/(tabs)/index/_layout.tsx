// app/(tabs)/home/_layout.tsx
import { Stack } from 'expo-router';
import AppHeader from '@/components/navigation/AppHeader';
import HomeHeader from '@/components/layout/HomeHeader';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          header: (props) => <HomeHeader />,
        }}
      />
    </Stack>
  );
}
