import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';

import  NewArrivalsContent  from '@/components/features/product/NewArrivalsContent';

export default function NewArrivalsScreen() {

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerShown: false,
          headerShadowVisible: false,
          headerLeft: () => null, // لأننا سنعالج الرجوع داخل المحتوى
        }}
      />

      <NewArrivalsContent />
    </View>
  );
}
