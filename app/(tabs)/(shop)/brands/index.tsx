import React, { useState } from 'react';
import { View, Text, FlatList, SafeAreaView, Image, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetBrandsQuery, useGetFeaturedBrandsQuery } from '@/store/features/brands/brandsSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { Tags, ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '@/lib/image-utils';

export default function BrandsPage() {
  const { t } = useTranslation('brands');
  const params = useLocalSearchParams();
  const router = useRouter();
  const page = Number(params.page) || 1;

  // Fetch Featured Brands
  const { data: featuredBrands, isLoading: isFeaturedLoading } = useGetFeaturedBrandsQuery({
    limit: 6,
  });

  // Fetch All Brands (Paginated)
  const {
    data: brandsData,
    isLoading: isBrandsLoading,
    error,
  } = useGetBrandsQuery({
    page,
    limit: 24,
    sort: 'name',
  });

  const brands = brandsData?.ids.map((id) => brandsData.entities[id]) || [];
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
        <Text className="text-xl font-bold text-foreground flex-1">
          {t('Header.title') || 'Brands'}
        </Text>
      </View>

      <FlatList
        data={brands}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{ paddingHorizontal: 16, gap: 12 }}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        
        ListHeaderComponent={
          <View className="px-4 mb-6">
            {/* Featured Brands Section */}
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
                      onPress={() => router.push(`/(tabs)/(shop)/brands/${item.id}` as any)}
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
                      <Text 
                        className="text-sm font-medium text-foreground text-center mt-2"
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                    </Pressable>
                  )}
                />
              </View>
            )}

            {/* Alphabet Filter */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-foreground mb-3">
                {t('browseByLetter')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => (
                    <Pressable
                      key={letter}
                      onPress={() => router.push(`/(tabs)/(shop)/brands/letter/${letter}` as any)}
                      className="w-10 h-10 bg-slate-100 rounded-lg items-center justify-center"
                    >
                      <Text className="text-sm font-semibold text-slate-700">
                        {letter}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* All Brands Title */}
            <Text className="text-xl font-bold text-foreground mb-4">
              {t('AllBrands.title') || 'All Brands'}
            </Text>
          </View>
        }

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
          !isBrandsLoading ? (
            <View className="py-20 items-center">
              <Text className="text-muted-foreground">
                {t('AllBrands.noBrands') || 'No brands found'}
              </Text>
            </View>
          ) : null
        }

        ListFooterComponent={
          isBrandsLoading ? (
            <View className="py-6">
              <BrandGridSkeleton />
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
function BrandGridSkeleton() {
  return (
    <View className="flex-row flex-wrap px-4 gap-3">
      {[...Array(9)].map((_, i) => (
        <View key={i} className="w-[31%]">
          <Skeleton className="aspect-square rounded-xl mb-2" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </View>
      ))}
    </View>
  );
}
