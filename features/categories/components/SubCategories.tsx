import { View, Text, Image, Pressable, FlatList, I18nManager } from 'react-native';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

interface SubCategoriesProps {
  categories: { id: number | string; name: string; image?: string | null }[];
}

export const SubCategories = ({ categories }: SubCategoriesProps) => {
  const { t } = useTranslation('categories');
  const router = useRouter();

  if (!categories || categories.length === 0) return null;

  // Group categories into chunks of 2 for the 2-row layout
  const chunkedCategories = [];
  for (let i = 0; i < categories.length; i += 2) {
    chunkedCategories.push(categories.slice(i, i + 2));
  }

  return (
    <View className="mb-6">
      <Text style={{ fontFamily: 'Tajawal-Bold', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="mb-4 text-lg text-slate-800 px-4">
        {t('SubCategories.title', { defaultValue: 'الأقسام الفرعية' })}
      </Text>
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
                  router.push(`/categories/${category.id}` as any);
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
                    className="items-center justify-center bg-slate-100"
                    style={{ width: 70, height: 70, borderRadius: 35 }}>
                    <Text style={{ fontFamily: 'Tajawal-Bold' }} className="text-[10px] text-slate-400 text-center">
                        {category.name[0]}
                    </Text>
                  </View>
                )}
                
                <View style={{ height: 36, marginTop: 8, justifyContent: 'center', width: '100%' }}>
                  <Text
                    style={{ 
                      fontFamily: 'Tajawal-Bold', 
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
