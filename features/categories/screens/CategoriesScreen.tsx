import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Image,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Dimensions,
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
// Layout constants
// ─────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.floor(SCREEN_WIDTH * 0.27);
const CONTENT_WIDTH = SCREEN_WIDTH - SIDEBAR_WIDTH;
const CONTENT_PADDING = 14;
const COLS = 3;
const COLUMN_GAP = 10; // horizontal gap between the 3 columns
const GRID_ITEM_WIDTH = Math.floor(
  (CONTENT_WIDTH - CONTENT_PADDING * 2 - COLUMN_GAP * (COLS - 1)) / COLS
);
const AVATAR_SIZE = Math.min(52, GRID_ITEM_WIDTH - 10);

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type SubItem = { id: number; name: string; image?: string | null };
type Category = { id: number; name: string; image?: string | null; children?: SubItem[] };

// ─────────────────────────────────────────────
// CategoryAvatar — circular image with letter fallback
// ─────────────────────────────────────────────

const CategoryAvatar = ({
  image,
  name,
  size = AVATAR_SIZE,
}: {
  image?: string | null;
  name: string;
  size?: number;
}) => {
  const [imgError, setImgError] = React.useState(false);
  const showImage = !!image && !imgError;

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
      {showImage ? (
        <Image
          source={{ uri: getImageUrl(image) }}
          style={{ width: size, height: size }}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <Text style={{ fontSize: size * 0.35, fontWeight: '700', color: '#10b981' }}>
          {name?.charAt(0)?.toUpperCase() ?? '?'}
        </Text>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────
// SubcategoryGrid — explicit rows, NO flex-wrap
// flex-wrap causes text bleed on iOS
// ─────────────────────────────────────────────

const SubcategoryGrid = ({
  items,
  onPress,
}: {
  items: SubItem[];
  onPress: (id: number) => void;
}) => {
  const rows: SubItem[][] = [];
  for (let i = 0; i < items.length; i += COLS) {
    rows.push(items.slice(i, i + COLS));
  }

  return (
    <>
      {rows.map((row, rowIdx) => (
        // gap between columns — explicit row (no flex-wrap) so `gap` is safe on iOS
        <View key={rowIdx} style={{ flexDirection: 'row', gap: COLUMN_GAP, marginBottom: 4 }}>
          {row.map((sub) => (
            <Pressable
              key={sub.id}
              onPress={() => onPress(sub.id)}
              style={({ pressed }) => ({
                width: GRID_ITEM_WIDTH,
                alignItems: 'center',
                paddingVertical: 10,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <CategoryAvatar image={sub.image} name={sub.name} />
              <Text
                numberOfLines={2}
                style={{
                  fontSize: 10,
                  textAlign: 'center',
                  marginTop: 6,
                  color: '#374151',
                  fontWeight: '500',
                  lineHeight: 14,
                  // cap text to item width so it never bleeds
                  width: GRID_ITEM_WIDTH,
                }}
              >
                {sub.name}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </>
  );
};

// ─────────────────────────────────────────────
// Skeleton loading state
// ─────────────────────────────────────────────

const MegaMenuSkeleton = ({ insetTop }: { insetTop: number }) => (
  <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#fff', paddingTop: insetTop }}>
    {/* Search bar */}
    <View
      style={{
        position: 'absolute',
        top: insetTop,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        zIndex: 10,
        justifyContent: 'center',
        paddingHorizontal: 14,
      }}
    >
      <Skeleton style={{ height: 40, width: '100%', borderRadius: 24 }} />
    </View>

    {/* Sidebar */}
    <View
      style={{
        width: SIDEBAR_WIDTH,
        borderRightWidth: 1,
        borderRightColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
        paddingTop: 60,
      }}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <Skeleton key={i} style={{ height: 52, width: '100%', borderRadius: 0, marginBottom: 1 }} />
      ))}
    </View>

    {/* Content */}
    <View style={{ flex: 1, padding: CONTENT_PADDING, paddingTop: 76, gap: 14 }}>
      <Skeleton style={{ height: 18, width: 100, borderRadius: 6 }} />
      <Skeleton style={{ height: 110, width: '100%', borderRadius: 14 }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {Array.from({ length: 6 }, (_, i) => (
          <View
            key={i}
            style={{ width: GRID_ITEM_WIDTH, alignItems: 'center', marginBottom: 16, gap: 8 }}
          >
            <Skeleton style={{ height: AVATAR_SIZE, width: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }} />
            <Skeleton style={{ height: 10, width: GRID_ITEM_WIDTH - 16, borderRadius: 4 }} />
          </View>
        ))}
      </View>
    </View>
  </View>
);

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────

export default function CategoriesScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation('home');
  const insets = useSafeAreaInsets();
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;

  const { data: categoryState, isLoading } = useGetCategoryTreeQuery({});
  const categories: Category[] = (categoryState?.tree ?? []) as Category[];

  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !selectedId) {
      setSelectedId(categories[0].id);
    }
  }, [categories]);

  const selectedCategory = categories.find((c) => c.id === selectedId);

  const handleCategoryPress = useCallback((id: number) => setSelectedId(id), []);

  const handleSubPress = useCallback(
    (id: number) => router.push(`/(tabs)/(categories)/(context)/categories/${id}` as any),
    [router]
  );

  const handleViewAll = useCallback(
    (id: number) => router.push(`/(tabs)/(categories)/(context)/categories/${id}` as any),
    [router]
  );

  if (isLoading) return <MegaMenuSkeleton insetTop={insets.top} />;

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Animated.View
      entering={FadeIn.duration(350)}
      style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top }}
    >
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
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            backgroundColor: '#f1f5f9',
            borderRadius: 24,
            paddingHorizontal: 14,
            height: 40,
            gap: 8,
          }}
        >
          <Search size={16} color="#94a3b8" />
          <Text style={{ flex: 1, fontSize: 13, color: '#94a3b8', textAlign: isRTL ? 'right' : 'left' }}>
            {t('Header.searchPlaceholder', { defaultValue: 'ابحث عن المنتجات...' })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Body ── */}
      <View style={{ flex: 1, flexDirection: 'row' }}>

        {/* ── Sidebar ── */}
        <View
          style={{
            width: SIDEBAR_WIDTH,
            borderRightWidth: 1,
            borderRightColor: '#e2e8f0',
            backgroundColor: '#f8fafc',
          }}
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
                    backgroundColor: isSelected ? '#fff' : pressed ? '#f1f5f9' : 'transparent',
                  })}
                >
                  <Text
                    numberOfLines={3}
                    style={{
                      fontSize: 11,
                      textAlign: 'center',
                      fontWeight: isSelected ? '700' : '500',
                      color: isSelected ? '#10b981' : '#64748b',
                      lineHeight: 16,
                      paddingHorizontal: 4,
                    }}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {/* ── Content Panel ── */}
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          {selectedCategory && (
            <Animated.View
              key={selectedCategory.id}
              entering={FadeInRight.duration(220)}
              style={{ flex: 1 }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: CONTENT_PADDING, paddingBottom: 60 }}
              >
                {/* Title + View All */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>
                    {selectedCategory.name}
                  </Text>
                  <Pressable
                    onPress={() => handleViewAll(selectedCategory.id)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#10b981' }}>
                      {t('FeaturedCategories.viewAll', { defaultValue: 'View All' })}
                    </Text>
                    <ChevronIcon size={13} color="#10b981" />
                  </Pressable>
                </View>

                {/* Banner */}
                {selectedCategory.image && (
                  <Pressable
                    onPress={() => handleViewAll(selectedCategory.id)}
                    style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16, height: 110 }}
                  >
                    <Image
                      source={{ uri: getImageUrl(selectedCategory.image) }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(0,0,0,0.38)',
                        paddingVertical: 6,
                        paddingHorizontal: 10,
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', textAlign: 'center' }}>
                        {selectedCategory.name}
                      </Text>
                    </View>
                  </Pressable>
                )}

                {/* Subcategory grid */}
                {selectedCategory.children && selectedCategory.children.length > 0 ? (
                  <SubcategoryGrid
                    items={selectedCategory.children as SubItem[]}
                    onPress={handleSubPress}
                  />
                ) : (
                  <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                    <Text style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
                      {t('MegaMenu.noSubcategories', { defaultValue: 'لا توجد أقسام فرعية' })}
                    </Text>
                    <Pressable
                      onPress={() => handleViewAll(selectedCategory.id)}
                      style={{
                        backgroundColor: '#10b981',
                        borderRadius: 24,
                        paddingHorizontal: 24,
                        paddingVertical: 10,
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>
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
