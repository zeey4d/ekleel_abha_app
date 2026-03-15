import React, { useRef, useState } from 'react';
import { View, Image, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslation } from 'react-i18next';
import { Quote } from 'lucide-react-native';

interface Testimonial {
  id: number | string;
  name: string;
  position: string;
  content: string;
  image: string | null;
  rating: number;
}

const { width } = Dimensions.get('window');
// To show a portion of the sides (peeking), make the item width about 75-80% of the screen
const ITEM_WIDTH = width * 0.78; 
const SPACING = 16;
const SPACER_ITEM_SIZE = (width - ITEM_WIDTH) / 2;

// Custom animated item for smooth scaling/opacity on active vs inactive items
const TestimonialItem = ({ 
  item, 
  index, 
  scrollX 
}: { 
  item: Testimonial; 
  index: number; 
  scrollX: Animated.SharedValue<number> 
}) => {
  const inputRange = [
    (index - 1) * (ITEM_WIDTH + SPACING),
    index * (ITEM_WIDTH + SPACING),
    (index + 1) * (ITEM_WIDTH + SPACING),
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1, 0.9],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        { width: ITEM_WIDTH },
        animatedStyle,
      ]}
      className="relative rounded-3xl border border-border bg-card p-6 min-h-[220px]"
    >
      <Quote size={28} className="absolute right-4 top-4 text-border" />
      <Text className="mb-6 leading-relaxed text-muted-foreground">“{item.content}”</Text>

      <View className="flex-row items-center gap-3 mt-auto">
        {item.image ? (
          <Image
            source={{ uri: getImageUrl(item.image) }}
            className="h-12 w-12 rounded-full border-2 border-primary/20"
          />
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-full bg-border">
            <Text className="font-bold text-lg">{item.name.charAt(0)}</Text>
          </View>
        )}

        <View>
          <Text className="text-sm font-bold text-foreground">{item.name}</Text>
          <Text className="text-xs text-muted-foreground">{item.position}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export const Testimonials = ({ testimonials }: { testimonials: Testimonial[] }) => {
  const { t } = useTranslation('home');
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (ITEM_WIDTH + SPACING));
    setActiveIndex(index);
  };

  if (!testimonials?.length) return null;

  return (
    <View className="rounded-3xl bg-muted py-8 mb-6 mt-2 overflow-hidden">
      {/* Header */}
      <View className="mb-8 items-center px-4">
        <Text className="text-center text-2xl font-bold text-foreground">
          {t('Testimonials.title')}
        </Text>
        <Text className="mt-2 text-center text-muted-foreground">{t('Testimonials.subtitle')}</Text>
      </View>

      {/* Slider using Animated.ScrollView for smooth snapping & animations */}
      <View style={{ position: 'relative', height: 260 }}>
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH + SPACING}
          decelerationRate="fast"
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onMomentumScrollEnd}
          contentContainerStyle={{ 
            paddingHorizontal: SPACER_ITEM_SIZE,
            alignItems: 'center',
          }}
        >
          {testimonials.map((item, index) => (
            <View key={item.id} style={{ marginRight: index !== testimonials.length - 1 ? SPACING : 0 }}>
              <TestimonialItem item={item} index={index} scrollX={scrollX} />
            </View>
          ))}
        </Animated.ScrollView>

        {/* Dots Indicator */}
        {testimonials.length > 1 && (
          <View style={{ position: 'absolute', bottom: -15, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            {testimonials.map((_, idx) => (
              <View
                key={idx}
                style={{
                  height: 6,
                  borderRadius: 3,
                  width: idx === activeIndex ? 20 : 6,
                  backgroundColor: idx === activeIndex ? '#1e293b' : '#cbd5e1', // Slate-800 for active, Slate-300 for inactive
                }}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};
