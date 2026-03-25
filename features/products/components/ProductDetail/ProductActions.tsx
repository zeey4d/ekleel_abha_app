import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Minus, Plus, Heart, ShoppingCart } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAddToCartMutation } from "@/store/features/cart/cartSlice";
import { useAddToWishlistMutation } from "@/store/features/wishlist/wishlistSlice";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import Toast from 'react-native-toast-message';

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
    <View className="gap-4">
      {/* Quantity & Add to Cart Row */}
      <View className="flex-row items-center gap-4">
        {/* Quantity Selector */}
        <View className="flex-row items-center bg-secondary rounded-lg h-12 border border-input">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-full"
            onPress={() => updateQty(quantity - 1)}
          >
            <Minus size={18} className="text-foreground" />
          </Button>
          
          <View className="w-10 items-center justify-center">
             <Text className="text-sm font-bold">{quantity}</Text>
          </View>
          
          <Button
            variant="ghost" 
            size="icon"
            className="w-10 h-full"
            onPress={() => updateQty(quantity + 1)}
          >
            <Plus size={18} className="text-foreground" />
          </Button>
        </View>

        {/* Add to Cart Button */}
        <Button
          size="lg"
          className="flex-1 h-12 flex-row gap-2"
          onPress={() => handleAddToCart(false)}
          disabled={!product.in_stock || isAdding}
        >
          {isAdding ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <ShoppingCart size={20} color="white" />
              <Text className="text-white font-bold text-base">
                {t('ProductDetail.addToCart')}
              </Text>
            </>
          )}
        </Button>

         {/* Wishlist Button - Optional placement */}
         <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 border-input"
            onPress={handleAddToWishlist}
          >
            <Heart size={20} className="text-foreground" />
          </Button>
      </View>
    </View>
  );
};