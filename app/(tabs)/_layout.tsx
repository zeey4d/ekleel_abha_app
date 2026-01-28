import React from 'react';
import { Tabs } from 'expo-router';
import AppHeader from '@/components/navigation/AppHeader';
import { HomeIcon, GridIcon, ShoppingCartIcon, HeartIcon, UserIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function TabsLayout() {
  const { t } = useTranslation('tabs');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#070707ff',
        tabBarInactiveTintColor: '#d3d3d3ff',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingBottom: 2,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('Home'),
          tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="megamenu"
        options={{
          title: t('Categories'),
          tabBarIcon: ({ color, size }) => <GridIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('Shopping Cart'),
          tabBarIcon: ({ color, size }) => <ShoppingCartIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: t('Wishlist'),
          tabBarIcon: ({ color, size }) => <HeartIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(auth)/account"
        options={{
          title: t('Account'),
          tabBarIcon: ({ color, size }) => <UserIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(shop)"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
