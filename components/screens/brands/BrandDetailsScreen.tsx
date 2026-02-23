import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';

// State & Hooks
import { useGetBrandByIdQuery } from '@/store/features/brands/brandsSlice';
import { useSearchProductsQuery } from '@/store/features/search/searchSlice';
import { useLocalizedEntityName } from '@/hooks/useLocalizedEntityName';
import { getImageUrl } from '@/lib/image-utils';

// Components
import { ProductCard } from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import ProductFilterBar from '@/components/products/ProductFilterBar';

export default function BrandDetailsScreen() {
    const { id, locale = 'ar' } = useLocalSearchParams<{ id: string, locale: string }>();
    const router = useRouter();
    const { t } = useTranslation('brand_details');
    const flatListRef = useRef<FlatList>(null);
    
    const [currentSort, setCurrentSort] = useState('date_added_desc');
    const [page, setPage] = useState(1);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    
    const { name: brandName } = useLocalizedEntityName(
        Number(id),
        locale,
        useGetBrandByIdQuery
    );
    const { data: brand, isLoading: isBrandLoading } = useGetBrandByIdQuery(Number(id));

    const params = useLocalSearchParams();

    // Extract filter params
    const categories = Array.isArray(params.categories) ? params.categories : (params.categories ? [params.categories] : []);
    const price_range = Array.isArray(params.price_range) ? params.price_range : (params.price_range ? [params.price_range] : []);
    const on_sale = params.on_sale as string | undefined;

    const { data: searchData, isLoading: isProdLoading, isFetching } = useSearchProductsQuery({
        page,
        sort_by: currentSort as any,
        brand: brand ? [brand.name] : [],
        per_page: 12,
        categories,
        price_range,
        on_sale: on_sale || null,
    }, {
        skip: !brand
    });

    const productsFromQuery = useMemo(() => {
        if (!searchData?.ids) return [];
        return searchData.ids.map((id) => searchData.entities[id]).filter(Boolean);
    }, [searchData]);

    const pagination = searchData?.pagination;
    const facets = searchData?.facets ? { ...searchData.facets, brand: undefined } : undefined;

    // Reset on filter/sort change
    useEffect(() => {
        setPage(1);
        setAllProducts([]);
    }, [currentSort, JSON.stringify(categories), JSON.stringify(price_range), on_sale]);

    // Accumulate products
    useEffect(() => {
        if (productsFromQuery.length > 0) {
            if (page === 1) {
                setAllProducts(productsFromQuery);
            } else {
                setAllProducts(prev => {
                    const newItems = productsFromQuery.filter(
                        newItem => !prev.some(prevItem => prevItem.id === newItem.id)
                    );
                    return [...prev, ...newItems];
                });
            }
        } else if (page === 1 && !isFetching) {
            setAllProducts([]);
        }
    }, [productsFromQuery, page]);

    const handleSortChange = useCallback((sortValue: string) => {
        setCurrentSort(sortValue);
    }, []);

    const handleApplyFilters = useCallback((filters: Record<string, string[]>) => {
        router.setParams(filters);
    }, [router]);

    const loadMore = () => {
        if (!isFetching && pagination && page < pagination.total_pages) {
            setPage(prev => prev + 1);
        }
    };

    if (isBrandLoading && !brand) return <BrandPageSkeleton />;

    if (!brand) {
         return (
             <View className="flex-1 bg-background items-center justify-center">
                 <Stack.Screen options={{ headerShown: true, title: t('Error.notFoundTitle', 'Not Found') }} />
                 <Text className="text-2xl font-bold text-foreground">
                     {t('Error.notFoundTitle') || 'Brand not found'}
                 </Text>
             </View>
         );
    }

    return (
        <View className="flex-1 bg-background">
            <Stack.Screen 
                options={{ 
                    title: brandName,
                    headerShown: true,
                    headerBackTitle: "", 
                    headerTintColor: '#000',
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} >
                            <ChevronLeft color="#000000ff" size={28} />
                        </Pressable>
                    ),
                }} 
            />
            
            <FlatList
                ref={flatListRef}
                data={allProducts}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                numColumns={2}
                columnWrapperStyle={{ paddingHorizontal: 16, justifyContent: 'space-between' }}
                contentContainerStyle={{ paddingVertical: 0 }}
                showsVerticalScrollIndicator={false}

                onEndReached={loadMore}
                onEndReachedThreshold={0.5}

                ListHeaderComponent={
                    <View>
                        {/* Filter/Sort Bar */}
                        <ProductFilterBar
                            facets={facets}
                            activeFilters={params as Record<string, string[]>}
                            currentSort={currentSort}
                            onSortChange={handleSortChange}
                            onApplyFilters={handleApplyFilters}
                            totalResults={pagination?.total}
                        />

                        {/* Brand Header Info */}
                        <View className="px-4 mt-4 mb-6">
                            <View className="bg-white rounded-2xl border border-border p-6 mb-4">
                                <View className="flex-row items-center">
                                    {brand.image ? (
                                        <Image
                                            source={{ uri: getImageUrl(brand.image) }}
                                            style={{ width: 80, height: 80 }}
                                            resizeMode="contain"
                                            className="mr-4"
                                        />
                                    ) : (
                                        <View className="w-20 h-20 bg-slate-100 rounded-xl items-center justify-center mr-4">
                                            <Text className="text-2xl font-bold text-slate-400">{brand.name.charAt(0)}</Text>
                                        </View>
                                    )}
                                    <View className="flex-1">
                                        <Text className="text-2xl font-bold text-foreground mb-1">{brand.name}</Text>
                                        {brand.description && (
                                            <Text className="text-sm text-muted-foreground" numberOfLines={2}>
                                                {brand.description}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                }

                renderItem={({ item }) => (
                    <View style={{ width: '48%', marginBottom: 16 }}>
                        <ProductCard product={item} />
                    </View>
                )}

                ListEmptyComponent={
                    !isFetching ? (
                        <View className="py-20 items-center">
                            <Text className="text-lg font-semibold text-foreground">No products found</Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={() => (
                    <View className="py-6 items-center h-20 justify-center">
                        {isFetching && page > 1 ? (
                            <ActivityIndicator size="small" />
                        ) : pagination && page >= pagination.total_pages && allProducts.length > 0 ? (
                            <Text className="text-slate-400 text-xs">لا توجد نتائج أخرى</Text>
                        ) : null}
                    </View>
                )}
            />
        </View>
    );
}

function BrandPageSkeleton() {
  return (
    <View className="flex-1 bg-background px-4 pt-6">
      <Stack.Screen options={{ headerShown: true, title: 'Loading...' }} />
      <Skeleton className="h-32 w-full rounded-2xl mb-6" />
      <View className="flex-row justify-between mb-6">
        <Skeleton className="h-10 w-[45%] rounded-full" />
        <Skeleton className="h-10 w-[45%] rounded-full" />
      </View>
      <View className="flex-row flex-wrap justify-between">
        {[1, 2, 3, 4].map(i => (
          <View key={i} className="w-[48%] mb-4">
            <Skeleton className="aspect-square w-full rounded-2xl mb-2" />
            <Skeleton className="h-4 w-3/4 mb-1" />
          </View>
        ))}
      </View>
    </View>
  );
}
