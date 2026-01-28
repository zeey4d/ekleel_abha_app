import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ShoppingCart, Heart, Star } from 'lucide-react-native';
import { getImageUrl } from '@/lib/image-utils';
import { Link } from 'expo-router';

interface ProductCardProps {
  product: {
    id: number | string;
    name?: string;
    name_ar?: string;
    name_en?: string;
    price?: number;
    final_price?: number;
    special_price?: number;
    image?: string | null;
    main_image?: string | null;
    is_on_sale?: boolean;
    discount_percentage?: number;
    rating?: number;
    average_rating?: number;
    brand?: string | { id: number; name: string; image?: string } | null;
    [key: string]: any;
  };
  layout?: 'grid' | 'list';
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const displayName = product.name_ar || product.name || 'منتج';
  const rawImage = product.main_image || product.image || null;
  const displayImage = getImageUrl(rawImage);
  
  const finalPrice = Number(product.final_price ?? product.special_price ?? product.price ?? 0);
  const originalPrice = Number(product.price ?? 0);
  const isOnSale = product.is_on_sale || (finalPrice > 0 && originalPrice > 0 && finalPrice < originalPrice);
  const discountPercentage = Number(product.discount_percentage || 
    (isOnSale && originalPrice > 0 ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0));
  const rating = Number(product.average_rating || product.rating || 4.5);

  return (
    <Link href={`/products/${product.id}`} asChild>
    <TouchableOpacity 
      className="bg-card border border-border rounded-xl overflow-hidden"
      activeOpacity={0.7}
    >
      {/* Image */}
      <View className="relative w-full aspect-square bg-muted">
        <Image
          source={{ uri: displayImage }}
          className="w-full h-full"
          resizeMode="cover"
        />
        
        {/* Discount Badge */}
        {isOnSale && discountPercentage > 0 && (
          <View className="absolute top-2 left-2 bg-primary rounded-md px-2 py-1">
            <Text className="text-xs font-bold text-primary-foreground">
              -{discountPercentage}%
            </Text>
          </View>
        )}
        
        {/* Wishlist Button */}
        <TouchableOpacity 
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 items-center justify-center"
          activeOpacity={0.7}
        >
          <Icon as={Heart} size={16} className="text-foreground" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="p-3 gap-2">
        {/* Rating */}
        <View className="flex-row items-center gap-1">
          <Text className="text-xs font-semibold text-foreground">{rating.toFixed(1)}</Text>
          <Icon as={Star} size={12} className="text-yellow-500" />
        </View>

        {/* Brand */}
        {product.brand && (
          <Text className="text-xs font-medium text-primary uppercase">
            {typeof product.brand === 'object' ? product.brand.name : product.brand}
          </Text>
        )}

        {/* Product Name */}
        <Text className="text-sm font-semibold text-foreground line-clamp-2" numberOfLines={2}>
          {displayName}
        </Text>

        {/* Price & Add to Cart */}
        <View className="flex-row justify-between items-center mt-1">
          <View className="gap-1">
            {isOnSale && originalPrice > 0 && (
              <Text className="text-xs text-muted-foreground line-through">
                {originalPrice.toFixed(0)} ر.س
              </Text>
            )}
            <Text className="text-base font-bold text-primary">
              {finalPrice.toFixed(0)} ر.س
            </Text>
          </View>

          <TouchableOpacity 
            className="w-8 h-8 rounded-full bg-primary items-center justify-center"
            activeOpacity={0.7}
          >
            <Icon as={ShoppingCart} size={16} className="text-primary-foreground" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
    </Link>
  );
};