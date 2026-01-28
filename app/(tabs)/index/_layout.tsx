import { Stack } from 'expo-router';
import AppHeader from '@/components/navigation/AppHeader';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        header: (props) => <AppHeader {...props} />,
      }}
    />
  );
}
