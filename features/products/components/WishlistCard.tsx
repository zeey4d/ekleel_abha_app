import React, { useState } from 'react';
import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Trash2, Star, SaudiRiyal } from 'lucide-react-native';
import { getImageUrl } from '@/lib/image-utils';
import { useAddToCartMutation } from '@/store/features/cart/cartSlice';
import { useRemoveFromWishlistMutation } from '@/store/features/wishlist/wishlistSlice';
import Toast from 'react-native-toast-message';
import { cn } from '@/lib/utils';
import { I18nManager } from 'react-native';

const TEAL = "#0d9488";

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
            className="flex-row bg-white rounded-[28px] p-3 mb-4 border border-slate-50 shadow-sm"
            style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}
        >
            {/* Image Section */}
            <View className="w-28 h-28 bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-50">
                <Image
                    source={{ uri: getImageUrl(product.image) }}
                    className="w-full h-full"
                    resizeMode="contain"
                />
                {hasDiscount && (
                    <View className="absolute top-0 left-0 bg-red-500 px-2 py-0.5 rounded-br-xl z-10">
                        <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-white text-[10px]">
                            {discountPercent}% OFF
                        </Text>
                    </View>
                )}
            </View>

            {/* Content Section */}
            <View className="flex-1 mx-4 justify-between py-1">
                <View>
                    <View className="flex-row justify-between items-start" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
                        <Text style={{ fontFamily: 'Tajawal_700Bold', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-sm text-slate-800 flex-1 leading-5" numberOfLines={2}>
                            {product.name}
                        </Text>
                    </View>
                    
                    {/* Rating Placeholder if needed */}
                    {product.rating > 0 && (
                        <View className="flex-row items-center mt-1" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
                             <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-[10px] text-slate-400 mx-1">({product.reviews || 0})</Text>
                            <Star size={10} fill="#FACC15" color="#FACC15" />
                        </View>
                    )}

                    <View className="flex-row items-baseline gap-1 mt-2" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
                        <View className="flex-row items-center" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
                            <Text style={{ fontFamily: 'Tajawal_800ExtraBold', color: TEAL }} className="text-lg">
                                {finalPrice.toFixed(0)}
                            </Text>
                            <SaudiRiyal size={14} color={TEAL} style={{ marginHorizontal: 2 }} />
                        </View>
                        {hasDiscount && (
                            <View className="flex-row items-center" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
                                <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-xs text-slate-300 line-through">
                                    {price.toFixed(0)}
                                </Text>
                                <SaudiRiyal size={10} color="#cbd5e1" style={{ marginHorizontal: 1 }} />
                            </View>
                        )}
                    </View>
                </View>

                {/* Actions */}
                <View className="flex-row items-center justify-end gap-3 mt-3" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
                    <Pressable 
                        onPress={(e) => {
                            e.stopPropagation();
                            handleRemove();
                        }}
                        className="w-9 h-9 items-center justify-center rounded-full bg-red-50 border border-red-50 shadow-sm"
                        disabled={isRemoving}
                    >
                        {isRemoving ? <ActivityIndicator size="small" color="#ef4444" /> : <Trash2 size={16} color="#ef4444" />}
                    </Pressable>

                    <Pressable 
                        onPress={(e) => {
                            e.stopPropagation();
                            handleAddToCart();
                        }}
                        className="flex-1 bg-teal-600 h-9 flex-row items-center justify-center rounded-full active:opacity-90 shadow-sm"
                        disabled={isAddingToCart}
                    >
                        {isAddingToCart ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <ShoppingCart size={16} color="white" style={{ marginHorizontal: 6 }} />
                                <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-white text-xs">{t('addToCart')}</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </View>
        </Pressable>
    );
};
