import React from 'react';
import { Tabs } from 'expo-router';
import { HomeIcon, LayersIcon, ShoppingCartIcon, HeartIcon, UserIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Image, View, Text } from 'react-native';
import { useAppSelector } from '@/store/hooks';
import { selectTotalCartItems, useGetCartQuery } from '@/store/features/cart/cartSlice';
import { selectWishlistCount, useGetWishlistQuery } from '@/store/features/wishlist/wishlistSlice';
import { useGetMeQuery } from '@/store/features/auth/authSlice';

export default function TabsLayout() {
  const { t } = useTranslation('tabs');
  const insets = useSafeAreaInsets();

  // Ensure data is loaded
  useGetCartQuery();
  useGetWishlistQuery({});
  const { data: user } = useGetMeQuery();
  const isAuthenticated = !!user;

  const cartCount = useAppSelector(selectTotalCartItems);
  const wishlistCount = useAppSelector(selectWishlistCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#070707',
        tabBarInactiveTintColor: '#868686',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 60 + (insets.bottom > 0 ? insets.bottom : 12),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
          paddingTop: 8,
          backgroundColor: '#ffffff', // Ensures solid background
          borderTopWidth: 1, // Optional: add border if needed
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        }
      }}
    >
      <Tabs.Screen
        name="(wishlist)"
        options={{
          title: t('Wishlist'),
          tabBarIcon: ({ color, size }) => <HeartIcon size={size} color={color} />,
          tabBarBadge: wishlistCount > 0 ? wishlistCount : undefined,
        }}
      />

      <Tabs.Screen
        name="(categories)"
        options={{
          title: t('Categories'),
          tabBarIcon: ({ color, size }) => <LayersIcon size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="(home)"
        options={{
          title: t('Home'),
          tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="(cart)"
        options={{
          title: t('Shopping Cart'),
          tabBarIcon: ({ color, size }) => <ShoppingCartIcon size={size} color={color} />,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />

      <Tabs.Screen
        name="(account)"
        options={{
          title: t('Account'),
          tabBarIcon: ({ color, size }) => {
            if (isAuthenticated && user) {
               return (
                 <View style={{ width: size + 4, height: size + 4, borderRadius: (size + 4) / 2, overflow: 'hidden', borderWidth: 1.5, borderColor: color, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
                    {(user as any).avatar ? (
                      <Image source={{ uri: (user as any).avatar }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Text style={{ fontSize: size * 0.5, fontWeight: 'bold', color: color }}>
                        {user.full_name?.[0]?.toUpperCase() || user.firstname?.[0]?.toUpperCase() || (user as any).name?.[0]?.toUpperCase() || 'U'}
                      </Text>
                    )}
                 </View>
               );
            }
            return <UserIcon size={size} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}