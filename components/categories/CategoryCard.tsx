import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router'; // البديل لـ next/navigation
import { ArrowRight } from 'lucide-react-native';
import { getImageUrl } from '@/lib/image-utils';
import { Badge } from '../ui/badge'; // تأكد أن هذا المكون يدعم Native

interface Category {
  id: number;
  name: string;
  image?: string | null;
  product_count?: number;
  children_count?: number;
}

export const CategoryCard = ({ category }: { category: Category }) => {
  const router = useRouter();

  const handlePress = () => {
    // التوجيه إلى المسار الديناميكي [id]
    // سيفترض المسار: app/categories/[id].tsx
    router.push(`/categories/${category.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      // محاكاة تأثير الـ hover باستخدام الـ state الخاص بـ Pressable
      className={({ pressed }) =>
        `relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white ${pressed ? 'scale-[0.98] border-slate-200 opacity-90' : ''} `
      }>
      {/* Image Container */}
      <View className="relative aspect-square overflow-hidden bg-slate-50">
        {category.image ? (
          <Image
            source={{ uri: getImageUrl(category.image) }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-slate-100">
            <Text className="text-4xl font-bold text-slate-300 opacity-20">{category.name[0]}</Text>
          </View>
        )}

        {/* Overlay - في Native نستخدم View بلون شفاف لأن التدرج يحتاج مكتبة إضافية */}
        <View className="absolute inset-0 bg-black/20" />

        {/* Count Badge */}
        <View className="absolute right-3 top-3">
          <Badge className="rounded-md bg-white/90 px-2 py-1">
            <Text className="text-xs font-medium text-slate-800">
              {category.product_count || 0} Items
            </Text>
          </Badge>
        </View>
      </View>

      {/* Content */}
      <View className="items-center p-5">
        <Text className="mb-1 text-lg font-bold text-slate-900">{category.name}</Text>

        {category.children_count !== undefined && category.children_count > 0 && (
          <Text className="mb-3 text-xs text-slate-500">
            {category.children_count} Subcategories
          </Text>
        )}

        <View className="flex-row items-center gap-1">
          <Text className="text-sm font-medium text-primary">Shop Now</Text>
          <ArrowRight size={16} color="#007AFF" />
        </View>
      </View>
    </Pressable>
  );
};
