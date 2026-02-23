import { Text } from '@/components/ui/text';
import Animated, {
  FadeIn,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';
import { NewArrivals } from '@/components/home/NewArrivals';

import { useGetHomepageContentQuery } from '@/store/features/cms/cmsSlice';
import { HeroSlider } from '@/components/home/HeroSlider';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { PromoGrid } from '@/components/home/PromoGrid';
import { TopSellingProducts } from '@/components/home/TopSellingProducts';
import { FeaturedBrands } from '@/components/brands/FeaturedBrands';
import { DealsOfTheDay } from '@/components/home/DealsOfTheDay';
import { Testimonials } from '@/components/home/Testimonials';
import HomeHeader from '@/components/layout/header/HomeHeader';
import { useRouter } from 'expo-router';
import { VerticalPromoGrid } from '@/components/home/VerticalPromoGrid';
import { Skeleton } from '@/components/ui/skeleton';


export default function HomeScreen() {
  const { t } = useTranslation('home');
  const { data, isLoading, error } = useGetHomepageContentQuery();
  const router = useRouter();
  const scrollY = useSharedValue(0);
    const sidebarBanners = data?.banner?.filter((b) => b.banner_type === 'sidebar') || [];
      const heroBanners = data?.banner?.filter((b) => b.banner_type === 'hero') || [];
        const promoBanners = data?.banner?.filter((b) => b.banner_type === 'promo') || [];




  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <HomePageSkeleton />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-4">
        <Text className="text-xl font-bold text-foreground mb-2">
          {t('title')}
        </Text>
        <Text className="text-gray-500 mb-4">
          حدث خطأ أثناء تحميل البيانات
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Language Toggle Button */}

      <HomeHeader scrollY={scrollY} />

      <Animated.ScrollView
        className="flex-1 bg-background"
        entering={FadeIn.duration(800)}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <HeroSlider banners={heroBanners} />

        <View className="px-3">
          <View className="py-5">
            <FeaturedCategories categories={data?.featured_categories || []} />
          </View>

          <NewArrivals products={data?.new_arrivals || []} />

          {/* Promo Grid 1 */}
          {/* <PromoGrid banners={data.banner.slice(-10, -5)} /> */}

          {sidebarBanners.length > 0 && (
            <VerticalPromoGrid banners={sidebarBanners} />
          )}

          <View className="py-5">
            <TopSellingProducts products={data?.top_selling_products || []} />
          </View>

          <FeaturedBrands brands={data?.featured_brands || []} />

          <DealsOfTheDay products={data?.deals_of_the_day || []} />

          {promoBanners.length > 0 && (
            <PromoGrid banners={promoBanners} />
          )}
          <Testimonials testimonials={data?.testimonials || []} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}


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
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-24 w-[48%] rounded-xl"
              />
            ))}
          </View>

          {/* Categories Skeleton */}
          <View className="space-y-6">
            <View className="flex-row justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-20" />
            </View>

            <View className="flex-row flex-wrap justify-between gap-y-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-[30%] aspect-square rounded-full"
                />
              ))}
            </View>
          </View>

          {/* Deals Skeleton */}
          <Skeleton className="h-96 w-full rounded-3xl" />

          {/* Products Grid Skeleton */}
          <View className="flex-row flex-wrap justify-between gap-y-6">
            {[...Array(4)].map((_, i) => (
              <View key={i} className="w-[48%] space-y-3">
                <Skeleton className="aspect-[4/3] rounded-xl" />
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
