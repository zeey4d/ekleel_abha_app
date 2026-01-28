import React, { useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Link } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ProductCard } from '@/components/products/ProductCard';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

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
  const { t } = useTranslation('products');
  const flatListRef = useRef<FlatList>(null);
  const indexRef = useRef(0);

  // Autoplay
  useEffect(() => {
    if (!products?.length) return;

    const interval = setInterval(() => {
      indexRef.current =
        indexRef.current === products.length - 1
          ? 0
          : indexRef.current + 1;

      flatListRef.current?.scrollToIndex({
        index: indexRef.current,
        animated: true,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [products]);

  if (!products?.length) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text className="text-2xl font-bold">{title}</Text>

        {href && (
          <Link href={href} asChild>
            <TouchableOpacity>
              <Text className="text-primary text-sm font-medium">
                {t('ProductCarousel.viewAll')} →
              </Text>
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
        keyExtractor={(item) => item.id.toString()}
        snapToInterval={width * 0.45}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 8 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ProductCard product={item} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: {
    width: width * 0.45,
    marginRight: 12,
  },
});
