import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { useGetCategoryTreeQuery } from '@/store/features/categories/categoriesSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'expo-router';
import { getImageUrl } from '@/lib/image-utils';
import { Search, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.27;

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Circular image or letter fallback for a category */
const CategoryAvatar = ({
  image,
  name,
  size = 64,
}: {
  image: string | null | undefined;
  name: string;
  size?: number;
}) => {
  const initials = name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {image ? (
        <Image
          source={{ uri: getImageUrl(image) }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <Text style={{ fontSize: size * 0.35, fontWeight: '700', color: '#94a3b8' }}>
          {initials}
        </Text>
      )}
    </View>
  );
};

/** Skeleton placeholder shown during loading */
const MegaMenuSkeleton = ({ insetTop }: { insetTop: number }) => (
  <View className="flex-1 flex-row bg-background" style={{ paddingTop: insetTop }}>
    {/* Search skeleton */}
    <View className="absolute top-0 left-0 right-0 h-14 bg-background border-b border-border z-10" />

    {/* Sidebar skeleton */}
    <View
      className="border-r border-border bg-secondary/20 pt-14"
      style={{ width: SIDEBAR_WIDTH }}
    >
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-none mb-px" />
      ))}
    </View>

    {/* Content skeleton */}
    <View className="flex-1 p-4 pt-16 gap-4">
      <Skeleton className="h-5 w-32 rounded-md" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <View className="flex-row flex-wrap gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <View key={i} className="w-[30%] items-center gap-2">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-3 w-14 rounded" />
          </View>
        ))}
      </View>
    </View>
  </View>
);

// ─────────────────────────────────────────────
// MegaMenu Screen
// ─────────────────────────────────────────────

export default function CategoriesScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation('home');
  const insets = useSafeAreaInsets();
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;

  const { data: categoryState, isLoading } = useGetCategoryTreeQuery({});
  const categories = categoryState?.tree ?? [];

  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Auto-select first category once loaded
  useEffect(() => {
    if (categories.length > 0 && !selectedId) {
      setSelectedId(categories[0].id);
    }
  }, [categories]);

  const selectedCategory = categories.find((c) => c.id === selectedId);

  const handleCategoryPress = useCallback((id: number) => {
    setSelectedId(id);
  }, []);

  // ── Loading state ──────────────────────────
  if (isLoading) {
    return <MegaMenuSkeleton insetTop={insets.top} />;
  }

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Animated.View
      className="flex-1 bg-background"
      entering={FadeIn.duration(400)}
      style={{ paddingTop: insets.top }}
    >
      {/* ── Search Bar Header ──────────────── */}
      <View className="px-4 py-2 border-b border-border bg-background z-10">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/(categories)/(context)/(search)')}
          className="flex-row items-center bg-slate-100 rounded-full px-4 h-11"
        >
          <Search size={18} color="#94a3b8" />
          <Text className="flex-1 ml-2 text-sm text-slate-400">
            {t('Header.searchPlaceholder', { defaultValue: 'ابحث عن المنتجات...' })}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 flex-row">
        {/* ── Left Sidebar ──────────────────── */}
        <View
          className="bg-slate-50 border-r border-border"
          style={{ width: SIDEBAR_WIDTH }}
        >
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => {
              const isSelected = selectedId === item.id;
              return (
                <Pressable
                  onPress={() => handleCategoryPress(item.id)}
                  style={({ pressed }) => ({
                    paddingVertical: 14,
                    paddingHorizontal: 8,
                    borderLeftWidth: isRTL ? 0 : 3,
                    borderRightWidth: isRTL ? 3 : 0,
                    borderColor: isSelected ? '#10b981' : 'transparent',
                    backgroundColor: isSelected
                      ? '#ffffff'
                      : pressed
                      ? '#f1f5f9'
                      : 'transparent',
                  })}
                >
                  <Text
                    numberOfLines={2}
                    style={{
                      fontSize: 11,
                      textAlign: 'center',
                      fontWeight: isSelected ? '700' : '500',
                      color: isSelected ? '#10b981' : '#64748b',
                      lineHeight: 16,
                    }}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {/* ── Right Content Panel ───────────── */}
        <View className="flex-1 bg-background">
          {selectedCategory && (
            <Animated.View
              key={selectedCategory.id}
              entering={FadeInRight.duration(250)}
              style={{ flex: 1 }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 14, paddingBottom: 50 }}
              >
                {/* Section header */}
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-base font-bold text-foreground">
                    {selectedCategory.name}
                  </Text>
                  <Pressable
                    onPress={() =>
                      router.push(
                        `/(tabs)/(categories)/(context)/categories/${selectedCategory.id}`
                      )
                    }
                    className="flex-row items-center gap-1"
                  >
                    <Text className="text-xs text-primary font-semibold">
                      {t('FeaturedCategories.viewAll', { defaultValue: 'عرض الكل' })}
                    </Text>
                    <ChevronIcon size={14} color="#10b981" />
                  </Pressable>
                </View>

                {/* Category banner */}
                {selectedCategory.image && (
                  <Pressable
                    onPress={() =>
                      router.push(
                        `/(tabs)/(categories)/(context)/categories/${selectedCategory.id}`
                      )
                    }
                    className="mb-5 rounded-2xl overflow-hidden"
                    style={{ elevation: 2 }}
                  >
                    <Image
                      source={{ uri: getImageUrl(selectedCategory.image) }}
                      style={{ width: '100%', height: 110 }}
                      resizeMode="cover"
                    />
                    <View className="absolute inset-x-0 bottom-0 bg-black/40 px-3 py-2">
                      <Text className="text-white text-xs font-bold text-center">
                        {selectedCategory.name}
                      </Text>
                    </View>
                  </Pressable>
                )}

                {/* Subcategories grid */}
                {selectedCategory.children && selectedCategory.children.length > 0 ? (
                  <View className="flex-row flex-wrap">
                    {selectedCategory.children.map((sub) => (
                      <Pressable
                        key={sub.id}
                        onPress={() =>
                          router.push(
                            `/(tabs)/(categories)/(context)/categories/${sub.id}`
                          )
                        }
                        style={({ pressed }) => ({
                          width: '33.33%',
                          alignItems: 'center',
                          paddingVertical: 10,
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <CategoryAvatar image={sub.image} name={sub.name} size={60} />
                        <Text
                          numberOfLines={2}
                          style={{
                            fontSize: 10,
                            textAlign: 'center',
                            marginTop: 6,
                            color: '#374151',
                            fontWeight: '500',
                            lineHeight: 14,
                          }}
                        >
                          {sub.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  /* Empty state */
                  <View className="flex-1 items-center justify-center py-16">
                    <Text className="text-sm text-muted-foreground mb-4">
                      {t('MegaMenu.noSubcategories', { defaultValue: 'لا توجد أقسام فرعية' })}
                    </Text>
                    <Pressable
                      onPress={() =>
                        router.push(
                          `/(tabs)/(categories)/(context)/categories/${selectedCategory.id}`
                        )
                      }
                      className="bg-primary rounded-full px-6 py-2"
                    >
                      <Text className="text-white font-bold text-xs">
                        {t('MegaMenu.browseProducts', { defaultValue: 'تصفح المنتجات' })}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </ScrollView>
            </Animated.View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
