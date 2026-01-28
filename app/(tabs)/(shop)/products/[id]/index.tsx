import React, { useEffect } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

// المكونات التي حولناها سابقاً
import { ProductPageContent } from './ProductPageContent';
import { useGetProductByIdQuery } from '@/store/features/products/productsSlice';

/**
 * دالة لتنظيف نصوص HTML (كما في الويب) 
 * مفيدة جداً عند عرض العناوين التي قد تحتوي على رموز
 */
function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export default function ProductDetailsScreen() {
  const { id, locale = 'ar' } = useLocalSearchParams<{ id: string; locale: string }>();

  // استخدام RTK Query لجلب البيانات (بديل الـ fetch في الخادم)
  const { data: product, isLoading, isError } = useGetProductByIdQuery(id);

  // معالجة الاسم المحلي للـ Header
  const productName = product 
    ? (locale === 'ar' ? (product.name_ar || product.name) : (product.name_en || product.name))
    : "جاري التحميل...";

  return (
    <View className="flex-1 bg-background">
      {/* 1. إدارة الـ Metadata (Header في الموبايل) */}
      <Stack.Screen 
        options={{
          title: decodeHtmlEntities(productName),
          headerTitleStyle: { fontFamily: 'heading-font' }, // إذا كان لديك خط مخصص
          headerBackTitle: "",
        }} 
      />

      {/* 2. المحتوى الرئيسي */}
      <ProductPageContent 
        initialProduct={product} 
        id={id} 
        locale={locale} 
      />
    </View>
  );
}