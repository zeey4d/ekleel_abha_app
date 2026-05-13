import React, { useState, useCallback, Suspense, lazy } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  I18nManager,
  Pressable,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react-native';


const TEAL = "#0d9488";

// Store
import { useGetCategoryByIdQuery } from '@/store/features/categories/categoriesSlice';

// Components (above-the-fold)
import { HeroSlider } from '@/features/home/components/HeroSlider';
import { SubCategories } from '@/features/categories/components/SubCategories';

// Lazy-loaded banner sections (below-the-fold)
const PromoGrid = lazy(() =>
  import('@/features/home/components/PromoGrid').then((m) => ({ default: m.PromoGrid })),
);
const VerticalPromoGrid = lazy(() =>
  import('@/features/home/components/VerticalPromoGrid').then((m) => ({
    default: m.VerticalPromoGrid,
  })),
);
const SmallPortraitBannersGrid = lazy(() =>
  import('@/features/home/components/SmallPortraitBannersGrid').then((m) => ({
    default: m.SmallPortraitBannersGrid,
  })),
);
const FeaturedBrands = lazy(() =>
  import('@/features/home/components/FeaturedBrands').then((m) => ({
    default: m.FeaturedBrands,
  })),
);

// ─────────────────────────────────────────────
// Types & Helpers
// ─────────────────────────────────────────────

type BannerItem = {
  id: number | string;
  banner_type?: string;
  image?: string | null;
  url?: string;
  link?: string;
  title?: string;
  sort_order?: number;
  image_sort_order?: number;
};

type RowItem = {
  row_id: string | number;
  banner_type: string;
  banners: BannerItem[];
  title?: string;
  subtitle?: string;
  sort_order?: number;
  spacing_top?: number;
  spacing_bottom?: number;
  background_color?: string;
};

const SectionFallback = () => (
  <View style={{ alignItems: 'center', paddingVertical: 32 }}>
    <ActivityIndicator size="small" color={TEAL} />
  </View>
);

function sortByOrder(arr: any[]) {
  return [...arr].sort(
    (a, b) =>
      Number(a.sort_order ?? a.image_sort_order ?? 0) -
      Number(b.sort_order ?? b.image_sort_order ?? 0),
  );
}

// ─────────────────────────────────────────────
// Dynamic Row Renderer
// ─────────────────────────────────────────────

function DynamicRow({ row }: { row: RowItem }) {
  const { banner_type, banners: rawBanners, title, subtitle, spacing_top, spacing_bottom, background_color } = row;
  if (!rawBanners || rawBanners.length === 0) return null;

  const banners = sortByOrder(rawBanners).map(b => ({ ...b, url: b.link || b.url })) as any[];

  return (
    <View
      style={{
        paddingTop: spacing_top ?? 0,
        paddingBottom: spacing_bottom ?? 0,
        backgroundColor: background_color ?? undefined,
      }}
      className="mb-6"
    >
      {(title || subtitle) && (
        <View className="px-4 mb-6">
          {title && (
            <Text style={{ fontFamily: 'Tajawal-Bold', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-xl text-slate-800">
                {title}
            </Text>
          )}
          {subtitle && (
            <Text style={{ fontFamily: 'Tajawal-Medium', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-xs text-slate-400 mt-1">
                {subtitle}
            </Text>
          )}
        </View>
      )}

      <Suspense fallback={<SectionFallback />}>
        {banner_type === 'small_portrait' && <SmallPortraitBannersGrid banners={banners} />}
        {banner_type === 'large_portrait' && <VerticalPromoGrid banners={banners} />}
        {banner_type === 'wide_content' && <PromoGrid banners={banners} />}
        {(banner_type === 'desktop_hero' || banner_type === 'mobile_hero') && (
          <HeroSlider banners={banners} />
        )}
      </Suspense>
    </View>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

function CategoryPageSkeleton() {
  return (
    <View className="flex-1 bg-[#f8fafc] p-4 gap-6">
      <Skeleton className="h-60 w-full rounded-[32px] bg-white border border-slate-50" />
      <View className="flex-row gap-4 px-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-16 rounded-full bg-white border border-slate-50" />
        ))}
      </View>
      <Skeleton className="h-52 w-full rounded-[32px] bg-white border border-slate-50" />
    </View>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function CategoryLandingPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation('category_details');
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;

  const { data: categoryData, isLoading, error } = useGetCategoryByIdQuery(
    Number(id),
    { skip: !id },
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <Stack.Screen 
          options={{ 
              headerShown: true, 
              title: '', 
              headerStyle: { backgroundColor: '#f8fafc' },
              headerShadowVisible: false,
          }} 
        />
        <CategoryPageSkeleton />
      </View>
    );
  }

  if (error || !categoryData) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center p-8">
        <Stack.Screen options={{ headerShown: true, title: '', headerStyle: { backgroundColor: '#f8fafc' }, headerShadowVisible: false }} />
        <AlertCircle size={64} color="#f87171" />
        <Text style={{ fontFamily: 'Tajawal-Bold' }} className="text-xl text-slate-800 mt-6 text-center">
          {t('notFound', 'التصنيف غير موجود')}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-8 bg-teal-600 px-10 py-4 rounded-full shadow-lg"
          style={{ shadowColor: TEAL, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }}
        >
          <Text style={{ fontFamily: 'Tajawal-Bold' }} className="text-white text-base">{t('goBack', 'رجوع')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    banners = [],
    children = [],
    brands = [],
    rows = [],
    name,
  } = categoryData as any;

  // Filter legacy banners if no rows exist
  const sortedBanners = sortByOrder(banners);
  const heroBanners = sortedBanners.filter(b => b.banner_type === 'mobile_hero' || b.banner_type === 'desktop_hero' || !b.banner_type);
  const wideBanners = sortedBanners.filter(b => b.banner_type === 'wide_content');
  const portraitBanners = sortedBanners.filter(b => b.banner_type === 'small_portrait' || b.banner_type === 'large_portrait');

  const sortedRows: RowItem[] = sortByOrder(rows);
  const hasRows = sortedRows.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: name ?? '',
          headerTitleStyle: { fontFamily: 'Tajawal-Bold', fontSize: 18 },
          headerStyle: { backgroundColor: '#f8fafc' },
          headerShadowVisible: false,
          headerLeft: () => (
             <Pressable 
                onPress={() => router.back()} 
                className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm border border-slate-50 ml-2"
             >
                  {I18nManager.isRTL ? <ChevronRight color="#1e293b" size={20} /> : <ChevronLeft color="#1e293b" size={20} />}
             </Pressable>
          ),
        }}
      />

      <Animated.ScrollView
        entering={FadeIn.duration(350)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* ── Hero Section ── */}
        {hasRows ? (
          // Handle dynamic rows
          sortedRows.map((row) => (
            <DynamicRow key={row.row_id} row={row} />
          ))
        ) : (
          // Fallback legacy layout
          <>
            {heroBanners.length > 0 && <HeroSlider banners={heroBanners} />}
            
            {children.length > 0 && (
              <View className="px-4 py-6">
                <SubCategories categories={children} />
              </View>
            )}

            <View className="px-4 gap-6">
              {wideBanners.length > 0 && (
                <Suspense fallback={<SectionFallback />}>
                  <PromoGrid banners={wideBanners} />
                </Suspense>
              )}
              {portraitBanners.length > 0 && (
                <Suspense fallback={<SectionFallback />}>
                  <SmallPortraitBannersGrid banners={portraitBanners} />
                </Suspense>
              )}
            </View>
          </>
        )}

        {/* ── Children (if not in legacy) ── */}
        {hasRows && children.length > 0 && (
          <View className="px-4 py-6">
            <SubCategories categories={children} />
          </View>
        )}

        {/* ── Brands ── */}
        {brands.length > 0 && (
          <View className="mt-8 px-4 border-t border-slate-50 pt-10">
            <Text style={{ fontFamily: 'Tajawal-Bold', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-xl text-slate-800 mb-6">
              {t('Breadcrumbs.brands', 'الماركات')}
            </Text>
            <Suspense fallback={<SectionFallback />}>
              <FeaturedBrands brands={brands} />
            </Suspense>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}
