import React, { useState } from "react";
import { View, ActivityIndicator, Pressable } from "react-native";
import { Minus, Plus, Heart, ShoppingCart } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAddToCartMutation } from "@/store/features/cart/cartSlice";
import { useAddToWishlistMutation } from "@/store/features/wishlist/wishlistSlice";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import Toast from 'react-native-toast-message';
import { I18nManager } from "react-native";

const TEAL = "#0d9488";

interface ProductActionsProps {
  product: any;
  selectedOptions: Record<string, string>;
}

export const ProductActions = ({ product, selectedOptions }: ProductActionsProps) => {
  const { t } = useTranslation('products');
  const [quantity, setQuantity] = useState(1);
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const router = useRouter();

  const updateQty = (val: number) => {
    if (val < 1) return;
    if (val > (product.quantity || 99)) return;
    setQuantity(val);
  };

  const handleAddToCart = async (buyNow = false) => {
    const requiredOptions = product.options?.length || 0;
    const selectedCount = Object.keys(selectedOptions).length;

    if (requiredOptions > 0 && selectedCount < requiredOptions) {
      Toast.show({
        type: 'error',
        text1: t('ProductDetail.error', 'Error'),
        text2: t('ProductDetail.selectAllOptions', 'Please select all options'),
      });
      return;
    }

    try {
      await addToCart({
        product_id: product.id,
        quantity,
        option: selectedOptions
      }).unwrap();

      Toast.show({
        type: 'success',
        text1: t('ProductDetail.success', 'Success'),
        text2: t('ProductDetail.addedToCart', 'Added to cart successfully'),
      });

      if (buyNow) {
        router.push("/(tabs)/(cart)");
      }
    } catch (error) {
      console.error("Add to cart failed", error);
      Toast.show({
        type: 'error',
        text1: t('ProductDetail.error', 'Error'),
        text2: t('ProductDetail.addToCartFailed', 'Failed to add to cart'),
      });
    }
  };
  
  const handleAddToWishlist = async () => {
    try {
        await addToWishlist({ product_id: product.id }).unwrap();
        Toast.show({
            type: 'success',
            text1: t('ProductDetail.success', 'Success'),
            text2: t('ProductCard.addedToWishlist', 'Added to wishlist'),
        });
    } catch (error) {
        console.error("Add to wishlist failed", error);
        Toast.show({
            type: 'error',
            text1: t('ProductDetail.error', 'Error'),
            text2: t('ProductCard.wishlistFailed', 'Failed to add to wishlist'),
        });
    }
  };

  return (
    <View className="gap-6">
      {/* Quantity & Add to Cart Row */}
      <View className="flex-row items-center gap-4" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
        {/* Quantity Selector */}
        <View className="flex-row items-center bg-white rounded-full h-14 border border-slate-100 shadow-sm px-2" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
          <Pressable
            onPress={() => updateQty(quantity - 1)}
            className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 active:bg-slate-100"
          >
            <Minus size={18} color="#475569" />
          </Pressable>
          
          <View className="w-10 items-center justify-center">
             <Text style={{ fontFamily: 'Tajawal_800ExtraBold' }} className="text-lg text-slate-800">{quantity}</Text>
          </View>
          
          <Pressable
            onPress={() => updateQty(quantity + 1)}
            className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 active:bg-slate-100"
          >
            <Plus size={18} color="#475569" />
          </Pressable>
        </View>

        {/* Add to Cart Button */}
        <Pressable
          onPress={() => handleAddToCart(false)}
          disabled={!product.in_stock || isAdding}
          className={cn(
            "flex-1 h-14 rounded-[32px] flex-row items-center justify-center shadow-lg active:opacity-90",
            product.in_stock ? "bg-teal-600" : "bg-slate-300"
          )}
          style={product.in_stock ? { shadowColor: TEAL, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 } : {}}
        >
          {isAdding ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <ShoppingCart size={20} color="white" style={{ marginHorizontal: 8 }} />
              <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-white text-base">
                {t('ProductDetail.addToCart', { defaultValue: 'إضافة للسلة' })}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
};