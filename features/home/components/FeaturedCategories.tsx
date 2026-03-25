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

  return (
    <View className="p-0 ">
      <View
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
      </View>

      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable 
            className="w-20 items-center"
            style={{ marginEnd: 16 }}
            onPress={() => {
              router.push(`/(tabs)/(home)/(context)/categories/${item.id}` as any);
            }}
          >
            {item.image ? (
              <Image
                source={{ uri: getImageUrl(item.image) }}
                style={{ width: 80, height: 80, borderRadius: 40 }}
                resizeMode="cover"
              />
            ) : (
              <View
                className="items-center justify-center bg-slate-200"
                style={{ width: 80, height: 80, borderRadius: 40 }}>
                <Text className="text-xs text-slate-400">{t('FeaturedCategories.noImage')}</Text>
              </View>
            )}
            <Text
              className="mt-2 text-center text-sm font-medium text-foreground"
              numberOfLines={1}>
              {item.name}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
};
