/**
 * Cart Tab Layout
 * 
 * Manages the Cart tab's navigation stack.
 * The (context) group handles all nested routes via its own _layout.tsx
 * 
 * Note: Cart index has headerShown: true for consistency with cart header
 */
import { Stack } from 'expo-router';
import { useTranslation } from "react-i18next";


export default function CartLayout() {
    const { t } = useTranslation("cart");
  
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
          title: t('Header.title'),
          headerShown: true,
          headerBackVisible: false,   // ✅ يخفي زر الرجوع

        }}
      />
      
      {/* Context group - uses (context)/_layout.tsx for nested routes */}
      <Stack.Screen name="(context)" />
    </Stack>
  );
}
