import React, { useState, useCallback, Suspense, lazy } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react-native';

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
// Types
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

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const SectionFallback = () => (
  <View style={{ alignItems: 'center', paddingVertical: 24 }}>
    <ActivityIndicator size="small" color="#10b981" />
  </View>
);

function sortByOrder(arr: any[]) {
  return [...arr].sort(
    (a, b) =>
      Number(a.sort_order ?? a.image_sort_order ?? 0) -
      Number(b.sort_order ?? b.image_sort_order ?? 0),
  );
}

function normalizeBannerUrl(b: BannerItem): BannerItem {
  return { ...b, url: b.link || b.url };
}

function useBannersByType(banners: BannerItem[]) {
  const sorted = sortByOrder(banners);
  return {
    desktopHero: sorted.filter((b) => b.banner_type === 'desktop_hero' || !b.banner_type),
    mobileHero: sorted.filter((b) => b.banner_type === 'mobile_hero'),
    wideContent: sorted.filter((b) => b.banner_type === 'wide_content'),
    largePortrait: sorted.filter((b) => b.banner_type === 'large_portrait'),
    smallPortrait: sorted.filter((b) => b.banner_type === 'small_portrait'),
  };
}

// ─────────────────────────────────────────────
// Row renderer
// ─────────────────────────────────────────────

function DynamicRow({ row }: { row: RowItem }) {
  const { banner_type, banners: rawBanners, title, subtitle, spacing_top, spacing_bottom, background_color } = row;
  if (!rawBanners || rawBanners.length === 0) return null;

  const banners = sortByOrder(rawBanners).map(normalizeBannerUrl) as any[];

  return (
    <View
      style={{
        paddingTop: spacing_top ?? 0,
        paddingBottom: spacing_bottom ?? 0,
        backgroundColor: background_color ?? undefined,
      }}
    >
      {(title || subtitle) && (
        <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
          {title && (
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#0f172a' }}>{title}</Text>
          )}
          {subtitle && (
            <Text style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>{subtitle}</Text>
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
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Skeleton className="h-52 w-full rounded-2xl" />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-14 rounded-full" />
        ))}
      </View>
      <Skeleton className="h-48 w-full rounded-2xl" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} style={{ width: '30%', aspectRatio: 144 / 233, borderRadius: 10 }} />
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// CategoryLandingPage
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

  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  // ── Loading ──────────────────────────────────
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top }}>
        <Stack.Screen options={{ headerShown: false }} />
        <CategoryPageSkeleton />
      </View>
    );
  }

  // ── Error / Not Found ────────────────────────
  if (error || !categoryData) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <AlertCircle size={48} color="#f87171" />
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#0f172a', marginTop: 16, textAlign: 'center' }}>
          {t('notFound', { defaultValue: 'التصنيف غير موجود' })}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20, backgroundColor: '#10b981', borderRadius: 50, paddingHorizontal: 24, paddingVertical: 10 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>
            {t('goBack', { defaultValue: 'رجوع' })}
          </Text>
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

  const {
    desktopHero,
    mobileHero,
    wideContent,
    largePortrait,
    smallPortrait,
  } = useBannersByType(banners);

  const heroSliderBanners = mobileHero.length > 0 ? mobileHero : desktopHero;
  const sortedRows: RowItem[] = sortByOrder(rows);
  const hasRows = sortedRows.some((r) => r.banners?.length > 0);

  // ── Main content ─────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: name ?? '',
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: false,
        }}
      />

      <Animated.ScrollView
        entering={FadeIn.duration(350)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Hero Slider ─────────────────────── */}
        {heroSliderBanners.length > 0 && (
          <HeroSlider banners={heroSliderBanners as any} />
        )}

        {/* ── Sub-categories ─────────────────── */}
        {children.length > 0 && (
          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
            <SubCategories categories={children} />
          </View>
        )}

        {/* ── Dynamic Rows (from CMS) ─────────── */}
        {hasRows ? (
          sortedRows.map((row) => (
            <DynamicRow key={row.row_id} row={row} />
          ))
        ) : (
          /* ── Fallback legacy layout ─────────── */
          <View style={{ paddingHorizontal: 14, gap: 16, paddingTop: 8 }}>

            {smallPortrait.slice(0, 10).length > 0 && (
              <Suspense fallback={<SectionFallback />}>
                <SmallPortraitBannersGrid banners={smallPortrait.slice(0, 10) as any} />
              </Suspense>
            )}

            {largePortrait.slice(0, 4).length > 0 && (
              <Suspense fallback={<SectionFallback />}>
                <VerticalPromoGrid banners={largePortrait.slice(0, 4) as any} />
              </Suspense>
            )}

            {wideContent.slice(0, 6).length > 0 && (
              <Suspense fallback={<SectionFallback />}>
                <PromoGrid banners={wideContent.slice(0, 6) as any} />
              </Suspense>
            )}

            {smallPortrait.slice(10, 20).length > 0 && (
              <Suspense fallback={<SectionFallback />}>
                <SmallPortraitBannersGrid banners={smallPortrait.slice(10, 20) as any} />
              </Suspense>
            )}

            {largePortrait.slice(4, 8).length > 0 && (
              <Suspense fallback={<SectionFallback />}>
                <VerticalPromoGrid banners={largePortrait.slice(4, 8) as any} />
              </Suspense>
            )}

            {wideContent.slice(6, 12).length > 0 && (
              <Suspense fallback={<SectionFallback />}>
                <PromoGrid banners={wideContent.slice(6, 12) as any} />
              </Suspense>
            )}
          </View>
        )}

        {/* ── Brands ─────────────────────────── */}
        {brands.length > 0 && (
          <View style={{ marginTop: 24, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 24 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#0f172a', marginBottom: 14 }}>
              {t('Breadcrumbs.brands', { defaultValue: 'الماركات' })}
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
