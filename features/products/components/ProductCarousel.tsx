import React, { useRef } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  I18nManager,
} from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { Link } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ProductCard } from '@/features/products/components/ProductCard';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.45;
const ITEM_SPACING = 12;

interface ProductCarouselProps {
  products: any[];
  title: string;
  href?: string;
}

export const ProductCarousel = ({
  products,
  title,
  href,
}: ProductCarouselProps) => {
  const { t, i18n } = useTranslation('products');
  const isArabic = i18n.language === 'ar';
  const isRTLOverride = isArabic && !I18nManager.isRTL;

  const flatListRef = useRef<FlatList>(null);

  if (!products?.length) return null;

  return (
    <View className="mb-8 min-h-[280px]">
      {/* Header */}
      <View
        className={cn(
          "px-4 mb-4 flex-row justify-between items-center",
          isRTLOverride && "flex-row-reverse"
        )}
      >
        <Text className="text-xl font-bold">{title}</Text>

        {href && (
          <Link href={href as any} asChild>
            <TouchableOpacity
              activeOpacity={0.7}
              className={cn("flex-row items-center gap-1", isRTLOverride && "flex-row-reverse")}
            >
              <Text className="text-primary text-sm font-medium">
                {t('ProductCarousel.viewAll')}
              </Text>
              {isArabic ? (
                <ArrowLeft size={16} color="#10b981" />
              ) : (
                <ArrowRight size={16} color="#10b981" />
              )}
            </TouchableOpacity>
          </Link>
        )}
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        snapToInterval={ITEM_WIDTH + ITEM_SPACING}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <View style={{ width: ITEM_WIDTH, marginRight: ITEM_SPACING }}>
            <ProductCard product={item} />
          </View>
        )}
      />
    </View>
  );
};
