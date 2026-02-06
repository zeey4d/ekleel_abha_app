/**
 * Cart Tab Layout
 * 
 * Manages the Cart tab's navigation stack.
 * The (context) group handles all nested routes via its own _layout.tsx
 * 
 * Note: Cart index has headerShown: true for consistency with cart header
 */
import { Stack } from 'expo-router';

export default function CartLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main Cart Screen - with header visible */}
      <Stack.Screen
        name="index"
        options={{
          title: 'Cart',
          headerShown: true,
        }}
      />
      
      {/* Context group - uses (context)/_layout.tsx for nested routes */}
      <Stack.Screen name="(context)" />
    </Stack>
  );
}
