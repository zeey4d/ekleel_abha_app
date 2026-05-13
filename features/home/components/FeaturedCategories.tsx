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
    <View className="py-2">
      {/* <View
        className="px-4 mb-4 flex-row items-center justify-between"
        style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}
      >
        <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-xl text-slate-800">
          {t('FeaturedCategories.title', { defaultValue: 'التصنيفات' })}
        </Text>
        <Pressable
          onPress={() => router.push('/(tabs)/(home)/(context)/categories' as any)}
          className="flex-row items-center gap-1"
          style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}
        >
          <Text style={{ fontFamily: 'Tajawal_700Bold', color: '#0d9488' }} className="text-sm">
            {t('FeaturedCategories.viewAll', { defaultValue: 'عرض الكل' })}
          </Text>
          {I18nManager.isRTL ? (
            <ArrowLeft size={16} color="#0d9488" />
          ) : (
            <ArrowRight size={16} color="#0d9488" />
          )}
        </Pressable>
      </View> */}

      <FlatList
        data={chunkedCategories}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
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
                <View style={{ height: 36, marginTop: 8, justifyContent: 'center', width: '100%' }}>
                  <Text
                    style={{ 
                      fontFamily: 'Tajawal_700Bold', 
                      lineHeight: 14, 
                      fontSize: 10,
                      textAlign: 'center' 
                    }}
                    className="text-slate-800"
                    numberOfLines={2}>
                    {category.name}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      />
    </View>
  );
};
