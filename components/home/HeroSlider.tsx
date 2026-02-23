// import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   Dimensions,
//   FlatList,
//   NativeSyntheticEvent,
//   NativeScrollEvent,
//   StyleSheet,
//   Platform,
// } from 'react-native';
// import { useTranslation } from 'react-i18next';
// import { useRouter } from 'expo-router';
// import { getImageUrl } from '@/lib/image-utils';
// import { getAppRoute } from '@/lib/url-utils';
// import { LinearGradient } from 'expo-linear-gradient';

// const { width } = Dimensions.get('window');

// // ⚡ PERFORMANCE CONFIG
// // Taller Aspect Ratio (3:4) for better mobile visibility
// const ASPECT_RATIO = 0.95;
// const BANNER_HEIGHT = width * ASPECT_RATIO;
// const AUTO_PLAY_INTERVAL = 5000;

// interface Banner {
//   id: number | string;
//   image?: string | null;
//   url?: string | null;
//   title?: string | null;
// }

// interface HeroSliderProps {
//   banners: Banner[];
// }

// // ------------------------------------------------------------------
// // 1. Optimized Banner Item (React.memo to prevent re-renders)
// // ------------------------------------------------------------------
// const BannerItem = React.memo(
//   ({ item, onPress }: { item: Banner; onPress: (item: Banner) => void }) => {
//     const { t } = useTranslation('home');
//     const imageUrl = useMemo(() => getImageUrl(item.image), [item.image]);
//     const [hasError, setHasError] = useState(false);

//     return (
//       <TouchableOpacity
//         activeOpacity={0.9}
//         onPress={() => onPress(item)}
//         style={[styles.bannerContainer, { width, height: BANNER_HEIGHT }]}
//       >
//         {item.image && !hasError ? (
//           <Image
//             source={{ uri: imageUrl }}
//             resizeMode="cover" // Cover ensures no empty space (best for 16:9 container)
//             style={styles.image}
//             onError={() => setHasError(true)}
//           />
//         ) : (
//           <View style={styles.placeholderContainer}>
//             <Text style={styles.placeholderText}>
//               {hasError ? t('common.imageError', 'Image failed') : t('HeroSlider.noImage', 'No Image')}
//             </Text>
//           </View>
//         )}

//         {/* Gradient Overlay for Smooth Transition to Page */}
//         <LinearGradient
//           pointerEvents="none"
//           colors={[
//             'transparent',
//             'rgba(255,255,255,0.1)',
//             'rgba(255,255,255,0.6)',
//             '#ffffff',
//           ]}
//           locations={[0, 0.6, 0.85, 1]}
//           style={[styles.gradient, { height: BANNER_HEIGHT * 0.3 }]} 
//         />
//       </TouchableOpacity>
//     );
//   },
//   (prev, next) => prev.item.id === next.item.id && prev.item.image === next.item.image
// );

// // ------------------------------------------------------------------
// // 2. High-Performance Slider Container
// // ------------------------------------------------------------------
// export const HeroSlider = ({ banners = [] }: HeroSliderProps) => {
//   const router = useRouter();
//   const flatListRef = useRef<FlatList>(null);
//   const [current, setCurrent] = useState(0);

//   // Prefetch next image for smoother transition
//   useEffect(() => {
//     if (banners.length > 1) {
//       const nextIndex = (current + 1) % banners.length;
//       const nextImage = banners[nextIndex]?.image;
//       if (nextImage) {
//         Image.prefetch(getImageUrl(nextImage)).catch(() => {});
//       }
//     }
//   }, [current, banners]);

//   // Auto Play Logic
//   useEffect(() => {
//     if (banners.length <= 1) return;

//     const timer = setInterval(() => {
//       const nextIndex = (current + 1) % banners.length;
//       flatListRef.current?.scrollToIndex({
//         index: nextIndex,
//         animated: true,
//       });
//       setCurrent(nextIndex);
//     }, AUTO_PLAY_INTERVAL);

//     return () => clearInterval(timer);
//   }, [current, banners.length]);

//   const handleBannerPress = useCallback(
//     (item: Banner) => {
//       const route = getAppRoute(item.url);
//       if (route) router.push(route as any);
//     },
//     [router]
//   );

//   const renderItem = useCallback(
//     ({ item }: { item: Banner }) => (
//       <BannerItem item={item} onPress={handleBannerPress} />
//     ),
//     [handleBannerPress]
//   );

//   const onMomentumScrollEnd = useCallback(
//     (event: NativeSyntheticEvent<NativeScrollEvent>) => {
//       const index = Math.round(event.nativeEvent.contentOffset.x / width);
//       setCurrent(index);
//     },
//     []
//   );

//   const getItemLayout = useCallback(
//     (_: any, index: number) => ({
//       length: width,
//       offset: width * index,
//       index,
//     }),
//     []
//   );

//   const keyExtractor = useCallback((item: Banner) => String(item.id), []);

//   if (!banners.length) return null;

//   return (
//     <View style={[styles.container, { height: BANNER_HEIGHT }]}>
//       <FlatList
//         ref={flatListRef}
//         data={banners}
//         renderItem={renderItem}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={keyExtractor}
//         onMomentumScrollEnd={onMomentumScrollEnd}
//         getItemLayout={getItemLayout}
        
//         // ⚡ FlatList Performance Props
//         initialNumToRender={1}
//         maxToRenderPerBatch={2}
//         windowSize={3}
//         removeClippedSubviews={Platform.OS === 'android'}
//         decelerationRate="fast"
//         snapToInterval={width}
//         snapToAlignment="center"
//         scrollEventThrottle={16}
//       />

//       {/* Dots Indicator */}
//       {banners.length > 1 && (
//         <View style={styles.dotsContainer}>
//           {banners.map((_, idx) => (
//             <View
//               key={idx}
//               style={[
//                 styles.dot,
//                 idx === current ? styles.activeDot : styles.inactiveDot,
//               ]}
//             />
//           ))}
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#fff',
//     position: 'relative',
//   },
//   bannerContainer: {
//     backgroundColor: '#f1f5f9', // slate-100 placeholder
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//   },
//   placeholderContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#e2e8f0', // slate-200
//   },
//   placeholderText: {
//     color: '#64748b', // slate-500
//   },
//   gradient: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     zIndex: 10,
//   },
//   dotsContainer: {
//     position: 'absolute',
//     bottom: 12,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     gap: 8,
//   },
//   dot: {
//     height: 8,
//     borderRadius: 4,
//   },
//   activeDot: {
//     width: 24,
//     backgroundColor: '#2c7c7b',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1.41,
//     elevation: 2,
//   },
//   inactiveDot: {
//     width: 8,
//     backgroundColor: 'rgba(255, 255, 255, 0.7)',
//   },
// });


import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { getImageUrl } from '@/lib/image-utils';
import { getAppRoute } from '@/lib/url-utils';
import { LinearGradient } from 'expo-linear-gradient';


const { width } = Dimensions.get('window');
// Use 3:4 aspect ratio or similar for taller mobile banners
const BANNER_HEIGHT = width * 1.15;

interface Banner {
  id: number | string;
  image?: string | null;
  url?: string | null;
  title?: string | null;
}

interface HeroSliderProps {
  banners: Banner[];
}



export const HeroSlider = ({ banners = [] }: HeroSliderProps) => {
  const { t } = useTranslation('home');
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [current, setCurrent] = useState(0);

  // Auto play
  useEffect(() => {
    if (!banners.length || banners.length === 1) return;

    const timer = setInterval(() => {
      const nextIndex = current === banners.length - 1 ? 0 : current + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrent(nextIndex);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length, current]);

  // Handle scroll end to update current index
  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffsetX / width);
      setCurrent(index);
    },
    []
  );
const renderItem = useCallback(
  ({ item }: { item: Banner }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        const route = getAppRoute(item.url);
        if (route) router.push(route as any);
      }}
      style={{ width, height: BANNER_HEIGHT }}
      className="relative"
    >
      {/* Image */}
      {item.image ? (
        <Image
          source={{ uri: getImageUrl(item.image) }}
          resizeMode="cover"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      ) : (
        <View className="h-full w-full items-center justify-center bg-slate-200">
          <Text className="text-slate-500">{t('HeroSlider.noImage')}</Text>
        </View>
      )}

      {/* ✅ Bottom Fade (iOS FIXED) */}
      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(255,255,255,0)',
          'rgba(255,255,255,0.4)',
          'rgba(255,255,255,0.85)',
          '#ffffff',
        ]}
        locations={[0, 0.55, 0.8, 1]}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 180,
          zIndex: 10, // 🔥 مهم لـ iOS
        }}
      />
    </TouchableOpacity>
  ),
  [router, t]
);



  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    []
  );

  if (!banners.length) return null;

  return (
    <View className="relative  bg-white">
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={getItemLayout}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="center"
        contentContainerStyle={{ alignItems: 'center' }}
      />

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <View className="absolute bottom-12 left-0 right-0 flex-row justify-center gap-2 ">
          {banners.map((_, idx) => (
            <View
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === current
                  ? 'w-6 bg-[#2c7c7b] shadow-sm'
                  : 'w-2 bg-white/70'
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
};
