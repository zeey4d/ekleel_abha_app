import React from 'react';
import { View } from 'react-native';

export const BrandGrid = ({ children }: { children: React.ReactNode }) => {
  return (
    <View className="flex-row flex-wrap gap-6 px-4">
      {children}
    </View>
  );
};