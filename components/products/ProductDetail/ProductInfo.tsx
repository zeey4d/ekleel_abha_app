import React, { useState } from 'react';
import { View, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Star, Share2, Truck, ShieldCheck, ArrowRightLeft } from 'lucide-react-native';
import RenderHTML from 'react-native-render-html';

// مكونات react-native-reusables
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { ProductOptions } from './ProductOptions'; // تأكد من تحويل هذا المكون أيضاً
import HomeHeader from '@/components/layout/HomeHeader';
import { Stack, Tabs } from 'expo-router';

interface ProductInfoProps {
  product: any;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const { width } = useWindowDimensions();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [name]: value }));
  };

  const finalPrice = Number(product.final_price ?? product.special_price ?? 0);
  const originalPrice = Number(product.price ?? 0);

  const isOnSale =
    product.is_on_sale || (finalPrice > 0 && originalPrice > 0 && finalPrice < originalPrice);

  const discountPercentage =
    isOnSale && originalPrice > 0
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
      : 0;

  return (
    <View className="flex-1 bg-background p-4">
      {/* Header */}
      <View className="mb-6 gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-brand-lavender text-xs font-bold uppercase tracking-widest">
            {product.brand || 'ماركة عامة'}
          </Text>
          <Badge variant={product.in_stock ? 'secondary' : 'destructive'}>
            <Text className={product.in_stock ? 'text-brand-green' : 'text-white'}>
              {product.in_stock ? 'متوفر' : 'غير متوفر'}
            </Text>
          </Badge>
        </View>

        <Text className="text-brand-green text-2xl font-bold leading-tight">{product.name}</Text>

        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <View className="flex-row">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.round(product.average_rating) ? '#D4AF37' : 'transparent'}
                  color={i < Math.round(product.average_rating) ? '#D4AF37' : '#ccc'}
                />
              ))}
            </View>
            <Text className="ml-1 text-sm text-muted-foreground">
              {product.average_rating} ({product.review_count} مراجعة)
            </Text>
          </View>
          <Text className="text-muted-foreground">|</Text>
          <Text className="text-sm text-muted-foreground">موديل: {product.model}</Text>
        </View>
      </View>

      {/* Price Box */}
      <View className="border-brand-green/5 mb-6 rounded-2xl border bg-muted/30 p-5">
        <View className="flex-row items-end gap-2">
          <Text className="text-brand-green text-4xl font-bold">
            {finalPrice} <Text className="text-lg">ر.س</Text>
          </Text>
          {isOnSale && (
            <View className="flex-row items-center gap-2">
              <Text className="text-lg text-muted-foreground line-through decoration-destructive">
                {originalPrice}
              </Text>
              <Badge className="bg-brand-gold">
                <Text className="text-xs text-white">وفر {discountPercentage}%</Text>
              </Badge>
            </View>
          )}
        </View>
        <Text className="mt-2 text-xs text-muted-foreground">
          الأسعار تشمل ضريبة القيمة المضافة
        </Text>
      </View>

      {/* Description */}
      <View className="mb-6">
        <RenderHTML
          contentWidth={width}
          source={{ html: product.description?.substring(0, 150) + '...' }}
          baseStyle={{ color: '#666', fontSize: 14, textAlign: 'right' }}
        />
      </View>

      {/* Options */}
      <ProductOptions
        options={product.options || []}
        selections={selectedOptions}
        onChange={handleOptionChange}
      />

      <View className="my-6 h-[1px] w-full bg-border" />


      {/* Features Grid */}
      <View className="mt-6 flex-row gap-3">
        <View className="flex-1 flex-row items-center gap-2 rounded-xl border border-border bg-card p-3">
          <Truck size={20} color="#D4AF37" />
          <Text className="text-[10px] text-muted-foreground">توصيل مجاني</Text>
        </View>
        <View className="flex-1 flex-row items-center gap-2 rounded-xl border border-border bg-card p-3">
          <ShieldCheck size={20} color="#D4AF37" />
          <Text className="text-[10px] text-muted-foreground">ضمان الجودة</Text>
        </View>
      </View>

      {/* Share & Compare */}
      <View className="mt-6 flex-row gap-6 pb-10">
        <Pressable className="flex-row items-center gap-2">
          <ArrowRightLeft size={16} color="#666" />
          <Text className="text-sm text-slate-500">مقارنة</Text>
        </Pressable>
        <Pressable className="flex-row items-center gap-2">
          <Share2 size={16} color="#666" />
          <Text className="text-sm text-slate-500">مشاركة</Text>
        </Pressable>
      </View>
    </View>
  );
};
