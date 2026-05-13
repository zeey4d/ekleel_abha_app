import React, { useRef, useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Dimensions, NativeSyntheticEvent, NativeScrollEvent, I18nManager } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';

const TEAL = "#0d9488";

interface Brand {
  id: number;
  name: string;
  image: string | null;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 items per row with padding
const PAGE_WIDTH = width;

export const FeaturedBrands = ({ brands }: { brands: Brand[] }) => {
  const { t } = useTranslation('home');
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Group brands into pages of 4 (2 rows x 2 columns)
  const pages: Brand[][] = [];
  for (let i = 0; i < brands.length; i += 4) {
    pages.push(brands.slice(i, i + 4));
  }

  // Auto-scroll every 3 seconds
  useEffect(() => {
    if (pages.length <= 1) return;
    const timer = setInterval(() => {
      const nextPage = currentPage === pages.length - 1 ? 0 : currentPage + 1;
      flatListRef.current?.scrollToIndex({ index: nextPage, animated: true });
      setCurrentPage(nextPage);
    }, 3000);
    return () => clearInterval(timer);
  }, [currentPage, pages.length]);

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / PAGE_WIDTH);
    setCurrentPage(index);
  };

  const renderBrandItem = (brand: Brand) => (
    <Pressable
      key={brand.id}
      onPress={() => router.push(`/(tabs)/(home)/(context)/brands/${brand.id}` as any)}
      className="bg-white border border-slate-50 rounded-[32px] items-center justify-center p-4 m-2 shadow-sm"
      style={{ width: ITEM_WIDTH, height: ITEM_WIDTH * 0.9 }}
    >
      {brand.image ? (
        <Image
          source={{ uri: getImageUrl(brand.image) }}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          transition={200}
        />
      ) : (
        <View className="w-full h-full items-center justify-center">
          <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-slate-400 text-center">{brand.name}</Text>
        </View>
      )}
    </Pressable>
  );

  const renderPage = ({ item: page }: { item: Brand[] }) => (
    <View style={{ width: PAGE_WIDTH, paddingHorizontal: 12 }}>
      {/* Row 1 */}
      <View className="flex-row justify-between">
        {page.slice(0, 2).map(renderBrandItem)}
      </View>
      {/* Row 2 */}
      <View className="flex-row justify-between">
        {page.slice(2, 4).map(renderBrandItem)}
      </View>
    </View>
  );

  if (!brands || brands.length === 0) return null;

  return (
    <View className="w-full py-4">
      {/* Header */}
      <View
        className="px-4 mb-4 flex-row items-center justify-between"
        style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}
      >
        <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-xl text-slate-800">{t('FeaturedBrands.title', { defaultValue: 'الماركات المميزة' })}</Text>
        <Pressable
          onPress={() => router.push('/(tabs)/(home)/(context)/brands' as any)}
          className="flex-row items-center gap-1"
          style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}
        >
          <Text style={{ fontFamily: 'Tajawal_700Bold', color: TEAL }} className="text-sm">{t('FeaturedBrands.viewAll', { defaultValue: 'عرض الكل' })}</Text>
          {I18nManager.isRTL ? (
            <ArrowLeft size={16} color={TEAL} />
          ) : (
            <ArrowRight size={16} color={TEAL} />
          )}
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderPage}
        keyExtractor={(_, index) => `page-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollToIndexFailed={() => {}}
        style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}
      />

      {/* Pagination Dots */}
      {pages.length > 1 && (
        <View className="flex-row justify-center items-center mt-3 gap-2" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
          {pages.map((_, index) => (
            <View
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentPage === index ? 'w-5 bg-[#0d9488]' : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </View>
      )}
    </View>
  )
};
