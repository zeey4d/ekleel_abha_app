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
import HomeHeader from '@/components/layout/HomeHeader';

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
      <View className="flex-1 gap-6 ">
        
        {/* Language Toggle Button */}
  
        {/* <HomeHeader /> */}


        <HeroSlider banners={data.banner.slice(-5)} />

        <View className="px-3">
                <View className="w-full items-end">
          <LanguageToggle />
        </View>

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
      </View>
    </ScrollView>
  );
}
