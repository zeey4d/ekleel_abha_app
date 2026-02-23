import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { View, FlatList, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LayoutGrid } from 'lucide-react-native';

// Components
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { useSearchProductsQuery } from "@/store/features/search/searchSlice";
import { ProductCard } from "@/components/products/ProductCard";
import ProductFilterBar from '@/components/products/ProductFilterBar';

export default function ProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);
  const [currentSort, setCurrentSort] = useState('date_added_desc');
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Extract filter params
  const categories = Array.isArray(params.categories) ? params.categories : (params.categories ? [params.categories] : []);
  const brand = Array.isArray(params.brand) ? params.brand : (params.brand ? [params.brand] : []);
  const price_range = Array.isArray(params.price_range) ? params.price_range : (params.price_range ? [params.price_range] : []);
  const on_sale = params.on_sale as string | undefined;

  const { data, isLoading, isFetching, refetch } = useSearchProductsQuery({
    q: (params.q as string) || "*",
    page,
    per_page: 12,
    sort_by: currentSort as any,
    categories,
    brand,
    price_range,
    on_sale: on_sale || null,
  });

  const productsFromQuery = useMemo(() => {
    return (data?.ids.map((id) => data.entities[id]) || []).filter(Boolean);
  }, [data]);

  const pagination = data?.pagination;

  // Reset on filter/sort change
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
  }, [currentSort, JSON.stringify(categories), JSON.stringify(brand), JSON.stringify(price_range), on_sale]);

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

  const renderHeader = () => (
    <View className="bg-background z-10">
      <ProductFilterBar
        facets={data?.facets}
        activeFilters={params as Record<string, string[]>}
        currentSort={currentSort}
        onSortChange={handleSortChange}
        onApplyFilters={handleApplyFilters}
        totalResults={pagination?.total}
      />
    </View>
  );

  if (isLoading && page === 1 && allProducts.length === 0) {
    return (
        <View className="flex-1 bg-background">
            <Stack.Screen options={{ headerShown: true, title: 'المنتجات' }} />
            {renderHeader()}
            <ProductGridSkeleton />
        </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen 
        options={{ 
            headerShown: true, 
            title: 'المنتجات',
            headerStyle: { backgroundColor: '#fff' },
            headerShadowVisible: false,
        }} 
      />

      <FlatList
        ref={flatListRef}
        data={allProducts}
        numColumns={2}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]} 
        
        contentContainerStyle={{ paddingBottom: 40 }}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View className="h-3" />}

        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        
        renderItem={({ item }) => (
          <View className="flex-1 max-w-[50%]">
             <ProductCard product={item} layout="grid" />
          </View>
        )}
        
        ListEmptyComponent={() => (
          !isFetching ? (
            <View className="flex-1 items-center justify-center pt-20 px-4">
               <View className="w-20 h-20 bg-secondary/50 rounded-full items-center justify-center mb-4">
                  <LayoutGrid size={40} className="text-muted-foreground/50" />
               </View>
              <Text className="text-lg font-semibold text-foreground">لا توجد نتائج</Text>
              <Text className="text-sm text-muted-foreground text-center mt-2">
                  حاول تغيير خيارات البحث أو إزالة بعض الفلاتر
              </Text>
              <Button variant="link" className="mt-4" onPress={() => router.setParams({ categories: [], brand: [], q: undefined })}>
                  <Text>إعادة تعيين البحث</Text>
              </Button>
            </View>
          ) : null
        )}

        ListFooterComponent={() => (
          <View className="py-6 items-center h-20 justify-center">
            {isFetching && page > 1 ? (
              <ActivityIndicator size="small" color="#374151" />
            ) : pagination && page >= pagination.total_pages && allProducts.length > 0 ? (
              <Text className="text-slate-400 text-xs">لا توجد نتائج أخرى</Text>
            ) : null}
          </View>
        )}
        
        refreshControl={
            <RefreshControl refreshing={isFetching && page === 1} onRefresh={() => { setPage(1); refetch(); }} />
        }
      />
    </View>
  );
}

function ProductGridSkeleton() {
  const { width } = Dimensions.get('window');
  const itemWidth = (width - 44) / 2; 

  return (
    <View className="p-4 flex-row flex-wrap gap-3">
      {[...Array(6)].map((_, i) => (
        <View 
          key={i} 
          style={{ width: itemWidth }} 
          className="bg-card p-3 rounded-xl border border-border/50 shadow-sm"
        >
          <Skeleton className="w-full h-40 rounded-lg bg-secondary/50" />
          <View className="mt-3 gap-2">
            <Skeleton className="w-3/4 h-4 bg-secondary/50" />
            <Skeleton className="w-1/2 h-3 bg-secondary/30" />
            <Skeleton className="w-full h-8 mt-2 rounded bg-secondary/50" />
          </View>
        </View>
      ))}
    </View>
  );
}
