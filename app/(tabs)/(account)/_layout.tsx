import { Stack } from 'expo-router';
import React from 'react';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="addresses" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="language" />
    </Stack>
  );
}
