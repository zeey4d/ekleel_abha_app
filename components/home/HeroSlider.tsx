import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Dimensions, Pressable, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { getImageUrl } from '@/lib/image-utils';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Banner } from '@/store/types';
import { cn } from '@/lib/utils';

const { width } = Dimensions.get('window');

export function HeroSlider({ banners = [] }: { banners: Banner[] }) {
  const { t } = useTranslation('home');
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const displayBanners = banners.slice(0, 5);

  // التمرير التلقائي
  useEffect(() => {
    if (!displayBanners.length) return;

    const timer = setInterval(() => {
      let nextIndex = current === displayBanners.length - 1 ? 0 : current + 1;
      scrollToIndex(nextIndex);
    }, 5000);

    return () => clearInterval(timer);
  }, [current, displayBanners]);

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    setCurrent(index);
  };

  // تحديث النقطة النشطة عند السحب بالإصبع
  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrent(index);
  };

  if (!displayBanners.length) return null;

  return (
    <View className=" h-[400px] w-full bg-slate-100 relative">
      <FlatList
        ref={flatListRef}
        data={displayBanners}
        horizontal
        pagingEnabled // هذا ما يسمح بالسحب "صفحة بصفحة"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ width }} className="h-full relative">
            {item.image ? (
              <View className="flex-1 w-full h-full relative">
                <Image
                  source={{ uri: getImageUrl(item.image) }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/40" />
              </View>
            ) : (
              <View className="flex-1 items-center justify-center bg-slate-300">
                <Text>{t('HeroSlider.noImage')}</Text>
              </View>
            )}

            {/* محتوى النص فوق الصورة */}
            <View className="absolute inset-0 flex items-center justify-center px-5">
              <View className="w-full">
                <Text className="text-3xl font-bold leading-tight text-white">
                  {t('HeroSlider.bigSale')}{' '}
                  <Text className="text-green-400">{t('HeroSlider.upTo50Off')}</Text>
                </Text>

                <Text className="mt-3 text-base text-slate-200">
                  {t('HeroSlider.description')}
                </Text>

                <Pressable
                  onPress={() => router.push(item.url as any)}
                  className="mt-6 self-start rounded-full bg-white px-8 py-3 active:bg-slate-200"
                >
                  <Text className="font-bold text-black">{t('HeroSlider.shopNow')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      {/* أزرار التحكم (اختياري يمكنك حذفها لأن السحب بالإصبع يكفي) */}
      {/* <Pressable
        onPress={() => scrollToIndex(current === 0 ? displayBanners.length - 1 : current - 1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/20 p-2"
      >
        <ChevronLeft size={26} color="white" />
      </Pressable>

      <Pressable
        onPress={() => scrollToIndex(current === displayBanners.length - 1 ? 0 : current + 1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/20 p-2"
      >
        <ChevronRight size={26} color="white" />
      </Pressable> */}

      {/* النقاط السفلية (Dots) */}
      <View className="absolute bottom-4 flex-row space-x-2 self-center z-10">
        {displayBanners.map((_, i) => (
          <View
            key={i}
            className={cn(
              "h-2 rounded-full transition-all",
              current === i ? "w-6 bg-white" : "w-2 bg-white/50"
            )}
          />
        ))}
      </View>
    </View>
  );
}