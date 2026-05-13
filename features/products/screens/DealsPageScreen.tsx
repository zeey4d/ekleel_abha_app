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
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { I18nManager } from "react-native";

const TEAL = "#0d9488";

// State & API
import { useSearchProductsQuery } from "@/store/features/search/searchSlice";

// Components
import { ProductCard } from "@/features/products/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import ProductFilterBar from '@/features/products/components/ProductFilterBar';

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
    <View className="flex-1 bg-[#f8fafc]">
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("Header.title", { defaultValue: "العروض" }),
          headerTitleStyle: { fontFamily: 'Tajawal-Bold', fontSize: 18 },
          headerStyle: { backgroundColor: '#f8fafc' },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable 
                onPress={() => router.back()} 
                className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm border border-slate-50 ml-2"
            >
              {I18nManager.isRTL ? <ChevronRight color="#1e293b" size={20} /> : <ChevronLeft color="#1e293b" size={20} />}
            </Pressable>
          ),
        }}
      />

      {/* --- Products Grid --- */}
      {error && allProducts.length === 0 ? (
        <View className="flex-1 justify-center items-center p-10">
          <Text className="text-red-500 text-center">{t("Content.error")}</Text>
          <TouchableOpacity onPress={handleRetry} className="mt-6 bg-teal-600 px-8 py-3 rounded-full">
            <Text style={{ fontFamily: 'Tajawal-Bold' }} className="text-white">Retry</Text>
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
                <View className="mt-32 items-center px-10">
                  <Text style={{ fontFamily: 'Tajawal-Bold' }} className="text-xl text-slate-800 text-center">
                    {t("Content.noDeals", { defaultValue: "لا توجد عروض حالياً" })}
                  </Text>
                  <Text style={{ fontFamily: 'Tajawal-Medium' }} className="text-slate-400 text-center mt-3">
                    {t("Content.noDealsDesc", { defaultValue: "تحقق مرة أخرى قريباً للحصول على أفضل الخصومات" })}
                  </Text>
                </View>
            ) : null
          )}
          ListFooterComponent={() => (
             <View className="py-8 items-center h-28 justify-center">
                {isFetching && page > 1 ? (
                    <ActivityIndicator size="small" color={TEAL} />
                ) : pagination && page >= pagination.total_pages && allProducts.length > 0 ? (
                    <Text style={{ fontFamily: 'Tajawal-Bold' }} className="text-slate-300 text-xs">وصلت للنهاية!</Text>
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
  const { t } = useTranslation("deals");
  return (
    <View style={{ flex: 1 }} className="bg-[#f8fafc]">
      <Stack.Screen 
        options={{ 
            headerShown: true, 
            title: t("Header.title", { defaultValue: "العروض" }),
            headerTitleStyle: { fontFamily: 'Tajawal-Bold', fontSize: 18 },
            headerStyle: { backgroundColor: '#f8fafc' },
            headerShadowVisible: false,
        }} 
      />
      <View className="flex-row flex-wrap justify-between px-4 mt-6">
        {[...Array(6)].map((_, i) => (
          <View key={i} className="w-[48%] mb-6">
            <Skeleton className="h-56 w-full rounded-[28px] bg-white border border-slate-50" />
            <Skeleton className="h-4 w-3/4 mt-4 rounded-full bg-slate-100" />
            <Skeleton className="h-4 w-1/2 mt-2 rounded-full bg-slate-100" />
          </View>
        ))}
      </View>
    </View>
  );
}
