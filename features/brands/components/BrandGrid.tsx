import React from 'react';
import { View } from 'react-native';

export const BrandGrid = ({ children }: { children: React.ReactNode }) => {
  return (
    <View className="flex-row flex-wrap justify-between px-4" style={{ rowGap: 24 }}>
      {children}
    </View>
  );
};