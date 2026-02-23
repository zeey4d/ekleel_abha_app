import React, { useState } from 'react';
import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Trash2, Star } from 'lucide-react-native';
import { getImageUrl } from '@/lib/image-utils';
import { useAddToCartMutation } from '@/store/features/cart/cartSlice';
import { useRemoveFromWishlistMutation } from '@/store/features/wishlist/wishlistSlice';
import Toast from 'react-native-toast-message';
import { cn } from '@/lib/utils';

interface WishlistCardProps {
    product: any;
}

export const WishlistCard = ({ product }: WishlistCardProps) => {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
    const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();

    const handleAddToCart = async () => {
        try {
            await addToCart({ 
                product_id: product.product_id || product.id, 
                quantity: 1 
                // options? 
            }).unwrap();
            Toast.show({
                type: 'success',
                text1: t('success'),
                text2: t('addedToCart'),
            });
        } catch (error) {
           // Error handling
            Toast.show({
                type: 'error',
                text1: t('error'),
                text2: t('addToCartFailed'),
            });
        }
    };

    const handleRemove = async () => {
        try {
            await removeFromWishlist(product.product_id || product.id).unwrap();
            Toast.show({
                type: 'success',
                text1: t('success'),
                text2: t('removedFromWishlist'),
            });
        } catch (error) {
             Toast.show({
                type: 'error',
                text1: t('error'),
                text2: t('removeFromWishlistFailed'),
            });
        }
    };

    const price = Number(product.price);
    const finalPrice = Number(product.special || product.final_price || product.price);
    const hasDiscount = finalPrice < price;
    const discountPercent = hasDiscount ? Math.round(((price - finalPrice) / price) * 100) : 0;

    return (
        <Pressable 
            onPress={() => router.push(`/(tabs)/(home)/(context)/products/${product.product_id || product.id}`)}
            className="flex-row bg-white rounded-2xl p-3 mb-4 border border-border/90 "
        >
            {/* Image Section */}
            <View className="w-28 h-28 bg-gray-50 rounded-xl overflow-hidden relative">
                <Image
                    source={{ uri: getImageUrl(product.image) }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                {hasDiscount && (
                    <View className="absolute top-0 left-0 bg-red-500 px-2 py-1 rounded-br-lg z-10">
                        <Text className="text-white text-xs font-bold font-cairo">
                            {discountPercent}% OFF
                        </Text>
                    </View>
                )}
            </View>

            {/* Content Section */}
            <View className="flex-1 ml-4 justify-between py-1">
                <View>
                    <View className="flex-row justify-between items-start">
                        <Text className="text-base font-bold text-foreground flex-1 font-cairo" numberOfLines={2}>
                            {product.name}
                        </Text>
                    </View>
                    
                    {/* Rating Placeholder if needed */}
                    {product.rating > 0 && (
                        <View className="flex-row items-center mt-1 justify-end">
                             <Text className="text-xs text-gray-500 mr-1 font-cairo">({product.reviews || 0})</Text>
                            <Star size={12} fill="#FACC15" color="#FACC15" />
                        </View>
                    )}

                    <View className="flex-row items-baseline gap-2 mt-2 justify-end">
                        <Text className="text-lg font-bold text-primary font-cairo">
                            {finalPrice.toFixed(2)} SAR
                        </Text>
                        {hasDiscount && (
                            <Text className="text-sm text-gray-400 line-through font-cairo">
                                {price.toFixed(2)} SAR
                            </Text>
                        )}
                    </View>
                </View>

                {/* Actions */}
                <View className="flex-row items-center justify-end gap-3 mt-2">
                    <Pressable 
                        onPress={(e) => {
                            e.stopPropagation();
                            handleRemove();
                        }}
                        className="w-9 h-9 items-center justify-center rounded-full bg-red-50 border border-red-100"
                        disabled={isRemoving}
                    >
                        {isRemoving ? <ActivityIndicator size="small" color="#ef4444" /> : <Trash2 size={16} color="#ef4444" />}
                    </Pressable>

                    <Pressable 
                        onPress={(e) => {
                            e.stopPropagation();
                            handleAddToCart();
                        }}
                        className="flex-1 bg-primary h-9 flex-row items-center justify-center rounded-full active:opacity-90"
                        disabled={isAddingToCart}
                    >
                        {isAddingToCart ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <ShoppingCart size={16} color="white" className="mr-2" />
                                <Text className="text-white font-bold text-sm font-cairo">{t('addToCart')}</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </View>
        </Pressable>
    );
};
