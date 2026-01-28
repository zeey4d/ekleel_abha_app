import React, { useState } from 'react';
import { View } from 'react-native';
import { Minus, Plus, Heart, ShoppingCart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// مكونات react-native-reusables
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Redux Hooks
import { useAddToCartMutation } from "@/store/features/cart/cartSlice";
import { useAddToWishlistMutation } from "@/store/features/wishlist/wishlistSlice";

// افترضنا وجود i18n بسيط أو استبدله بـ useTranslations الخاص بك
const t = (key: string) => key; 

interface ProductActionsProps {
  product: any;
  selectedOptions: Record<string, string>;
}

export const ProductActions = ({ product, selectedOptions }: ProductActionsProps) => {
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
      // هنا يفضل استخدام Toast.show من مكتبة تنبيهات النيتف
      console.log(t('ProductDetail.selectAllOptions'));
      return;
    }

    try {
      await addToCart({
        product_id: product.id,
        quantity,
        option: selectedOptions
      }).unwrap();

      if (buyNow) {
        router.push("/cart");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-col gap-4 p-2">
      <View className="flex-row gap-3 items-center">
        
        {/* Quantity Selector */}
        <View className="flex-row items-center border border-input rounded-lg overflow-hidden bg-background h-12">
          <Button
            variant="ghost"
            className="w-10 h-full justify-center items-center active:bg-muted"
            onPress={() => updateQty(quantity - 1)}
          >
            <Minus size={18} className="text-foreground" />
          </Button>
          
          <View className="w-12 items-center justify-center">
             <Text className="text-lg font-bold">{quantity}</Text>
          </View>

          <Button
            variant="ghost"
            className="w-10 h-full justify-center items-center active:bg-muted"
            onPress={() => updateQty(quantity + 1)}
          >
            <Plus size={18} className="text-foreground" />
          </Button>
        </View>

        {/* Wishlist Button */}
        <Button
          variant="outline"
          className="h-12 px-4 rounded-lg flex-1 border-input"
          onPress={() => addToWishlist({ product_id: product.id })}
        >
          <Heart size={22} className="text-foreground" />
        </Button>
      </View>

      {/* Main Buttons */}
      <View className="flex-col gap-3">
        <Button
          className="flex-row gap-2 h-14 rounded-xl bg-primary"
          onPress={() => handleAddToCart(false)}
          disabled={!product.in_stock || isAdding}
        >
          <ShoppingCart size={20} color="white" />
          <Text className="text-primary-foreground font-bold text-lg">
            {t('ProductDetail.addToCart')}
          </Text>
        </Button>

        <Button
          variant="secondary"
          className="h-14 rounded-xl"
          onPress={() => handleAddToCart(true)}
          disabled={!product.in_stock || isAdding}
        >
          <Text className="text-secondary-foreground font-bold text-lg">
            {t('ProductDetail.buyNow')}
          </Text>
        </Button>
      </View>
    </View>
  );
};