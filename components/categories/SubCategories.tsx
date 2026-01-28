import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface SubCategoriesProps {
  categories: { id: number | string; name: string; image?: string | null }[];
}

export const SubCategories = ({ categories }: SubCategoriesProps) => {
  const { t } = useTranslation('categories');
  const router = useRouter();

  if (!categories || categories.length === 0) return null;

  return (
    <View className="mb-6">
      <Text className="mb-4 text-lg font-bold text-slate-900">{t('SubCategories.title')}</Text>
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/categories/${item.id}`)}
            className="flex-row items-center gap-3 rounded-full border border-slate-200 bg-white p-2">
            <View className="h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-slate-50">
              {item.image ? (
                <Image
                  source={{ uri: getImageUrl(item.image) }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-xs font-bold text-slate-300">{item.name[0]}</Text>
              )}
            </View>
            <Text className="text-sm font-medium text-slate-700">{item.name}</Text>
            <ChevronRight size={16} color="#9ca3af" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
