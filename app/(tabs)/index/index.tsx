import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { HomeIcon } from 'lucide-react-native';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/LanguageToggle';
import '@/i18n/config';
import { NewArrivals } from '@/components/home/NewArrivals';

import { useGetHomepageContentQuery } from '@/store/features/cms/cmsSlice';
import { HeroSlider } from '@/components/home/HeroSlider';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { PromoGrid } from '@/components/home/PromoGrid';
import { TopSellingProducts } from '@/components/home/TopSellingProducts';
import { FeaturedBrands } from '@/components/home/FeaturedBrands';
import { DealsOfTheDay } from '@/components/home/DealsOfTheDay';
import { Testimonials } from '@/components/home/Testimonials';
import { Search } from 'lucide-react-native';

export default function HomeScreen() {
  const { t } = useTranslation('home');
  const { data, isLoading, error } = useGetHomepageContentQuery();

  if (error || !data) {
    return (
      <>
        <Text className="text-3xl font-bold text-foreground">{t('title')}</Text>
      </>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 gap-6 p-6">
        
        {/* Language Toggle Button */}
        <View className="w-full items-end">
          <LanguageToggle />
        </View>
              <View className="px-4 py-3 border-b border-border bg-background z-10">
                <View className="flex-row items-center bg-secondary/50 rounded-lg px-3 py-2">
                  <Search size={20} className="text-muted-foreground mr-2" />
                  <Text className="text-muted-foreground">Search ...</Text>
                </View>
              </View>

{/* <HeroSlider banners={data.banner.slice(0, 5)} /> */}
        <HeroSlider banners={data.banner.slice(-5)} />


        <FeaturedCategories categories={data?.featured_categories || []} />

        <NewArrivals products={data?.new_arrivals || []} />

        {/* Promo Grid 1 */}
        <PromoGrid banners={data.banner.slice(-10, -5)} />

        <TopSellingProducts products={data?.top_selling_products || []} />

        <FeaturedBrands brands={data?.featured_brands || []} />

        <DealsOfTheDay products={data?.deals_of_the_day || []} />

        <PromoGrid banners={data.banner.slice(-15, -10)} />

        <Testimonials testimonials={data?.testimonials || []} />
      </View>
    </ScrollView>
  );
}

// <View className="w-full gap-4">
//   {/* <View className="rounded-xl bg-card p-6 shadow-sm">
//     <Text className="mb-2 text-xl font-semibold text-foreground">{t('welcome')}</Text>
//     <Text className="leading-6 text-muted-foreground">{t('welcomeMessage')}</Text>
//   </View> */}

//   {/* <View className="rounded-xl bg-card p-6 shadow-sm">
//     <Text className="mb-2 text-lg font-semibold text-foreground">{t('features')}</Text>
//     <View className="mt-2 gap-3">
//       <Text className="text-muted-foreground">{t('feature1')}</Text>
//       <Text className="text-muted-foreground">{t('feature2')}</Text>
//       <Text className="text-muted-foreground">{t('feature3')}</Text>
//       <Text className="text-muted-foreground">{t('feature4')}</Text>
//       <Text className="text-muted-foreground">{t('feature5')}</Text>
//     </View>
//   </View> */}

//   {/* New Arrivals Section */}
//   {/* {isLoading ? (
//     <View className="items-center py-8">
//       <ActivityIndicator size="large" />
//     </View>
//   ) : (
//     <NewArrivals products={data?.new_arrivals || []} />
//   )} */}
// </View>
