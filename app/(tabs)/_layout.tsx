import React from 'react';
import { Tabs } from 'expo-router';
import { HomeIcon, GridIcon, ShoppingCartIcon, HeartIcon, UserIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const { t } = useTranslation('tabs');
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#070707ff',
        tabBarInactiveTintColor: '#d3d3d3ff',
        tabBarStyle: {
          // height: TAB_BAR_HEIGHT,
          // paddingBottom: 20,
          borderTopWidth: 0,
          height: 60 + insets.bottom, // نأخذ الارتفاع الأساسي ونضيف عليه مساحة الأمان
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10, // إذا كان الجهاز قديماً نضع 10، وإذا كان حديثاً نستخدم مساحة الأمان
          marginTop: 10,
          paddingTop: 10,
          backgroundColor: '#ffffff',
        },
        tabBarHideOnKeyboard: true,
        lazy: true, // Lazy loading for performance
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('Home'),
          tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
          tabBarAccessibilityLabel: t('Home'),
        }}
      />
      
      {/* Categories Tab */}
      <Tabs.Screen
        name="(categories)"
        options={{
          title: t('Categories'),
          tabBarIcon: ({ color, size }) => <GridIcon size={size} color={color} />,
          tabBarAccessibilityLabel: t('Categories'),
        }}
      />
      
      {/* Cart Tab */}
      <Tabs.Screen
        name="(cart)"
        options={{
          title: t('Shopping Cart'),
          tabBarIcon: ({ color, size }) => <ShoppingCartIcon size={size} color={color} />,
          tabBarAccessibilityLabel: t('Shopping Cart'),
        }}
      />
      
      {/* Wishlist Tab */}
      <Tabs.Screen
        name="(wishlist)"
        options={{
          title: t('Wishlist'),
          tabBarIcon: ({ color, size }) => <HeartIcon size={size} color={color} />,
          tabBarAccessibilityLabel: t('Wishlist'),
        }}
      />
      
      {/* Account Tab */}
      <Tabs.Screen
        name="(auth)"
        options={{
          title: t('Account'),
          tabBarIcon: ({ color, size }) => <UserIcon size={size} color={color} />,
          tabBarAccessibilityLabel: t('Account'),
        }}
      />
    </Tabs>
  );
}
