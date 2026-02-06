/**
 * Categories Tab Layout
 * 
 * Manages the Categories tab's navigation stack.
 * The (context) group handles all nested routes via its own _layout.tsx
 * 
 * Benefits:
 * - Simplified configuration
 * - Centralized nested route management in (context)/_layout.tsx
 * - Easier maintenance
 */
import { Stack } from 'expo-router';

export default function CategoriesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main Categories Screen */}
      <Stack.Screen name="index" />
      
      {/* Context group - uses (context)/_layout.tsx for nested routes */}
      <Stack.Screen name="(context)" />
    </Stack>
  );
}
