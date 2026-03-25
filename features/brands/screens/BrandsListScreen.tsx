import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, Image, Pressable, ActivityIndicator, Text } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Tags } from 'lucide-react-native';

// State & Hooks
import { useGetBrandsQuery, useGetFeaturedBrandsQuery, useGetBrandsByLetterQuery } from '@/store/features/brands/brandsSlice';
import { getImageUrl } from '@/lib/image-utils';

// Components
import { Skeleton } from '@/components/ui/skeleton';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const FIRST_ROW = ALPHABET.slice(0, 13); // A-M
const SECOND_ROW = ALPHABET.slice(13); // N-Z

export default function BrandsScreen() {
  const { t } = useTranslation('brands');
  const router = useRouter();
  const { page: initialPage } = useLocalSearchParams<{ page?: string }>();
  
  // State
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [page, setPage] = useState(Number(initialPage) || 1);

  // 1. Fetch Featured
  const { data: featuredBrands, isLoading: isFeaturedLoading } = useGetFeaturedBrandsQuery({
    limit: 6,
  });

  // 2. Fetch All Brands (Paginated)
  const {
    data: brandsData,
    isLoading: isBrandsLoading,
    isFetching: isBrandsFetching,
    error: brandsError,
  } = useGetBrandsQuery(
    { page, limit: 24, sort: 'name' }, 
    { skip: !!selectedLetter }
  );

  // 3. Fetch By Letter
  const {
    data: letterBrandsData,
    isLoading: isLetterLoading,
    isFetching: isLetterFetching,
    error: letterError,
  } = useGetBrandsByLetterQuery(
    { letter: selectedLetter || '', page: 1, limit: 50, sort: 'name' },
    { skip: !selectedLetter }
  );

  // Logic
  const brands = selectedLetter
    ? letterBrandsData?.ids.map((id) => letterBrandsData.entities[id]) || []
    : brandsData?.ids.map((id) => brandsData.entities[id]) || [];

  const isLoading = selectedLetter ? isLetterLoading : (isBrandsLoading && page === 1);
  const isFetching = selectedLetter ? isLetterFetching : isBrandsFetching;
  const hasMore = !selectedLetter && brandsData?.meta && brandsData.meta.current_page < brandsData.meta.total_pages;

  const loadMore = useCallback(() => {
    if (!isFetching && hasMore && !selectedLetter) {
      setPage((p) => p + 1);
    }
  }, [isFetching, hasMore, selectedLetter]);

  const toggleLetter = useCallback((letter: string) => {
    if (selectedLetter === letter) {
      setSelectedLetter(null);
      setPage(1);
    } else {
      setSelectedLetter(letter);
    }
  }, [selectedLetter]);

  const renderLetterButton = useCallback((letter: string) => (
    <Pressable
      key={letter}
      onPress={() => toggleLetter(letter)}
      className={`w-10 h-10 rounded-lg items-center justify-center ${
        selectedLetter === letter ? 'bg-black' : 'bg-slate-100'
      }`}
    >
      <Text className={`text-sm font-semibold ${
        selectedLetter === letter ? 'text-white' : 'text-slate-700'
      }`}>
        {letter}
      </Text>
    </Pressable>
  ), [selectedLetter, toggleLetter]);

  const renderBrandItem = useCallback(({ item }: { item: any }) => (
    <Pressable
      onPress={() => router.push(`brands/${item?.id}` as any)}
      className="flex-1 mb-4"
      style={{ maxWidth: '31%' }}
    >
      <View className="aspect-square bg-white rounded-xl border border-border items-center justify-center p-4">
        {item?.image ? (
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
        {item?.name}
      </Text>
    </Pressable>
  ), [router]);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('Header.title') || 'Brands',
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: false,
          headerLeft: () => (
             <Pressable onPress={() => router.back()} >
                 <ChevronLeft color="#000000ff" size={28} />
             </Pressable>
         ),
        }}
      />

      <FlatList
        data={brands}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        numColumns={3}
        columnWrapperStyle={{ paddingHorizontal: 16, gap: 12 }}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        
        ListHeaderComponent={
          <View className="px-4 mb-6">
            {/* Featured Brands */}
            {!isFeaturedLoading && featuredBrands && featuredBrands.length > 0 && (
              <View className="mb-8">
                <View className="flex-row items-center mb-4">
                  <View className="h-6 w-1 rounded-full bg-primary mr-2" />
                  <Text className="text-xl font-bold text-foreground">
                    {t('Featured.title') || 'Featured Brands'}
                  </Text>
                </View>
                <FlatList
                  data={featuredBrands}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => router.push(`brands/${item.id}` as any)}
                      className="mr-4 w-24"
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
                      <Text className="text-sm font-medium text-foreground text-center mt-2" numberOfLines={1}>
                        {item.name}
                      </Text>
                    </Pressable>
                  )}
                />
              </View>
            )}

            {/* Error */}
            {(brandsError || letterError) && (
               <View className="mb-4 p-3 bg-red-100 rounded-lg">
                 <Text className="text-red-600">
                   {t('errorLoadingBrands') || 'Error loading brands. Please try again.'}
                 </Text>
               </View>
            )}

            {/* Alphabet Filter */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-foreground mb-3">
                {t('browseByLetter')}
              </Text>
              <View className="flex-row flex-wrap justify-center gap-2 mb-2">
                {FIRST_ROW.map(renderLetterButton)}
              </View>
              <View className="flex-row flex-wrap justify-center gap-2">
                {SECOND_ROW.map(renderLetterButton)}
              </View>
            </View>

            {/* Title */}
            <Text className="text-xl font-bold text-foreground mb-4">
              {selectedLetter 
                ? `${t('AllBrands.title') || 'All Brands'} - ${selectedLetter}` 
                : t('AllBrands.title') || 'All Brands'}
            </Text>
          </View>
        }

        renderItem={renderBrandItem}

        ListEmptyComponent={
          !isLoading ? (
            <View className="py-20 items-center">
              <Text className="text-muted-foreground">
                {t('AllBrands.noBrands') || 'No brands found'}
              </Text>
            </View>
          ) : null
        }

        ListFooterComponent={
          isFetching && !isLoading ? (
            <View className="py-6 items-center">
              <ActivityIndicator size="small" color="#2c7c7b" />
            </View>
          ) : (
            <View className="h-10" />
          )
        }
      />
    </View>
  );
}
