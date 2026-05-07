import React, { Suspense, lazy, useMemo, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';

// Store
import { useGetHomepageContentQuery } from '@/store/features/cms/cmsSlice';

// Layout
import HomeHeader from '@/components/layout/header/HomeHeader';

// Above-the-fold components (loaded immediately for fast first paint)
import { HeroSlider } from '@/features/home/components/HeroSlider';
import { FeaturedCategories } from '@/features/home/components/FeaturedCategories';
import { NewArrivals } from '@/features/home/components/NewArrivals';
import { HeroPromoBanners } from '@/features/home/components/HeroPromoBanners';

// Below-the-fold components (lazy-loaded to reduce initial bundle cost)
const TopSellingProducts = lazy(() =>
  import('@/features/home/components/TopSellingProducts').then((m) => ({
    default: m.TopSellingProducts,
  })),
);
const FeaturedBrands = lazy(() =>
  import('@/features/brands/components/FeaturedBrands').then((m) => ({
    default: m.FeaturedBrands,
  })),
);
const DealsOfTheDay = lazy(() =>
  import('@/features/home/components/DealsOfTheDay').then((m) => ({
    default: m.DealsOfTheDay,
  })),
);
const PromoGrid = lazy(() =>
  import('@/features/home/components/PromoGrid').then((m) => ({
    default: m.PromoGrid,
  })),
);
const Testimonials = lazy(() =>
  import('@/features/home/components/Testimonials').then((m) => ({
    default: m.Testimonials,
  })),
);

// UI
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface BannerItem {
  banner_type: string;
  [key: string]: unknown;
}

// ─────────────────────────────────────────────
// Lazy-loading fallback
// ─────────────────────────────────────────────

const SectionLoadingFallback = () => (
  <View className="items-center justify-center py-12">
    <ActivityIndicator size="large" color="#10b981" />
  </View>
);

// ─────────────────────────────────────────────
// Banner filtering helper
// ─────────────────────────────────────────────

function useBannersByType(banners: BannerItem[] | undefined) {
  return useMemo(() => {
    if (!banners) return { sidebar: [], hero: [], promo: [], desktopHero: [], mobileHero: [], wideContent: [], largePortrait: [], smallPortrait: [] };

    const sidebar: BannerItem[] = [];
    const hero: BannerItem[] = [];
    const promo: BannerItem[] = [];
    const desktopHero: BannerItem[] = [];
    const mobileHero: BannerItem[] = [];
    const wideContent: BannerItem[] = [];
    const largePortrait: BannerItem[] = [];
    const smallPortrait: BannerItem[] = [];

    for (const b of banners) {
      switch (b.banner_type) {
        case 'sidebar':
          sidebar.push(b);
          break;
        case 'hero':
          hero.push(b);
          break;
        case 'promo':
          promo.push(b);
          break;
        case 'desktop_hero':
          desktopHero.push(b);
          break;
        case 'mobile_hero':
          mobileHero.push(b);
          break;
        case 'wide_content':
          wideContent.push(b);
          break;
        case 'large_portrait':
          largePortrait.push(b);
          break;
        case 'small_portrait':
          smallPortrait.push(b);
          break;
      }
    }

    return { sidebar, hero, promo, desktopHero, mobileHero, wideContent, largePortrait, smallPortrait };
  }, [banners]);
}

// ─────────────────────────────────────────────
// HomeScreen
// ─────────────────────────────────────────────

export default function HomeScreen() {
  const { t } = useTranslation('home');
  const { data, isLoading, error } = useGetHomepageContentQuery();
  const scrollY = useSharedValue(0);

  const { sidebar, hero, promo, desktopHero, mobileHero, wideContent, largePortrait, smallPortrait } = useBannersByType(data?.banner);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // ── Loading state ──────────────────────────
  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <HomePageSkeleton />
      </View>
    );
  }

  // ── Error state ────────────────────────────
  if (error || !data) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-4">
        <Text className="text-xl font-bold text-foreground mb-2">
          {t('title')}
        </Text>
        <Text className="text-gray-500 mb-4">
          {t('error', { defaultValue: 'حدث خطأ أثناء تحميل البيانات' })}
        </Text>
      </View>
    );
  }

  // ── Main content ───────────────────────────
  return (
    <View className="flex-1 bg-background">
      <HomeHeader scrollY={scrollY} />

      <Animated.ScrollView
        className="flex-1 bg-background"
        entering={FadeIn.duration(800)}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* ── Hero Slider ─────────────────── */}
        {(desktopHero.length > 0 || mobileHero.length > 0) && (
          <HeroSlider banners={mobileHero.length > 0 ? mobileHero : desktopHero} />
        )}

        <View>
          {/* ── Featured Categories ────────── */}
          <View>
            <FeaturedCategories categories={data.featured_categories ?? []} />
          </View>

          {/* ── New Arrivals ──────────────── */}
          <NewArrivals products={data.new_arrivals ?? []} />

          {/* ── Hero Promo Banners ─────────── */}
          {hero.length > 0 && <HeroPromoBanners banners={hero} />}

          {/* ── Below-the-fold (lazy) ──────── */}
          <View className="py-5">
            <Suspense fallback={<SectionLoadingFallback />}>
              <TopSellingProducts products={data.top_selling_products ?? []} />
            </Suspense>
          </View>

          <Suspense fallback={<SectionLoadingFallback />}>
            <FeaturedBrands brands={data.featured_brands ?? []} />
          </Suspense>

          <Suspense fallback={<SectionLoadingFallback />}>
            <DealsOfTheDay products={data.deals_of_the_day ?? []} />
          </Suspense>

          {promo.length > 0 && (
            <Suspense fallback={<SectionLoadingFallback />}>
              <PromoGrid banners={promo} />
            </Suspense>
          )}

          <Suspense fallback={<SectionLoadingFallback />}>
            <Testimonials testimonials={data.testimonials ?? []} />
          </Suspense>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────
// Skeleton loading placeholder
// ─────────────────────────────────────────────

export function HomePageSkeleton() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-white"
    >
      <View className="space-y-2 pb-2">
        {/* Hero Skeleton */}
        <View className="w-full h-[400px] bg-slate-100 relative">
          <View className="absolute bottom-20 left-4 space-y-4">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-12 w-32 rounded-full" />
          </View>
        </View>

        <View className="px-1 space-y-4">
          {/* Trust Badges Skeleton */}
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-24 w-[48%] rounded-xl" />
            ))}
          </View>

          {/* Categories Skeleton */}
          <View className="space-y-6">
            <View className="flex-row justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-20" />
            </View>
            <View className="flex-row flex-wrap justify-between gap-y-6">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} style={{ aspectRatio: 1 }} className="w-[30%] rounded-full" />
              ))}
            </View>
          </View>

          {/* Deals Skeleton */}
          <Skeleton className="h-96 w-full rounded-3xl" />

          {/* Products Grid Skeleton */}
          <View className="flex-row flex-wrap justify-between gap-y-6">
            {Array.from({ length: 4 }, (_, i) => (
              <View key={i} className="w-[48%] space-y-3">
                <Skeleton style={{ aspectRatio: 4 / 3 }} className="rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
