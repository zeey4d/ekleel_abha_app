import React from 'react';
import { View, Text, FlatList, SafeAreaView, Image, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetBrandsByLetterQuery } from '@/store/features/brands/brandsSlice';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, FilterX, Tags } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '@/lib/image-utils';

export default function BrandsByLetterPage() {
  const { letter } = useLocalSearchParams();
  const params = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation('brands');
  
  const currentLetter = Array.isArray(letter) ? letter[0].toUpperCase() : letter?.toString().toUpperCase() ?? 'A';
  const page = Number(params.page) || 1;

  // Fetch Brands by Letter
  const { data: brandsData, isLoading, error } = useGetBrandsByLetterQuery({
    letter: currentLetter,
    page,
    limit: 24,
    sort: 'name'
  });

  const brands = brandsData?.ids.map(id => brandsData.entities[id]) || [];
  const pagination = brandsData?.meta;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <Pressable 
          onPress={() => router.back()}
          className="mr-3 p-2 -ml-2"
        >
          <ArrowLeft size={24} color="#020617" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-bold text-foreground">
            Brands - {currentLetter}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {pagination?.total || 0} brands found
          </Text>
        </View>
      </View>

      <FlatList
        data={brands}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{ paddingHorizontal: 16, gap: 12 }}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/(tabs)/(shop)/brands/${item.id}` as any)}
            className="flex-1 mb-4"
            style={{ maxWidth: '31%' }}
          >
            <View className="aspect-square bg-white rounded-xl border border-border items-center justify-center p-4">
              {item.image ? (
                <Image
                  source={{ uri: getImageUrl(item.image) }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                />
              ) : (
                <Tags size={32} color="#94a3b8" />
              )}
            </View>
            <Text 
              className="text-sm font-medium text-foreground text-center mt-2"
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </Pressable>
        )}

        ListEmptyComponent={
          !isLoading ? (
            <View className="flex-1 items-center justify-center py-20 px-4">
              <View className="bg-white p-4 rounded-full mb-4 shadow-sm">
                <FilterX size={32} color="#cbd5e1" />
              </View>
              <Text className="text-lg font-semibold text-foreground">
                {t('Letter.noResults') || 'No brands found'}
              </Text>
              <Text className="text-muted-foreground text-center mt-1 mb-6 max-w-md">
                We couldn't find any brands starting with the letter <Text className="font-bold">{currentLetter}</Text>. 
                Try checking another letter.
              </Text>
              <Button onPress={() => router.push('/(tabs)/(shop)/brands' as any)}>
                <Text>View All Brands</Text>
              </Button>
            </View>
          ) : null
        }

        ListFooterComponent={
          isLoading ? (
            <View className="py-6">
              <BrandsByLetterSkeleton />
            </View>
          ) : (
            <View className="h-10" />
          )
        }
      />
    </SafeAreaView>
  );
}

// Skeleton Component
function BrandsByLetterSkeleton() {
  return (
    <View className="flex-row flex-wrap px-4 gap-3">
      {[...Array(12)].map((_, i) => (
        <View key={i} className="w-[31%]">
          <Skeleton className="aspect-square rounded-xl mb-2" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </View>
      ))}
    </View>
  );
}
