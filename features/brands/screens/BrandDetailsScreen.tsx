import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, Pressable, Dimensions, I18nManager } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';

// State & Hooks
import { useGetBrandByIdQuery } from '@/store/features/brands/brandsSlice';
import { useSearchProductsQuery } from '@/store/features/search/searchSlice';
import { useLocalizedEntityName } from '@/hooks/useLocalizedEntityName';
import { getImageUrl } from '@/lib/image-utils';

// Components
import { ProductCard } from '@/features/products/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import ProductFilterBar from '@/features/products/components/ProductFilterBar';

export default function BrandDetailsScreen() {
    const { id, locale = 'ar' } = useLocalSearchParams<{ id: string, locale: string }>();
    const router = useRouter();
    const { t } = useTranslation('brand_details');
    const flatListRef = useRef<FlatList>(null);
    
    const TEAL = "#0d9488";
    const [currentSort, setCurrentSort] = useState('date_added_desc');
    const [page, setPage] = useState(1);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const isRTL = I18nManager.isRTL;
    
    const { name: brandName } = useLocalizedEntityName(
        Number(id),
        locale,
        useGetBrandByIdQuery as any
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
        <View className="flex-1 bg-[#f8fafc]">
            <Stack.Screen 
                options={{ 
                    title: brandName,
                    headerShown: true,
                    headerTitleStyle: { fontFamily: 'Tajawal_700Bold', fontSize: 18 },
                    headerBackTitle: "", 
                    headerTintColor: '#1e293b',
                    headerStyle: { backgroundColor: '#fff' },
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} className="ml-2 p-2">
                            <ChevronLeft color="#1e293b" size={24} />
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
                        <View className="px-4 mt-2 mb-6">
                            <View 
                                className="bg-white rounded-[32px] border border-slate-50 p-6 shadow-sm"
                                style={{
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 12,
                                    elevation: 2
                                }}
                            >
                                <View className="flex-row items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    {brand.image ? (
                                        <View className="w-20 h-20 bg-slate-50 rounded-2xl items-center justify-center p-2 border border-slate-50">
                                            <Image
                                                source={{ uri: getImageUrl(brand.image) }}
                                                style={{ width: '100%', height: '100%' }}
                                                resizeMode="contain"
                                            />
                                        </View>
                                    ) : (
                                        <View className="w-20 h-20 bg-teal-50 rounded-2xl items-center justify-center border border-teal-100">
                                            <Text style={{ fontFamily: 'Tajawal_800ExtraBold', color: TEAL }} className="text-3xl">{brand.name.charAt(0)}</Text>
                                        </View>
                                    )}
                                    <View 
                                        className="flex-1 mx-4"
                                        style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}
                                    >
                                        <Text style={{ fontFamily: 'Tajawal_800ExtraBold' }} className="text-2xl text-slate-900 mb-1">{brand.name}</Text>
                                        {(brand as any).description ? (
                                            <Text style={{ fontFamily: 'Tajawal_500Medium', textAlign: isRTL ? 'right' : 'left' }} className="text-sm text-slate-400" numberOfLines={2}>
                                                {(brand as any).description}
                                            </Text>
                                        ) : (
                                            <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-teal-600 uppercase tracking-widest text-[10px]">
                                                {t('Brand.officialStore', 'متجر رسمي')}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                }

                renderItem={({ item }) => {
                    const { width } = Dimensions.get('window');
                    const itemWidth = (width - 32 - 12) / 2; // paddingHorizontal is 16 (32 total), gap is pushed by justify-between
                    return (
                    <View style={{ width: itemWidth, marginBottom: 16 }}>
                        <ProductCard product={item} />
                    </View>
                    );
                }}

                ListEmptyComponent={
                    !isFetching ? (
                        <View className="py-24 items-center justify-center">
                            <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6">
                                <Image source={require('@/assets/images/aka.png')} className="w-12 h-12 opacity-20" resizeMode="contain" />
                            </View>
                            <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-lg text-slate-800">
                                {t('Products.empty', 'لا توجد منتجات حالياً')}
                            </Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={() => (
                    <View className="py-10 items-center h-32 justify-center">
                        {isFetching && page > 1 ? (
                            <ActivityIndicator size="small" color={TEAL} />
                        ) : pagination && page >= pagination.total_pages && allProducts.length > 0 ? (
                            <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-slate-300 text-xs">
                                {t('Common.noMoreResults', 'لا توجد نتائج أخرى')}
                            </Text>
                        ) : null}
                    </View>
                )}
            />
        </View>
    );
}

function BrandPageSkeleton() {
  const { width } = Dimensions.get('window');
  // px-4 = 16 padding on sides, so total 32 horizontal padding
  const itemWidth = (width - 32 - 16) / 2;

  return (
    <View className="flex-1 bg-[#f8fafc] px-4 pt-6">
      <Stack.Screen options={{ headerShown: true, title: 'Loading...' }} />
      <Skeleton className="h-32 w-full rounded-2xl mb-6" />
      <View className="flex-row justify-between mb-6">
        <Skeleton style={{ width: itemWidth }} className="h-10 rounded-full" />
        <Skeleton style={{ width: itemWidth }} className="h-10 rounded-full" />
      </View>
      <View className="flex-row flex-wrap justify-between">
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={{ width: itemWidth, marginBottom: 16 }}>
            <Skeleton style={{ aspectRatio: 1 }} className="w-full rounded-2xl mb-2" />
            <Skeleton className="h-4 w-3/4 mb-1" />
          </View>
        ))}
      </View>
    </View>
  );
}
