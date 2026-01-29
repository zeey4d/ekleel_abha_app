import { Stack } from 'expo-router';
import AppHeader from '@/components/navigation/AppHeader';

export default function CartLayout() {
  return (
    <Stack
      screenOptions={{
        header: (props) => <AppHeader {...props} />,
        animation: 'slide_from_right',
      }}
    />
  );
}
