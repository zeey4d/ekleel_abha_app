import React, { useState } from "react";
import { View, Share, Pressable, useWindowDimensions } from "react-native";
import { Star, Share2, Heart, ShieldCheck, ArrowRightLeft } from "lucide-react-native";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { ProductOptions } from "@/components/products/ProductDetail/ProductOptions";
import { ProductActions } from "@/components/products/ProductDetail/ProductActions";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import RenderHTML from 'react-native-render-html';

interface ProductInfoProps {
  product: any;
}

const InstallmentCard = ({ type, price }: { type: 'tabby' | 'tamara', price: number }) => {
  const installmentPrice = (price / 4).toFixed(2);
  return (
    <Pressable className="flex-1 border border-border rounded-xl p-3 bg-card active:opacity-70 overflow-hidden">
      <View className="flex-row items-center justify-between mb-2">
        <View className="bg-secondary px-2 py-1 rounded">
           <Text className="text-[10px] font-bold uppercase text-foreground">{type}</Text>
        </View>
        <View className="p-1 rounded-full bg-secondary">
          <ArrowRightLeft size={12} className="text-muted-foreground" />
        </View>
      </View>
      <Text className="text-[11px] text-muted-foreground leading-tight text-start">
        {type === 'tamara' ? "قسم فاتورتك على 4 دفعات" : "أو قسمها على 4 دفعات"}
      </Text>
      <Text className="font-bold text-foreground mt-1 text-sm text-start">{installmentPrice} ر.س</Text>
    </Pressable>
  );
};

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const { t } = useTranslation('products');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { width } = useWindowDimensions();

  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [name]: value }));
  };

  const finalPrice = Number(product.final_price ?? product.special_price ?? 0);
  const originalPrice = Number(product.price ?? 0);

  const isOnSale = product.is_on_sale || product.on_sale ||
    (finalPrice > 0 && originalPrice > 0 && finalPrice < originalPrice);

  const discountPercentage = Number(product.discount_percentage ||
    (isOnSale && originalPrice > 0 ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0));

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${product.name}\n${finalPrice} ر.س`,
        // url: product.url // لو متاح رابط
      });
    } catch (error) {
       console.error(error);
    }
  };

  return (
    <View className="flex-col bg-background p-4">
      {/* Top Brand Banner & Wishlist */}
      <View className="flex-row items-start justify-between mb-4 border-b border-border pb-4">
        <View className="flex-row gap-4 items-center">
          <View className="h-12 w-24 bg-secondary rounded-lg items-center justify-center border border-border">
             <Text className="font-bold text-muted-foreground text-xs">{product.brand || "LOGO"}</Text>
          </View>
          <View className="flex-col">
            <View className="flex-row items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-full self-start">
              <Text className="text-[10px] font-bold text-green-600">%100</Text>
              <ShieldCheck size={12} color="#16a34a" />
              <Text className="text-[10px] font-bold text-green-600">أصلي</Text>
            </View>
            <Pressable>
              <Text className="text-[11px] text-primary mt-1 text-start">
                المزيد من {product.brand}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Ratings */}
      <View className="flex-row items-center gap-2 mb-2">
        <View className="flex-row">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={16}
              fill={i < Math.round(product.average_rating) ? "#eab308" : "transparent"}
              color={i < Math.round(product.average_rating) ? "#eab308" : "#ccc"} 
            />
          ))}
        </View>
        <Text className="text-xs font-bold text-muted-foreground">({product.review_count || 0}) التقييمات</Text>
        <Text className="text-xs text-yellow-500 font-bold">{product.average_rating || "0.0"}</Text>
      </View>

      <Text className="text-xl font-bold text-foreground mb-4 text-start leading-8">
        {product.name}
      </Text>

      {/* Price Section */}
      <View className="mb-6">
        <View className="flex-row items-end gap-3">
          <Text className="text-3xl font-bold text-foreground">
            {finalPrice} <Text className="text-sm font-bold">ر.س</Text>
          </Text>
          {isOnSale && (
            <View className="flex-row items-end gap-2 mb-1">
              <Text className="text-lg text-muted-foreground line-through">
                {originalPrice}
              </Text>
              <View className="bg-destructive px-2 py-0.5 rounded">
                <Text className="text-white text-[10px] font-bold">-{discountPercentage}%</Text>
               </View>
            </View>
          )}
        </View>
        <Text className="text-[11px] text-muted-foreground mt-1 font-bold text-start">شامل الضريبة</Text>
      </View>

      {/* Tabby & Tamara Installments */}
      <View className="flex-row gap-3 mb-8">
        <InstallmentCard type="tamara" price={finalPrice} />
        <InstallmentCard type="tabby" price={finalPrice} />
      </View>

      {/* Options Selector */}
      {product.options && product.options.length > 0 && (
        <View className="mb-8 p-4 bg-secondary/30 border border-border rounded-xl">
          <ProductOptions
            options={product.options}
            selections={selectedOptions}
            onChange={handleOptionChange}
          />
        </View>
      )}

      {/* Actions */}
      <ProductActions
        product={product}
        selectedOptions={selectedOptions}
      />

       {/* Share & Extra Info */}
      <View className="mt-8 flex-row items-center justify-between border-t border-border pt-6">
        <Pressable
          onPress={handleShare}
          className="flex-row items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50"
        >
          <Share2 size={16} className="text-foreground" />
          <Text className="font-bold text-sm text-foreground">{t('ProductDetail.share')}</Text>
        </Pressable>

        <View>
          <Text className="text-[11px] text-muted-foreground font-bold italic">رقم الموديل: {product.model || "N/A"}</Text>
        </View>
      </View>
    </View>
  );
};
