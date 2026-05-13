import React, { useState } from "react";
import { View, Share, Pressable, useWindowDimensions, Image } from "react-native";
import { Star, Share2, Heart, ShieldCheck, ArrowRightLeft, SaudiRiyal, ChevronRight, ChevronLeft } from "lucide-react-native";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { ProductOptions } from "@/features/products/components/ProductDetail/ProductOptions";
import { ProductActions } from "@/features/products/components/ProductDetail/ProductActions";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import RenderHTML from 'react-native-render-html';
import { I18nManager } from "react-native";

const TEAL = "#0d9488";

interface ProductInfoProps {
  product: any;
}

const InstallmentCard = ({ type, price }: { type: 'tabby' | 'tamara', price: number }) => {
  const installmentPrice = (price / 4).toFixed(2);
  const isTabby = type === 'tabby';
  const bgColor = isTabby ? "#f0fdfa" : "#fff1f2";
  const borderColor = isTabby ? "#ccfbf1" : "#ffe4e6";
  const logoBg = isTabby ? "#39f3bb" : "#d2003c";
  
  return (
    <Pressable 
      style={{ backgroundColor: bgColor, borderColor: borderColor }}
      className="flex-1 border rounded-[18px] p-3 active:opacity-70"
    >
      <View className="flex-row items-center justify-between mb-2" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
        <View className="h-6 w-14 overflow-hidden">
           <Image 
             source={isTabby ? require("@/assets/images/payment/tabby_logo.png") : require("@/assets/images/payment/tamara_logo.png")}
             style={{ width: '100%', height: '100%' }}
             resizeMode="contain"
           />
        </View>
        {I18nManager.isRTL ? <ChevronLeft size={14} color="#475569" /> : <ChevronRight size={14} color="#475569" />}
      </View>
      
      <Text style={{ fontFamily: 'Tajawal_500Medium', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-[9px] text-slate-600 leading-tight mb-2">
        {isTabby ? "قسم فاتورتك على 4 دفعات بدون فوائد" : "دفعات شهرية، متوافقة مع الشريعة."}
      </Text>
      
      <View className="flex-row items-center" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
        <Text style={{ fontFamily: 'Tajawal_800ExtraBold' }} className="text-slate-900 text-xs">{installmentPrice}</Text>
        <SaudiRiyal size={10} color="#1e293b" style={{ marginHorizontal: 2 }} />
      </View>
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

  // Safely extract brand name
  let brandName = "LOGO";
  if (product.brand) {
    brandName = typeof product.brand === 'object' && product.brand !== null 
      ? (product.brand.name || "LOGO") 
      : product.brand;
  }

  return (
    <View className="flex-col bg-white p-4 mt-2 mx-2 mb-2 rounded-[32px] border border-slate-50">
      {/* Top Brand Banner & Wishlist */}
      <View className="bg-white rounded-[24px] p-4 mb-6 shadow-sm border border-slate-50">
        <View className="flex-row items-center justify-between" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
          <View className="flex-row gap-4 items-center" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
            <View className="h-10 w-20 bg-slate-50 rounded-xl items-center justify-center border border-slate-100">
               <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-slate-400 text-[10px]">{brandName}</Text>
            </View>
            <View className="flex-col">
              <View className="flex-row items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full self-start" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
                <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-[9px] text-green-600">%100 أصلي</Text>
                <ShieldCheck size={10} color="#16a34a" />
              </View>
              <Pressable>
                <Text style={{ fontFamily: 'Tajawal_700Bold', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-[10px] text-teal-600 mt-1">
                  المزيد من {brandName}
                </Text>
              </Pressable>
            </View>
          </View>
          
          <Pressable 
            onPress={() => setIsWishlisted(!isWishlisted)}
            className={cn("w-10 h-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-50")}
          >
            <Heart size={20} color={isWishlisted ? "#ef4444" : "#94a3b8"} fill={isWishlisted ? "#ef4444" : "transparent"} />
          </Pressable>
        </View>
      </View>

      {/* Ratings */}
      <View className="flex-row items-center gap-2 mb-3" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
        <View className="flex-row" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={14}
              fill={i < Math.round(product.average_rating) ? "#FACC15" : "transparent"}
              color={i < Math.round(product.average_rating) ? "#FACC15" : "#cbd5e1"} 
              style={{ marginHorizontal: 1 }}
            />
          ))}
        </View>
        <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-[11px] text-slate-400 mx-1">({product.review_count || 0})</Text>
      </View>

      <Text style={{ fontFamily: 'Tajawal_800ExtraBold', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-xl text-slate-900 mb-6 leading-8">
        {product.name}
      </Text>

      {/* Price Section */}
      <View className="mb-8">
        <View className="flex-row items-center gap-3" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
          <View className="flex-row items-center" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
            <Text style={{ fontFamily: 'Tajawal_800ExtraBold', color: TEAL }} className="text-4xl">
              {finalPrice.toFixed(0)}
            </Text>
            <SaudiRiyal size={24} color={TEAL} style={{ marginHorizontal: 4 }} />
          </View>
          {isOnSale && (
            <View className="flex-row items-center gap-2" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
              <View className="flex-row items-center" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
                <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-lg text-slate-300 line-through">
                  {originalPrice.toFixed(0)}
                </Text>
                <SaudiRiyal size={12} color="#cbd5e1" style={{ marginHorizontal: 2 }} />
              </View>
              <View className="bg-red-500 px-2 py-0.5 rounded-lg">
                <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-white text-[10px]">-{discountPercentage}%</Text>
               </View>
            </View>
          )}
        </View>
        <Text style={{ fontFamily: 'Tajawal_700Bold', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-[10px] text-slate-400 mt-2">شامل الضريبة</Text>
      </View>

      {/* Tabby & Tamara Installments */}
      <View className="flex-row gap-4 mb-10" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
        <InstallmentCard type="tamara" price={finalPrice} />
        <InstallmentCard type="tabby" price={finalPrice} />
      </View>

      {/* Options Selector */}
      {product.options && product.options.length > 0 && (
        <View className="mb-8 p-6 bg-white border border-slate-50 rounded-[28px] shadow-sm">
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
      <View className="mt-10 flex-row items-center justify-between border-t border-slate-100 pt-8" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
        <Pressable
          onPress={handleShare}
          className="flex-row items-center gap-2 px-6 py-3 rounded-full bg-slate-100 active:bg-slate-200"
          style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}
        >
          <Share2 size={18} color="#475569" />
          <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-sm text-slate-600">{t('ProductDetail.share', { defaultValue: 'مشاركة المنتج' })}</Text>
        </Pressable>

        <View>
          <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-[10px] text-slate-400">رقم الموديل: {product.model || "N/A"}</Text>
        </View>
      </View>
    </View>
  );
};
