import React from 'react';
import { Tabs } from 'expo-router';
import { HomeIcon, GridIcon, ShoppingCartIcon, HeartIcon, UserIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

export default function TabsLayout() {
  const { t } = useTranslation('tabs');
  const insets = useSafeAreaInsets();

  return (
<Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#070707',
        tabBarInactiveTintColor: '#d3d3d3',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0.5,
          borderTopColor: '#f0f0f0',
          // الحل هنا: تحديد ارتفاع ثابت يتكيف مع مساحة الأمان
          height: Platform.OS === 'ios' ? 50 + insets.bottom : 60,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10, // تصغير حجم الخط لمنع التمدد
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 0 : 5, 
        },
        tabBarIconStyle: {
          marginBottom: -2, // لتقريب الأيقونة من النص قليلاً
        }
      }}
    >

            {/* Wishlist Tab */}
      <Tabs.Screen
        name="(wishlist)"
        options={{
          title: t('Wishlist'),
          tabBarIcon: ({ color, size }) => <HeartIcon size={size} color={color} />,
          tabBarAccessibilityLabel: t('Wishlist'),
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
            {/* Home Tab */}
      <Tabs.Screen
        name="(home)"
        options={{
          title: t('Home'),
          tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
          tabBarAccessibilityLabel: t('Home'),
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


      
      {/* Account Tab */}
      <Tabs.Screen
        name="(auth)"
        options={{
          title: t('Account'),
          tabBarIcon: ({ color, size }) => <UserIcon size={size} color={color} />,
          tabBarAccessibilityLabel: t('Account'),
        }}
      />

       {/* Shared Product Details - Hidden Tab */}
       <Tabs.Screen
        name="products"
        options={{
          href: null,
          title: '',
        }}
      />
    </Tabs>
  );
}