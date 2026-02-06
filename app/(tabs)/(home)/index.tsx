import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { HomeIcon } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
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
import HomeHeader from '@/components/layout/header/HomeHeader';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import LanguageSwitcher from '@/components/Language/LanguageSwitcher';



export default function HomeScreen() {
  const { t } = useTranslation('home');
  const { data, isLoading, error } = useGetHomepageContentQuery();
  const router = useRouter();

  // const [isModalVisible, setIsModalVisible] = useState(false);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-4">
        <Text className="text-xl font-bold text-foreground mb-2">{t('title')}</Text>
        <Text className="text-gray-500 mb-4">حدث خطأ أثناء تحميل البيانات</Text>
      </View>
    );
  }

  return (
          <View className="flex-1 bg-background">

      {/* Language Toggle Button */}

      <HomeHeader />

      <Animated.ScrollView className="flex-1 bg-background" entering={FadeIn.duration(800)}>
        <HeroSlider banners={data.banner.slice(-5)} />

        <View className="px-3">
   <View className="py-5">



          <FeaturedCategories categories={data?.featured_categories || []} /></View>

          <NewArrivals products={data?.new_arrivals || []} />

          

          {/* Promo Grid 1 */}
          <PromoGrid banners={data.banner.slice(-10, -5)} />


              <View className="py-5">
          <TopSellingProducts products={data?.top_selling_products || []} />

    </View>

          <FeaturedBrands brands={data?.featured_brands || []} />

          <DealsOfTheDay products={data?.deals_of_the_day || []} />

          <PromoGrid banners={data.banner.slice(-15, -10)} />

          <Testimonials testimonials={data?.testimonials || []} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}
