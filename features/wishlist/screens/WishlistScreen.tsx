import React from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Link, useRouter } from 'expo-router';
import { useGetWishlistQuery } from '@/store/features/wishlist/wishlistSlice';
import { Heart, ArrowLeft } from 'lucide-react-native';
import { WishlistCard } from '@/features/products/components/WishlistCard';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WishlistScreen() {
  const TEAL = "#0d9488";
  const { t, i18n } = useTranslation('account');
  const isRTL = i18n.language === 'ar';
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: wishlistState, isLoading } = useGetWishlistQuery({});
  
  const wishlistItems = wishlistState?.ids.map(id => wishlistState.entities[id]).filter(Boolean) || [];

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#f8fafc]">
        <ActivityIndicator size="large" color={TEAL} />
        <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-slate-500 mt-4">{t('wishlist')}...</Text>
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
    <View className="flex-1 bg-[#f8fafc]" style={{ paddingTop: insets.top }}>
      {wishlistItems.length === 0 ? (
        <View className="flex-1 justify-center items-center p-8">
          <View className="w-24 h-24 bg-teal-50 rounded-full justify-center items-center mb-8">
            <Heart size={48} color={TEAL} fill={TEAL + "20"} />
          </View>
          <Text style={{ fontFamily: 'Tajawal_800ExtraBold' }} className="text-2xl text-slate-900 mb-3 text-center">
            {t('emptyWishlist', { defaultValue: 'قائمة الأمنيات فارغة' })}
          </Text>
          <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-slate-500 text-center mb-10 leading-6 max-w-[280px]">
            {t('emptyWishlistDesc', { defaultValue: 'ابدأ بإضافة المنتجات التي تعجبك لتجدها هنا لاحقاً' })}
          </Text>
          <Link href="/(tabs)/(home)" asChild>
            <Pressable 
              className="bg-teal-600 px-12 py-4 rounded-[32px] shadow-lg active:opacity-90"
              style={{ shadowColor: TEAL, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }}
            >
              <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-white text-base">{t('startShopping', { defaultValue: 'ابدأ التسوق' })}</Text>
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
              <View 
                className="py-6 mb-4 flex-row justify-between items-center"
                style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
              >
                {/* <Text style={{ fontFamily: 'Tajawal_800ExtraBold' }} className="text-2xl text-slate-900">
                  {t('myWishlist', { defaultValue: 'قائمة أمنياتي' })}
                </Text>
                <View className="bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                  <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-teal-600 text-xs">
                    {wishlistItems.length} {t('items', { defaultValue: 'منتج' })}
                  </Text>
                </View> */}
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}
