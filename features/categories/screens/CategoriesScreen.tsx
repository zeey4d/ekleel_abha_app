import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
  I18nManager,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { useGetCategoryTreeQuery } from '@/store/features/categories/categoriesSlice';
import { useRouter } from 'expo-router';
import { getImageUrl } from '@/lib/image-utils';
import { Search, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.floor(SCREEN_WIDTH * 0.28);

export default function CategoriesScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation('home');
  const insets = useSafeAreaInsets();
  const isRtl = i18n.language === 'ar' || I18nManager.isRTL;

  const { data: categoryState, isLoading } = useGetCategoryTreeQuery({});
  const categories = categoryState?.tree || [];

  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Set first category as default when data loads
  useEffect(() => {
    if (categories.length > 0 && selectedId === null) {
      setSelectedId(categories[0].id);
    }
  }, [categories, selectedId]);

  const activeCategory = categories.find((c: any) => c.id === selectedId);

  const handleSubPress = (id: number) => {
    router.push(`/(tabs)/(categories)/(context)/categories/${id}` as any);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top }}>
      {/* Header */}
      {/* <View className="px-4 py-4 border-b border-slate-100 bg-white">
        <Text className="text-xl font-bold text-slate-900">{t('Header.categories', 'الأقسام')}</Text>
      </View> */}
      
      {/* ── Search Bar ── */}
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0',
          backgroundColor: '#fff',
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/(categories)/(context)/(search)' as any)}
          style={{
            flexDirection: isRtl ? 'row-reverse' : 'row',
            alignItems: 'center',
            backgroundColor: '#f1f5f9',
            borderRadius: 24,
            paddingHorizontal: 14,
            height: 40,
            gap: 8,
          }}
        >
          <Search size={16} color="#94a3b8" />
          <Text style={{ flex: 1, fontSize: 13, color: '#94a3b8', textAlign: isRtl ? 'right' : 'left' }}>
            {t('Header.searchPlaceholder', { defaultValue: 'ابحث عن المنتجات...' })}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 flex-row">
        {/* Sidebar */}
        <View 
          style={{ width: SIDEBAR_WIDTH }} 
          className={cn(
            "bg-slate-50 h-full",
            isRtl ? "border-l border-slate-200" : "border-r border-slate-200"
          )}
        >
          <FlatList
            data={categories}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selectedId === item.id;
              return (
                <Pressable
                  onPress={() => setSelectedId(item.id)}
                  className={cn(
                    "px-3 py-4 border-b border-slate-100 flex-row items-center justify-between",
                    isSelected ? "bg-white" : "bg-transparent"
                  )}
                >
                  <View className="flex-1">
                    <Text 
                      className={cn(
                        "text-[12px] leading-4 text-center",
                        isSelected ? "text-primary font-bold" : "text-slate-500 font-medium"
                      )}
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className={cn(
                      "absolute top-0 bottom-0 w-1 bg-primary",
                      isRtl ? "right-0" : "left-0"
                    )} />
                  )}
                </Pressable>
              );
            }}
          />
        </View>

        {/* Content Area */}
        <View className="flex-1 bg-white">
          {activeCategory && (
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            >
              {/* Category Header */}
              <View className="mb-6">
                <Text className="text-lg font-bold text-slate-900 mb-1">{activeCategory.name}</Text>
                <View className="w-10 h-1 bg-primary rounded-full" />
              </View>

              {/* Subcategories Grid */}
              <View className="flex-row flex-wrap gap-y-6">
                {activeCategory.children && activeCategory.children.length > 0 ? (
                  activeCategory.children.map((sub: any) => (
                    <Pressable
                      key={sub.id}
                      onPress={() => handleSubPress(sub.id)}
                      className="items-center"
                      style={{ width: '33.33%' }}
                    >
                      <View className="w-16 h-16 rounded-full bg-slate-50 overflow-hidden items-center justify-center border border-slate-100">
                        {sub.image ? (
                          <Image
                            source={{ uri: getImageUrl(sub.image) }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <Text className="text-primary font-bold text-xl">
                            {sub.name.charAt(0)}
                          </Text>
                        )}
                      </View>
                      <Text 
                        className="text-[10px] text-center mt-2 font-medium text-slate-600 px-1"
                        numberOfLines={2}
                      >
                        {sub.name}
                      </Text>
                    </Pressable>
                  ))
                ) : (
                  <View className="flex-1 items-center justify-center py-10">
                    <Text className="text-slate-400 text-sm text-center">
                      {t('noSubcategories', 'لا توجد أقسام فرعية')}
                    </Text>
                    <Pressable 
                      onPress={() => handleSubPress(activeCategory.id)}
                      className="mt-4 bg-primary/10 px-4 py-2 rounded-full"
                    >
                      <Text className="text-primary font-bold text-xs">
                        {t('browseAll', 'تصفح الكل')}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}