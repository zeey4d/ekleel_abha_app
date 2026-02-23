import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Pressable
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from "lucide-react-native";
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

// State & API
import { useSearchProductsQuery } from "@/store/features/search/searchSlice";

// Components
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import ProductFilterBar from '@/components/products/ProductFilterBar';

export default function DealsPageScreen() {
  const { t } = useTranslation("deals");
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  // 1. State Management
  const params = useLocalSearchParams();
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [currentSort, setCurrentSort] = useState('date_added_desc');

  // Derived state from URL params
  const activeFilters = params as Record<string, string[]>;

  // 2. Fetch Data
  const { data, isLoading, isFetching, error, refetch } = useSearchProductsQuery({
    q: "*",
    page,
    per_page: 12,
    sort_by: currentSort as any,
    ...activeFilters,
    on_sale: activeFilters.on_sale
       ? (Array.isArray(activeFilters.on_sale) ? activeFilters.on_sale[0] : activeFilters.on_sale)
       : '1',
  });

  const productsFromQuery = useMemo(() => {
     return data?.ids.map((id) => data.entities[id]) || [];
  }, [data]);
  
  const pagination = data?.pagination;

  // Reset list when filters/sort change
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
  }, [JSON.stringify(activeFilters), currentSort]); 

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

  const handleApplyFilters = useCallback((selectedFilters: Record<string, string[]>) => {
    router.setParams(selectedFilters);
  }, [router]);

  const loadMore = () => {
    if (!isFetching && pagination && page < pagination.total_pages) {
      setPage(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    setPage(1);
    refetch();
  };

  if (isLoading && page === 1 && allProducts.length === 0) return <DealsGridSkeleton />;

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Deals",
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} >
              <ChevronLeft color="#000000ff" size={28} />
            </Pressable>
          ),
        }}
      />

      {/* --- Products Grid --- */}
      {error && allProducts.length === 0 ? (
        <View className="flex-1 justify-center items-center p-10">
          <Text className="text-red-500 text-center">{t("Content.error")}</Text>
          <TouchableOpacity onPress={handleRetry} className="mt-4 bg-red-500 px-6 py-2 rounded-lg">
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={allProducts}
          keyExtractor={(item, index) => `${item.id}-${index}`} 
          numColumns={2}
          columnWrapperClassName="justify-between px-4"
          contentContainerStyle={{ paddingBottom: 16 }}

          ListHeaderComponent={
            <ProductFilterBar
              facets={data?.facets}
              activeFilters={activeFilters}
              currentSort={currentSort}
              onSortChange={handleSortChange}
              onApplyFilters={handleApplyFilters}
              totalResults={pagination?.total}
            />
          }
          stickyHeaderIndices={[0]}
          
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          
          renderItem={({ item }) => (
            <View className="w-[48%] mb-4">
              <ProductCard product={item} />
            </View>
          )}
          ListEmptyComponent={() => (
            !isFetching ? (
                <View className="mt-20 items-center px-10">
                <Text className="text-lg font-bold text-slate-900">{t("Content.noDeals")}</Text>
                <Text className="text-slate-500 text-center mt-2">{t("Content.noDealsDesc")}</Text>
                </View>
            ) : null
          )}
          ListFooterComponent={() => (
             <View className="py-6 items-center h-20 justify-center">
                {isFetching && page > 1 ? (
                    <ActivityIndicator size="small" color="#e11d48" />
                ) : pagination && page >= pagination.total_pages && allProducts.length > 0 ? (
                    <Text className="text-slate-400 text-xs">It's all!</Text>
                ) : null}
             </View>
          )}
        />
      )}
    </View>
  );
}

// --- Skeleton Component ---
function DealsGridSkeleton() {
  return (
    <View className="flex-1 bg-white p-4">
      <Stack.Screen options={{ headerShown: true, title: "Deals" }} />
      <View className="h-40 bg-slate-200 rounded-[30px] mb-6" />
      <View className="flex-row flex-wrap justify-between">
        {[...Array(4)].map((_, i) => (
          <View key={i} className="w-[48%] mb-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4 mt-3 rounded-md" />
            <Skeleton className="h-4 w-1/2 mt-2 rounded-md" />
          </View>
        ))}
      </View>
    </View>
  );
}
