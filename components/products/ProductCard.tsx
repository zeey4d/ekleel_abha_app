
import React, { useMemo } from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ShoppingCart, Heart, Star } from 'lucide-react-native';
import { getImageUrl } from '@/lib/image-utils';
import { Link, useRouter } from 'expo-router';
import { Product } from '@/store/types';
import { useTranslation } from 'react-i18next';
import { Image } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAddToCartMutation, useAddGuestItemMutation } from "@/store/features/cart/cartSlice";
import { useAddToWishlistMutation, useRemoveFromWishlistMutation, selectIsProductInWishlist } from "@/store/features/wishlist/wishlistSlice";
import { authStorage } from "@/lib/authStorage";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  layout?: "grid" | "list" | "search"; // Added "search"
  variant?: "default" | "compact";
}

export const ProductCard = ({ product, layout = "grid", variant = "default" }: ProductCardProps) => {
  const { t, i18n } = useTranslation('products');
  const locale = i18n.language;
  const router = useRouter();
  
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [addGuestItem, { isLoading: isAddingGuest }] = useAddGuestItemMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  const isInWishlist = useAppSelector(state => selectIsProductInWishlist(state, Number(product.id)));

  // Derived properties
  const displayName = product.name || (locale === 'ar' ? product.name_ar : product.name_en) || t('ProductCard.untitled');

  // Handle imagePriority: image -> main_image -> images[0]
  const rawImage = product.image || product.main_image || (product.images && product.images.length > 0 ? product.images[0] : null);
  const displayImage = getImageUrl(rawImage);

  // Handle description
  const rawDescription = product.description || (locale === 'ar' ? product.description_ar : product.description_en) || '';
  const displayDescription = rawDescription.replace(/<[^>]*>/g, '');

  const rating = Number(product.average_rating) || 0;
  const reviewCount = Number(product.review_count) || 0;

  const finalPrice = Number(product.final_price ?? product.special_price ?? product.price) || 0;
  const originalPrice = Number(product.price) || 0;

  // Handle sale status
  const isOnSale = product.is_on_sale !== undefined ? Boolean(product.is_on_sale) : Boolean(product.on_sale);

  const discountPercentage = Number(product.discount_percentage) || 
    (isOnSale && originalPrice > 0 ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0);

  // Stock check
  const isOutOfStock = product.in_stock === false || (product.quantity !== undefined && product.quantity <= 0);

  // Brand Name
  const brandName = useMemo(() => {
    const rawBrand = product.manufacturer || product.brand;
    if (typeof rawBrand === 'string') return rawBrand;
    if (rawBrand && typeof rawBrand === 'object' && 'name' in rawBrand) return rawBrand.name;
    
    if (product.categories && product.categories.length > 0) {
      const firstCat = (product.categories as any)[0];
      if (typeof firstCat === 'string') return firstCat;
      if (typeof firstCat === 'object' && 'name' in firstCat) return firstCat.name;
    }
    return t('ProductCard.brand', 'Brand');
  }, [product, t]);

  const handleAddToCart = async () => {
    if (!product.id) {
       Toast.show({ type: 'error', text1: t('ProductCard.productIdMissing') });
      return;
    }

    try {
      const isAuthenticated = await authStorage.isAuthenticated();

      if (isAuthenticated) {
        await addToCart({ product_id: Number(product.id), quantity: 1 }).unwrap();
      } else {
        const sessionId = await authStorage.ensureGuestSessionId();
        await addGuestItem({
          session_id: sessionId,
          product_id: Number(product.id),
          quantity: 1
        }).unwrap();
      }

      Toast.show({ type: 'success', text1: t('ProductCard.addedToCart', { name: displayName }) });
    } catch (err: any) {
      let message = t('ProductCard.genericError');
      if (err?.data?.message) message = err.data.message;
      Toast.show({ type: 'error', text1: message });
    }
  };

  const handleWishlist = async () => {
    const isAuthenticated = await authStorage.isAuthenticated();
    if (!isAuthenticated) {
      Toast.show({ type: 'error', text1: t('ProductCard.loginRequired') });
      router.push('/(tabs)/(auth)/login');
      return;
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(Number(product.id)).unwrap();
        Toast.show({ type: 'success', text1: t('ProductCard.removedFromWishlist') });
      } else {
        await addToWishlist({ product_id: Number(product.id) }).unwrap();
        Toast.show({ type: 'success', text1: t('ProductCard.addedToWishlist') });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: t('ProductCard.wishlistFailed') });
    }
  };

  const navigateToProduct = () => {
    router.push(`/products/${product.id}`);
  };

  if (layout === "search") {
    return (
      <Pressable 
        onPress={navigateToProduct}
        className="flex-row items-center border-b border-gray-100 py-3 bg-white px-4"
      >
        {/* Image (Leading) */}
        <View className="w-10 h-14 bg-gray-50 rounded ml-3 overflow-hidden border border-gray-100">
           <Image
            source={{ uri: displayImage }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        {/* Content */}
        <View className="flex-1 justify-center items-start gap-1">
          {brandName ? (
             <Text className="text-[10px] text-gray-400 text-left w-full">
              {brandName}
            </Text>
          ) : null}
         
          <Text className="text-sm text-gray-800 text-left font-medium w-full" numberOfLines={1}>
            {displayName}
          </Text>

          {/* Price */}
          <View className="flex-row items-center gap-2 mt-1">
             <Text className="text-sm font-bold text-gray-900">
               {finalPrice.toFixed(0)} <Text className="text-[10px] font-normal">SAR</Text>
             </Text>
             {isOnSale && originalPrice > 0 && (
                <Text className="text-[10px] text-gray-400 line-through">
                  {originalPrice.toFixed(0)}
                </Text>
             )}
          </View>
        </View>

         {/* Arrow or Action (Optional, leaving empty for now to match 'simple' request) */}
      </Pressable>
    );
  }

  if (layout === "list") {
    return (
      <Pressable 
        onPress={navigateToProduct}
        className="flex-row bg-card border border-border rounded-xl overflow-hidden mb-3 shadow-sm"
      >
        <View className="relative w-32 h-32 bg-muted">
          <Image
            source={{ uri: displayImage }}
            className="w-full h-full"
            resizeMode="contain"
          />
          {isOnSale && discountPercentage > 0 && (
            <View className="absolute top-1 left-1 bg-primary px-1.5 py-0.5 rounded">
              <Text className="text-[10px] font-bold text-primary-foreground">
                -{discountPercentage}%
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1 p-3 justify-between">
          <View>
            <Text className="text-lg font-bold text-foreground mb-1" numberOfLines={1}>
              {displayName}
            </Text>
            {displayDescription ? (
              <Text className="text-xs text-muted-foreground line-clamp-2" numberOfLines={2}>
                {displayDescription}
              </Text>
            ) : null}
            
            <View className="flex-row items-center mt-1">
              <Text className="text-xs font-semibold text-foreground mr-1">
                {rating > 0 ? rating.toFixed(1) : '5.0'}
              </Text>
              <Icon as={Star} size={12} className="text-yellow-500 fill-yellow-500" />
              <Text className="text-xs text-muted-foreground ml-1">
                ({reviewCount})
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-center gap-2">
               {isOnSale && originalPrice > 0 && (
                <Text className="text-xs text-muted-foreground line-through">
                  {originalPrice.toFixed(0)}
                </Text>
              )}
              <Text className="text-base font-bold text-primary">
                {finalPrice.toFixed(0)} <Text className="text-xs font-normal">SAR</Text>
              </Text>
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity 
                onPress={handleWishlist}
                className={cn(
                  "p-2 rounded-full border",
                  isInWishlist ? "bg-red-50 border-red-200" : "border-border"
                )}
              >
                <Icon 
                  as={Heart} 
                  size={16} 
                  className={isInWishlist ? "text-red-500 fill-red-500" : "text-muted-foreground"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleAddToCart}
                disabled={isAdding || isOutOfStock}
                className={cn(
                  "flex-row items-center bg-primary px-3 py-1.5 rounded-full gap-1",
                  (isAdding || isOutOfStock) && "opacity-50"
                )}
              >
                <Icon as={ShoppingCart} size={14} className="text-primary-foreground" />
                <Text className="text-xs font-bold text-primary-foreground">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  // Grid View
  return (
    <Pressable 
      onPress={navigateToProduct}
      className={cn(
        "bg-card border border-border rounded-xl overflow-hidden shadow-sm flex-1",
        isOutOfStock && "opacity-80"
      )}
    >
      {/* Image Area */}
      <View className="relative w-full aspect-[4/5] bg-muted">
        <Image
          source={{ uri: displayImage }}
          className={cn("w-full h-full", isOutOfStock && "opacity-60")}
          resizeMode="cover"
        />

        {/* Wishlist Button */}
        <TouchableOpacity
          onPress={handleWishlist}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80"
        >
           <Icon 
             as={Heart} 
             size={18} 
             className={isInWishlist ? "text-red-500 fill-red-500" : "text-muted-foreground"} 
           />
        </TouchableOpacity>

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <View className="absolute top-2 left-2 bg-muted border border-border px-2 py-1 rounded">
             <Text className="text-[10px] font-bold text-muted-foreground uppercase">
               {t('ProductCard.outOfStock', 'Out of Stock')}
             </Text>
          </View>
        )}

        {/* Discount Badge */}
        {!isOutOfStock && isOnSale && discountPercentage > 0 && (
          <View className="absolute top-2 left-2 bg-primary px-2 py-1 rounded">
            <Text className="text-[10px] font-bold text-primary-foreground">
              -{discountPercentage}%
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-3 gap-1">
        {/* Rating */}
        <View className="flex-row items-center gap-1">
           <Text className="text-xs font-semibold text-foreground">
             {rating > 0 ? rating.toFixed(1) : '5.0'}
           </Text>
           <Icon as={Star} size={12} className="text-yellow-500 fill-yellow-500" />
           <Text className="text-[10px] text-muted-foreground">({reviewCount})</Text>
        </View>

        {/* Brand */}
        <Text className="text-[10px] font-medium text-primary uppercase tracking-wider">
          {brandName}
        </Text>

        {/* Name */}
        <Text className="text-xs font-bold text-foreground line-clamp-2 min-h-[32px]" numberOfLines={2}>
          {displayName}
        </Text>

        {/* Price & Action */}
        <View className="flex-row justify-between items-end mt-2">
          <View>
            {isOnSale && originalPrice > 0 && (
              <Text className="text-[10px] text-muted-foreground line-through">
                {originalPrice.toFixed(0)}
              </Text>
            )}
            <Text className="text-sm font-bold text-primary">
              {finalPrice.toFixed(0)} <Text className="text-[10px] font-normal">SAR</Text>
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className={cn(
              "w-8 h-8 rounded-full bg-primary/10 items-center justify-center",
              (isAdding || isOutOfStock) && "opacity-50"
            )}
          >
            <Icon as={ShoppingCart} size={16} className="text-primary" />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
};