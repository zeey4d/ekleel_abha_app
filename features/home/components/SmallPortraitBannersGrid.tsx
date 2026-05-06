import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { getImageUrl } from '@/lib/image-utils';
import { getAppRoute } from '@/lib/url-utils';
import { Banner } from '@/store/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.3;   // ~30% of screen
const GAP = 10;
const AUTO_PLAY_MS = 3200;

interface SmallPortraitBannersGridProps {
  banners: Banner[];
}

export const SmallPortraitBannersGrid = ({ banners }: SmallPortraitBannersGridProps) => {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [current, setCurrent] = useState(0);

  if (!banners || banners.length === 0) return null;

  // Auto-scroll
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      const next = current >= banners.length - 1 ? 0 : current + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrent(next);
    }, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [current, banners.length]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / (ITEM_WIDTH + GAP));
      setCurrent(idx);
    },
    [],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_WIDTH + GAP,
      offset: (ITEM_WIDTH + GAP) * index,
      index,
    }),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: Banner }) => (
      <Pressable
        onPress={() => {
          const route = getAppRoute(item.url || item.link);
          if (route) router.push(route as any);
        }}
        style={{
          width: ITEM_WIDTH,
          aspectRatio: 144 / 233,   // Portrait 2:3-ish
          borderRadius: 10,
          overflow: 'hidden',
          backgroundColor: '#f1f5f9',
          marginEnd: GAP,
        }}
      >
        {item.image ? (
          <Image
            source={{ uri: getImageUrl(item.image) }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={250}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 6 }}>
            <Text
              numberOfLines={3}
              style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}
            >
              {item.title}
            </Text>
          </View>
        )}

        {/* Title overlay */}
        {item.title ? (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.35)',
              paddingHorizontal: 6,
              paddingVertical: 5,
            }}
          >
            <Text
              numberOfLines={2}
              style={{ fontSize: 10, color: '#fff', fontWeight: '600', textAlign: 'center' }}
            >
              {item.title}
            </Text>
          </View>
        ) : null}
      </Pressable>
    ),
    [router],
  );

  return (
    <View style={{ paddingVertical: 8 }}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14 }}
        snapToInterval={ITEM_WIDTH + GAP}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={() => {}}
        // Performance
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={5}
      />

      {/* Dots indicator */}
      {banners.length > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 }}>
          {banners.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === current ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === current ? '#10b981' : '#cbd5e1',
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};
