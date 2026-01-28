import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Dimensions, Pressable, Animated, StyleSheet } from 'react-native';
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
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Use up to 5 banners
  const displayBanners = banners.slice(0, 5);

  useEffect(() => {
    if (!displayBanners.length) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [current, displayBanners]);

  const animate = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  };

  const nextSlide = () => {
    animate();
    setCurrent((p) => (p === displayBanners.length - 1 ? 0 : p + 1));
  };

  const prevSlide = () => {
    animate();
    setCurrent((p) => (p === 0 ? displayBanners.length - 1 : p - 1));
  };

  if (!displayBanners.length) return null;
  const banner = displayBanners[current];

  return (
    <View className="mt-4 h-[300px] w-full overflow-hidden rounded-xl bg-slate-100 relative">
      <Animated.View style={{ opacity: fadeAnim }} className="flex-1">
        {banner.image ? (
          <View className="flex-1 w-full h-full relative">
            {/* DEBUG: Remove this after fixing */}
            <Text className="absolute top-2 left-2 z-50 bg-black/50 text-white text-xs p-1">
              {getImageUrl(banner.image)}
            </Text>
            <Image
              source={{ uri: getImageUrl(banner.image) }}
              className="h-full w-full"
              resizeMode="cover"
              onError={(e) => console.log('Image Load Error:', e.nativeEvent.error)}
            />
            <View className="absolute inset-0 bg-black/40" />
          </View>
        ) : (
          <View className="flex-1 items-center justify-center bg-slate-300">
            <Text>{t('HeroSlider.noImage')}</Text>
          </View>
        )}

        {/* Content Overlay */}
        <View className="absolute inset-0 flex items-center justify-center px-5">
           <View className="w-full">
            <Text className="text-3xl font-bold leading-tight text-white shadow-sm">
                {t('HeroSlider.bigSale')}{' '}
                <Text className="text-green-400">{t('HeroSlider.upTo50Off')}</Text>
            </Text>

            <Text className="mt-3 text-base text-slate-200 shadow-sm">
                {t('HeroSlider.description')}
            </Text>

            <Pressable
                onPress={() => router.push(banner.url as any)}
                className="mt-6 self-start rounded-full bg-white px-8 py-3 active:bg-slate-200"
            >
                <Text className="font-bold text-black">{t('HeroSlider.shopNow')}</Text>
            </Pressable>
           </View>
        </View>
      </Animated.View>

      {/* Controls */}
      <Pressable
        onPress={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 active:bg-white/40"
      >
        <ChevronLeft size={26} color="white" />
      </Pressable>

      <Pressable
        onPress={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 active:bg-white/40"
      >
        <ChevronRight size={26} color="white" />
      </Pressable>

      {/* Dots */}
      <View className="absolute bottom-4 flex-row space-x-2 self-center">
        {displayBanners.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => setCurrent(i)}
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