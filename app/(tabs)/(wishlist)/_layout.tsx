/**
 * Wishlist Tab Layout
 * 
 * Manages the Wishlist tab's navigation stack.
 * The (context) group handles all nested routes via its own _layout.tsx
 * 
 * Benefits:
 * - Simplified configuration
 * - Centralized nested route management in (context)/_layout.tsx
 * - Easier maintenance
 */
import { Stack } from 'expo-router';

export default function WishlistLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main Wishlist Screen */}
      <Stack.Screen name="index" />
      
      {/* Context group - uses (context)/_layout.tsx for nested routes */}
      <Stack.Screen name="(context)" />
    </Stack>
  );
}
