import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, FlatList, Pressable, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';

// State & Hooks
import { useGetCategoryByIdQuery, useGetCategoryChildrenQuery } from '@/store/features/categories/categoriesSlice';
import { useSearchProductsQuery } from '@/store/features/search/searchSlice';
import { useLocalizedEntityName } from '@/hooks/useLocalizedEntityName';

// Components
import { ProductCard } from '@/components/products/ProductCard';
import { SubCategories } from '@/components/categories/SubCategories';
import { Skeleton } from '@/components/ui/skeleton';
import ProductFilterBar from '@/components/products/ProductFilterBar';

export default function CategoryDetailsScreen() {
    const { id, locale = 'ar' } = useLocalSearchParams<{ id: string, locale: string }>();
    const router = useRouter();
    const { t } = useTranslation('category_details');
    const flatListRef = useRef<FlatList>(null);

    const categoryId = Number(id);
    const [currentSort, setCurrentSort] = useState('date_added_desc');
    const [page, setPage] = useState(1);
    const [allProducts, setAllProducts] = useState<any[]>([]);

    // 1. Localized Title
    const { name: categoryName } = useLocalizedEntityName(
        categoryId,
        locale,
        useGetCategoryByIdQuery
    );

    // 2. Fetch Category & Subcategories
    const { data: category, isLoading: isCatLoading } = useGetCategoryByIdQuery(categoryId);
    const { data: subCategories } = useGetCategoryChildrenQuery({ id: categoryId });

    // 3. Search Params
    const params = useLocalSearchParams();

    // Extract filter params
    const brand = Array.isArray(params.brand) ? params.brand : (params.brand ? [params.brand] : []);
    const price_range = Array.isArray(params.price_range) ? params.price_range : (params.price_range ? [params.price_range] : []);
    const on_sale = params.on_sale as string | undefined;

    // 4. Fetch Products
    const {
        data: searchData,
        isLoading: isProdLoading,
        isFetching,
    } = useSearchProductsQuery({
        category_ids: [categoryId],
        per_page: 12,
        page,
        sort_by: currentSort as any,
        brand,
        price_range,
        on_sale: on_sale || null,
    });

    const productsFromQuery = useMemo(() => {
        return searchData?.ids.map((id) => searchData.entities[id]).filter(Boolean) || [];
    }, [searchData]);

    const pagination = searchData?.pagination;
    const facets = searchData?.facets ? (() => {
        const { categories, ...rest } = searchData.facets;
        return rest;
    })() : undefined;

    // Reset on filter/sort change
    useEffect(() => {
        setPage(1);
        setAllProducts([]);
    }, [currentSort, JSON.stringify(brand), JSON.stringify(price_range), on_sale]);

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

    if (isCatLoading) return <CategorySkeleton />;

    return (
        <View className="flex-1 bg-background">
            <Stack.Screen 
                options={{ 
                    headerShown: true,
                    title: categoryName,
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
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
                
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

                        {/* Sub-categories */}
                        <View className="pt-4 pb-2">
                            <SubCategories categories={subCategories || []} />
                        </View>
                    </View>
                }
                
                renderItem={({ item }) => (
                    <View style={{ width: '48%' }} className="mb-4">
                        <ProductCard product={item} />
                    </View>
                )}
                
                ListEmptyComponent={
                    !isProdLoading ? (
                        <View className="py-20 items-center">
                            <Text className="text-muted-foreground">{t('noProducts', 'No products found in this category')}</Text>
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

function CategorySkeleton() {
  return (
    <View className="flex-1 p-4 gap-4">
      <Stack.Screen options={{ headerShown: true, title: 'Loading...' }} />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <View className="flex-row justify-between">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </View>
      <View className="flex-row flex-wrap gap-4">
        <Skeleton className="h-60 w-[45%] rounded-xl" />
        <Skeleton className="h-60 w-[45%] rounded-xl" />
      </View>
    </View>
  );
}
