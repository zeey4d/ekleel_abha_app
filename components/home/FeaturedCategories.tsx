import { View, Text, Image, FlatList, Pressable } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

interface Category {
  id: number;
  name: string;
  image: string | null;
}

export const FeaturedCategories = ({ categories }: { categories: Category[] }) => {
  const { t } = useTranslation('home');
  const router = useRouter();

  if (!categories || categories.length === 0) return null;

  return (
    <View className="p-0 ">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-foreground">{t('FeaturedCategories.title')}</Text>
        <Pressable
          onPress={() => router.push('/(tabs)/(home)/(context)/categories' as any)}
          className="flex-row items-center">
          <Text className="mr-2 font-medium text-primary">{t('FeaturedCategories.viewAll')}</Text>
          <ArrowRight size={18} color="#000000ff" />
        </Pressable>
      </View>

      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable 
            className="mr-4 w-20 items-center"
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
