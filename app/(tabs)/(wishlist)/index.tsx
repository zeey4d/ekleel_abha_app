import React from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Link, useRouter } from 'expo-router';
import { useGetWishlistQuery } from '@/store/features/wishlist/wishlistSlice';
import { Heart, ArrowLeft } from 'lucide-react-native';
import { WishlistCard } from '@/components/products/WishlistCard';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WishlistScreen() {
  const { t } = useTranslation('account');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: wishlistState, isLoading } = useGetWishlistQuery({});
  
  const wishlistItems = wishlistState?.ids.map(id => wishlistState.entities[id]).filter(Boolean) || [];

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-gray-500 mt-4">{t('wishlist')}...</Text>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify()}
      style={{ marginBottom: 16 }}
    >
      <WishlistCard product={item} />
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {wishlistItems.length === 0 ? (
        <View className="flex-1 justify-center items-center p-8">
          <View className="w-20 h-20 bg-gray-100 rounded-full justify-center items-center mb-6">
            <Heart size={32} color="#9CA3AF" />
          </View>
          <Text className="text-xl font-bold text-foreground mb-2 text-center">
            {t('emptyWishlist')}
          </Text>
          <Text className="text-gray-500 text-center mb-8 leading-relaxed">
            {t('emptyWishlistDesc')}
          </Text>
          <Link href="/(tabs)/(home)" asChild>
            <Pressable className="bg-brand-green px-8 py-3 rounded-full">
              <Text className="text-white font-bold">{t('startShopping')}</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <View className="flex-1">
          <FlatList
            data={wishlistItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <View className="py-4 mb-2 border-b border-gray-100 dark:border-slate-800 flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-foreground text-left">
                  {t('myWishlist')}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {wishlistItems.length} {t('items')}
                </Text>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}


