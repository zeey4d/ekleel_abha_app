import { View, Text, Image, FlatList, Pressable, I18nManager } from 'react-native';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

interface Category {
  id: number;
  name: string;
  image: string | null;
}

export const FeaturedCategories = ({ categories }: { categories: Category[] }) => {
  const { t, i18n } = useTranslation('home');
  const isArabic = i18n.language === 'ar';
  const router = useRouter();

  if (!categories || categories.length === 0) return null;

  // Group categories into chunks of 2 for the 2-row layout
  const chunkedCategories = [];
  for (let i = 0; i < categories.length; i += 2) {
    chunkedCategories.push(categories.slice(i, i + 2));
  }

  return (
    <View className="p-0 ">
      {/* <View
        className="mb-4 flex-row items-center justify-between"
        style={
          isArabic && !I18nManager.isRTL ? { flexDirection: 'row-reverse' } : undefined
        }>
        <Text className="text-lg font-bold text-foreground">{t('FeaturedCategories.title')}</Text>
        <Pressable
          onPress={() => router.push('/(tabs)/(home)/(context)/categories' as any)}
          className="flex-row items-center gap-2"
          style={isArabic && !I18nManager.isRTL ? { flexDirection: 'row-reverse' } : undefined}
        >
          <Text className="font-medium text-primary">{t('FeaturedCategories.viewAll')}</Text>
          {isArabic ? (
            <ArrowLeft size={18} color="#000000ff" />
          ) : (
            <ArrowRight size={18} color="#000000ff" />
          )}
        </Pressable>
      </View> */}

      <FlatList
        data={chunkedCategories}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginEnd: 16 }}>
            {item.map((category, index) => (
              <Pressable
                key={category.id}
                style={{ width: 76, alignItems: 'center', marginBottom: index === 0 ? 16 : 0 }}
                onPress={() => {
                  router.push(`/(tabs)/(home)/(context)/categories/clp/${category.id}` as any);
                }}
              >
                {category.image ? (
                  <Image
                    source={{ uri: getImageUrl(category.image) }}
                    style={{ width: 70, height: 70, borderRadius: 35 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    className="items-center justify-center bg-slate-200"
                    style={{ width: 70, height: 70, borderRadius: 35 }}>
                    <Text className="text-[10px] text-slate-400 text-center">{t('FeaturedCategories.noImage')}</Text>
                  </View>
                )}
                <Text
                  className="mt-2 text-center text-xs font-medium text-foreground"
                  style={{ lineHeight: 16 }}
                  numberOfLines={2}>
                  {category.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      />
    </View>
  );
};
