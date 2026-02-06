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

// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   Animated,
//   Dimensions,
//   Linking,
//   ScrollView,
//   NativeSyntheticEvent,
//   NativeScrollEvent,
//   Platform,
// } from 'react-native';
// import { Feather } from '@expo/vector-icons';

// export type Banner = {
//   id: string | number;
//   title?: string;
//   url?: string;
//   image?: string;
// };

// type Props = {
//   banners?: Banner[];
//   autoplayInterval?: number;
//   t?: (key: string) => string;
//   getImageUrl?: (src?: string) => string | undefined;
// };

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// export const HeroSlider: React.FC<Props> = ({
//   banners = [],
//   autoplayInterval = 5000,
//   t,
//   getImageUrl,
// }) => {
//   const displayBanners = banners;
//   const [current, setCurrent] = useState(0);
//   const opacityAnim = useRef<Animated.Value[]>([]).current;
//   const scrollRef = useRef<ScrollView | null>(null);
//   const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

//   // initialize animated values
//   if (opacityAnim.length !== displayBanners.length) {
//     opacityAnim.length = 0;
//     for (let i = 0; i < displayBanners.length; i++) {
//       opacityAnim.push(new Animated.Value(i === 0 ? 1 : 0));
//     }
//   }

//   // autoplay (scroll programmatically)
//   useEffect(() => {
//     if (!displayBanners || displayBanners.length === 0) return;

//     if (autoplayTimer.current) clearInterval(autoplayTimer.current);
//     autoplayTimer.current = setInterval(() => {
//       const next = (current + 1) % displayBanners.length;
//       scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH * 0.94, animated: true });
//       setCurrent(next);
//     }, autoplayInterval);

//     return () => {
//       if (autoplayTimer.current) clearInterval(autoplayTimer.current);
//     };
//   }, [displayBanners, autoplayInterval, current]);

//   // animate opacity on current change
//   useEffect(() => {
//     opacityAnim.forEach((anim, idx) => {
//       Animated.timing(anim, {
//         toValue: idx === current ? 1 : 0,
//         duration: 400,
//         useNativeDriver: true,
//       }).start();
//     });
//   }, [current, opacityAnim]);

//   const openUrl = async (url?: string) => {
//     if (!url) return;
//     try {
//       const supported = await Linking.canOpenURL(url);
//       if (supported) await Linking.openURL(url);
//     } catch {
//       // ignore
//     }
//   };

//   const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
//     const offsetX = e.nativeEvent.contentOffset.x;
//     const containerWidth = e.nativeEvent.layoutMeasurement.width;
//     const index = Math.round(offsetX / containerWidth);
//     setCurrent(index);
//   };

//   const nextSlide = () => {
//     const next = current === displayBanners.length - 1 ? 0 : current + 1;
//     scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH * 0.94, animated: true });
//     setCurrent(next);
//   };

//   const prevSlide = () => {
//     const prev = current === 0 ? displayBanners.length - 1 : current - 1;
//     scrollRef.current?.scrollTo({ x: prev * SCREEN_WIDTH * 0.94, animated: true });
//     setCurrent(prev);
//   };

//   if (!displayBanners || displayBanners.length === 0) return null;

//   return (
//     <View style={styles.container}>
//       <ScrollView
//         ref={scrollRef}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         onMomentumScrollEnd={onMomentumScrollEnd}
//         contentContainerStyle={{ width: SCREEN_WIDTH * 0.94 * displayBanners.length }}
//         decelerationRate="fast"
//         snapToInterval={SCREEN_WIDTH * 0.94}
//       >
//         {displayBanners.map((banner, index) => {
//           const imageSource = getImageUrl ? getImageUrl(banner.image) : banner.image;
//           return (
//             <Animated.View
//               key={banner.id}
//               style={[
//                 styles.slide,
//                 { opacity: opacityAnim[index], width: SCREEN_WIDTH * 0.94 },
//               ]}
//             >
//               {imageSource ? (
//                 <TouchableOpacity
//                   activeOpacity={0.9}
//                   style={styles.imageWrapper}
//                   onPress={() => openUrl(banner.url)}
//                 >
//                   <Image
//                     source={{ uri: imageSource }}
//                     style={styles.image}
//                     resizeMode="cover"
//                   />
//                 </TouchableOpacity>
//               ) : (
//                 <View style={styles.noImage}>
//                   <Text style={styles.noImageText}>
//                     {t ? t('HeroSlider.noImage') : 'No image available'}
//                   </Text>
//                 </View>
//               )}
//             </Animated.View>
//           );
//         })}
//       </ScrollView>

//       <TouchableOpacity style={[styles.control, styles.leftControl]} onPress={prevSlide}>
//         <Feather name="chevron-left" size={28} color="#fff" />
//       </TouchableOpacity>

//       <TouchableOpacity style={[styles.control, styles.rightControl]} onPress={nextSlide}>
//         <Feather name="chevron-right" size={28} color="#fff" />
//       </TouchableOpacity>

//       <View style={styles.dotsRow}>
//         {displayBanners.map((_, idx) => (
//           <TouchableOpacity
//             key={idx}
//             onPress={() => {
//               scrollRef.current?.scrollTo({ x: idx * SCREEN_WIDTH * 0.94, animated: true });
//               setCurrent(idx);
//             }}
//             style={[
//               styles.dot,
//               idx === current ? styles.dotActive : styles.dotInactive,
//             ]}
//           />
//         ))}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: SCREEN_WIDTH * 0.94,
//     aspectRatio: 19 / 5,
//     alignSelf: 'center',
//     borderRadius: 6,
//     overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
//     backgroundColor: '#e2e8f0',
//     marginTop: 16,
//   },
//   slide: {
//     height: '100%',
//   },
//   imageWrapper: {
//     flex: 1,
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 6,
//   },
//   noImage: {
//     flex: 1,
//     backgroundColor: '#cbd5e1',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   noImageText: {
//     color: '#334155',
//     fontSize: 16,
//   },
//   control: {
//     position: 'absolute',
//     top: '50%',
//     marginTop: -22,
//     zIndex: 30,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     padding: 8,
//     borderRadius: 999,
//   },
//   leftControl: {
//     left: 12,
//   },
//   rightControl: {
//     right: 12,
//   },
//   dotsRow: {
//     position: 'absolute',
//     bottom: 12,
//     left: 0,
//     right: 0,
//     zIndex: 30,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     gap: 8,
//   },
//   dot: {
//     borderRadius: 999,
//     marginHorizontal: 4,
//   },
//   dotActive: {
//     width: 16,
//     height: 8,
//     backgroundColor: '#fff',
//   },
//   dotInactive: {
//     width: 8,
//     height: 8,
//     backgroundColor: 'rgba(255,255,255,0.5)',
//   },
// });
