/**
 * Context Layout for Wishlist Tab
 * 
 * This layout manages all nested routes within the Wishlist tab's context.
 * It preserves the tab context when navigating to product details, categories, brands, etc.
 * 
 * Pattern: Context-Preserving Navigation
 * - All routes here stay within the Wishlist tab
 * - User can switch tabs and maintain their position
 * - Back navigation returns to previous screen within Wishlist tab
 */
import { Stack } from 'expo-router';

export default function WishlistContextLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Products Routes */}
      <Stack.Screen name="products/index" />
      <Stack.Screen name="products/[id]" />
      
      {/* Categories Routes */}
      <Stack.Screen name="categories/[id]" />
      
      {/* Brands Routes */}
      <Stack.Screen name="brands/index" />
      <Stack.Screen name="brands/[id]" />
      
      {/* Search Route */}
      <Stack.Screen name="(search)" />
    </Stack>
  );
}
