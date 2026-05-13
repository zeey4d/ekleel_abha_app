
import React, { useMemo } from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ShoppingCart, Heart, Star, SaudiRiyal } from 'lucide-react-native';
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
import { I18nManager } from "react-native";

const TEAL = "#0d9488";

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
      router.push('/(auth)/login');
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
        className="flex-row items-center border-b border-slate-50 py-4 bg-white px-4"
        style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}
      >
        {/* Image (Leading) */}
        <View className="w-12 h-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
           <Image
            source={{ uri: displayImage }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        {/* Content */}
        <View className="flex-1 justify-center items-start gap-1 mx-4">
          {brandName ? (
             <Text style={{ fontFamily: 'Tajawal_500Medium', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-[10px] text-teal-600 uppercase tracking-widest w-full">
              {brandName}
            </Text>
          ) : null}
         
          <Text style={{ fontFamily: 'Tajawal_700Bold', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-sm text-slate-800 w-full" numberOfLines={1}>
            {displayName}
          </Text>

          {/* Price */}
          <View className="flex-row items-center gap-2 mt-1" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
             <View className="flex-row items-center" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
               <Text style={{ fontFamily: 'Tajawal_800ExtraBold', color: TEAL }} className="text-base">
                 {finalPrice.toFixed(0)}
               </Text>
               <SaudiRiyal size={14} color={TEAL} style={{ marginHorizontal: 2 }} />
             </View>
             {isOnSale && originalPrice > 0 && (
                <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-[10px] text-slate-300 line-through">
                  {originalPrice.toFixed(0)}
                </Text>
             )}
          </View>
        </View>
      </Pressable>
    );
  }

  if (layout === "list") {
    return (
      <Pressable 
        onPress={navigateToProduct}
        className="flex-row bg-white border border-slate-100 rounded-xl overflow-hidden mb-4 shadow-sm"
        style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}
      >
        <View className="relative w-36 h-36 bg-slate-50 p-2">
          <Image
            source={{ uri: displayImage }}
            className="w-full h-full"
            resizeMode="contain"
          />
          {isOnSale && discountPercentage > 0 && (
            <View className="absolute top-3 left-3 bg-amber-400 px-2 py-1 rounded-xl shadow-sm">
              <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-[10px] text-white">
                -{discountPercentage}%
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1 p-4 justify-between">
          <View>
            <Text style={{ fontFamily: 'Tajawal_700Bold', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-base text-slate-800 mb-1" numberOfLines={1}>
              {displayName}
            </Text>
            {displayDescription ? (
              <Text style={{ fontFamily: 'Tajawal_500Medium', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-xs text-slate-400" numberOfLines={2}>
                {displayDescription}
              </Text>
            ) : null}
            
            <View className="flex-row items-center mt-2" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
              <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-xs text-slate-700 mr-1">
                {rating > 0 ? rating.toFixed(1) : '5.0'}
              </Text>
              <Icon as={Star} size={12} className="text-amber-400 fill-amber-400" />
              <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-[10px] text-slate-400 ml-1">
                ({reviewCount})
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between mt-2" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
            <View className="flex-row items-center gap-2" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
               {isOnSale && originalPrice > 0 && (
                <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-xs text-slate-300 line-through">
                  {originalPrice.toFixed(0)}
                </Text>
              )}
              <View className="flex-row items-center" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
                <Text style={{ fontFamily: 'Tajawal_800ExtraBold', color: TEAL }} className="text-xl">
                  {finalPrice.toFixed(0)}
                </Text>
                <SaudiRiyal size={16} color={TEAL} style={{ marginHorizontal: 2 }} />
              </View>
            </View>

            <View className="flex-row gap-2" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
              <TouchableOpacity 
                onPress={handleWishlist}
                className={cn(
                  "w-9 h-9 items-center justify-center rounded-full border",
                  isInWishlist ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"
                )}
              >
                <Icon 
                  as={Heart} 
                  size={18} 
                  className={isInWishlist ? "text-red-500 fill-red-500" : "text-slate-300"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleAddToCart}
                disabled={isAdding || isOutOfStock}
                className={cn(
                  "w-9 h-9 items-center justify-center bg-teal-600 rounded-full shadow-sm",
                  (isAdding || isOutOfStock) && "opacity-50"
                )}
              >
                <Icon as={ShoppingCart} size={18} className="text-white" />
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
        "bg-white border border-slate-50 rounded-2xl overflow-hidden shadow-sm",
        isOutOfStock && "opacity-80"
      )}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
      }}
    >
      {/* Image Area */}
      <View 
        className={cn(
          "relative w-full bg-white items-center justify-center",
          variant === "compact" ? "p-2" : "p-4"
        )}
        style={{ aspectRatio: 0.9 }}
      >
        <Image
          source={{ uri: displayImage }}
          className={cn("w-full h-full", isOutOfStock && "opacity-60")}
          resizeMode="contain"
        />

        {/* Wishlist Button */}
        <TouchableOpacity
          onPress={handleWishlist}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 shadow-sm border border-slate-50"
        >
           <Icon 
             as={Heart} 
             size={16} 
             className={isInWishlist ? "text-red-500 fill-red-500" : "text-slate-300"} 
           />
        </TouchableOpacity>

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <View className="absolute inset-0 bg-white/40 items-center justify-center">
            <View className="bg-slate-900/80 px-3 py-1 rounded-full">
               <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-[10px] text-white uppercase tracking-wider">
                 {t('ProductCard.outOfStock', 'نفذت الكمية')}
               </Text>
            </View>
          </View>
        )}

        {/* Discount Badge */}
        {!isOutOfStock && isOnSale && discountPercentage > 0 && (
          <View className="absolute top-3 left-3 bg-amber-400 px-2 py-1 rounded-xl shadow-sm">
            <Text style={{ fontFamily: 'Tajawal_800ExtraBold' }} className="text-[10px] text-white">
              -{discountPercentage}%
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className={variant === "compact" ? "p-3 gap-0.5" : "p-4 gap-1"}>
        {/* Rating */}
        <View className="flex-row items-center gap-1" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
           <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-xs text-slate-700">
             {rating > 0 ? rating.toFixed(1) : '5.0'}
           </Text>
           <Icon as={Star} size={10} className="text-amber-400 fill-amber-400" />
           <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-[10px] text-slate-400">({reviewCount})</Text>
        </View>

        {/* Brand */}
        <Text style={{ fontFamily: 'Tajawal_700Bold', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className={cn("text-teal-600 uppercase tracking-widest", variant === "compact" ? "text-[8px]" : "text-[10px]")}>
          {brandName}
        </Text>

        {/* Name */}
        <Text 
          style={{ fontFamily: 'Tajawal_700Bold', textAlign: I18nManager.isRTL ? 'right' : 'left' }} 
          className={cn("text-slate-800", variant === "compact" ? "text-[11px] leading-4 h-[32px]" : "text-sm leading-5 min-h-[40px]")} 
          numberOfLines={2}
        >
          {displayName}
        </Text>

        {/* Price & Action */}
        <View className="flex-row justify-between items-end mt-2" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
          <View style={{ alignItems: I18nManager.isRTL ? 'flex-end' : 'flex-start' }}>
            {isOnSale && originalPrice > 0 && (
              <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-[10px] text-slate-300 line-through">
                {originalPrice.toFixed(0)}
              </Text>
            )}
            <View className="flex-row items-center" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
              <Text style={{ fontFamily: 'Tajawal_800ExtraBold', color: TEAL }} className={cn(variant === "compact" ? "text-base" : "text-xl")}>
                {finalPrice.toFixed(0)}
              </Text>
              <SaudiRiyal size={variant === "compact" ? 12 : 14} color={TEAL} style={{ marginHorizontal: 2 }} />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className={cn(
              "rounded-full bg-teal-600 items-center justify-center shadow-md shadow-teal-600/20",
              variant === "compact" ? "w-8 h-8" : "w-10 h-10",
              (isAdding || isOutOfStock) && "opacity-50"
            )}
          >
            <Icon as={ShoppingCart} size={variant === "compact" ? 14 : 18} className="text-white" />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
};