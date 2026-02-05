import { Stack } from 'expo-router';

export default function WishlistLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      
      {/* Context Routes */}
      <Stack.Screen name="(context)/products/index" options={{ headerShown: false }} />
      <Stack.Screen name="(context)/products/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="(context)/categories/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="(context)/brands/index" options={{ headerShown: false }} />
      <Stack.Screen name="(context)/brands/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="(context)/search/index" options={{ headerShown: false }} />
    </Stack>
  );
}
