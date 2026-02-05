import { Stack } from 'expo-router';
// import { useTranslation } from 'react-i18next';

export default function CartLayout() {
  // const { t } = useTranslation('cart'); 

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
          name="index"
          options={{
            title: 'Cart',
            headerShown: true, 
          }}
      />
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
