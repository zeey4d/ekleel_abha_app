import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Tags, ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchProductsQuery } from '@/store/features/search/searchSlice';
import { ProductCard } from '@/features/products/components/ProductCard';
import ProductFilterBar from '@/features/products/components/ProductFilterBar';
import { useTranslation } from 'react-i18next';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 44) / 2;
const PER_PAGE = 12;
const TEAL = "#0d9488";

// ─────────────────────────────────────────────
// Skeleton placeholder
// ─────────────────────────────────────────────

function SearchGridSkeleton() {
  return (
    <View style={{ padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <View
          key={i}
          className="bg-white rounded-[32px] p-4 border border-slate-50 shadow-sm"
          style={{
            width: ITEM_WIDTH,
          }}
        >
          <Skeleton className="w-full h-40 rounded-2xl" />
          <View className="mt-3 gap-2">
            <Skeleton className="w-3/4 h-4 rounded-lg" />
            <Skeleton className="w-1/2 h-3 rounded-lg" />
            <View className="flex-row justify-between items-center mt-2">
              <Skeleton className="h-6 w-16 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────
// SearchScreen
// ─────────────────────────────────────────────

export default function SearchScreen() {
  const { t } = useTranslation('search');
  const router = useRouter();
  const params = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);

  const [currentSort, setCurrentSort] = useState('date_added_desc');
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // ── Param extraction ─────────────────────────
  const query = (params.q as string) || '*';

  const toArray = (v: string | string[] | undefined): string[] =>
    Array.isArray(v) ? v : v ? [v] : [];

  const categories = toArray(params.categories as string | string[]);
  const brand = toArray(params.brand as string | string[]);
  const price_range = toArray(params.price_range as string | string[]);
  const on_sale = params.on_sale as string | undefined;
  const status = params.status as string | undefined;

  // ── RTK Query ────────────────────────────────
  const { data, isLoading, isFetching, refetch } = useSearchProductsQuery({
    q: query,
    page,
    per_page: PER_PAGE,
    sort_by: currentSort as any,
    categories,
    brand,
    price_range,
    on_sale: on_sale || null,
    status: status || null,
  });

  const productsFromQuery = useMemo(
    () => (data?.ids ?? []).map((id) => data!.entities[id]).filter(Boolean),
    [data],
  );

  const pagination = data?.pagination;

  // ── Reset on filter/sort change ──────────────
  // Stringify primitives only; avoid object in dep array
  const filterKey = `${query}|${currentSort}|${categories.join(',')}|${brand.join(',')}|${price_range.join(',')}|${on_sale}|${status}`;
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [filterKey]);

  // ── Accumulate for infinite scroll ───────────
  useEffect(() => {
    if (productsFromQuery.length === 0) {
      if (page === 1 && !isFetching) setAllProducts([]);
      return;
    }
    if (page === 1) {
      setAllProducts(productsFromQuery);
    } else {
      setAllProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newItems = productsFromQuery.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newItems];
      });
    }
  }, [productsFromQuery, page]);

  // ── Handlers ─────────────────────────────────
  const handleSortChange = useCallback((sort: string) => setCurrentSort(sort), []);

  const handleApplyFilters = useCallback(
    (filters: Record<string, string[]>) => router.setParams(filters),
    [router],
  );

  const loadMore = useCallback(() => {
    if (!isFetching && pagination && page < pagination.total_pages) {
      setPage((p) => p + 1);
    }
  }, [isFetching, pagination, page]);

  // ── Sub-renders ──────────────────────────────
  const renderHeader = useCallback(
    () => (
      <ProductFilterBar
        facets={data?.facets}
        activeFilters={params as Record<string, string[]>}
        currentSort={currentSort}
        onSortChange={handleSortChange}
        onApplyFilters={handleApplyFilters}
        totalResults={pagination?.total}
      />
    ),
    [data?.facets, params, currentSort, handleSortChange, handleApplyFilters, pagination?.total],
  );

  const renderEmpty = useCallback(
    () =>
      !isFetching ? (
        <View className="items-center justify-center pt-24 px-8">
          <View className="w-20 h-20 rounded-full bg-slate-50 items-center justify-center mb-6">
            <Tags size={38} color="#cbd5e1" />
          </View>
          <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-lg text-slate-800 text-center">
            {t('noResults')}
          </Text>
          <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-sm text-slate-400 mt-2 text-center leading-5">
            {t('tryDifferentSearch')}
          </Text>
          <TouchableOpacity
            onPress={() => router.setParams({ categories: [], brand: [], q: undefined })}
            className="mt-8 bg-teal-600 rounded-full px-8 py-3 shadow-sm shadow-teal-600/20"
            activeOpacity={0.8}
          >
            <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-white text-sm">
              {t('resetSearch')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null,
    [isFetching, t, router],
  );

  const renderFooter = useCallback(
    () => (
      <View className="h-16 items-center justify-center">
        {isFetching && page > 1 ? (
          <ActivityIndicator size="small" color={TEAL} />
        ) : pagination && page >= pagination.total_pages && allProducts.length > 0 ? (
          <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-xs text-slate-300">
            {t('noMoreResults', 'لا توجد نتائج أخرى')}
          </Text>
        ) : null}
      </View>
    ),
    [isFetching, page, pagination, allProducts.length, t],
  );

  // ── Loading state ─────────────────────────────
  if (isLoading && page === 1 && allProducts.length === 0) {
    return (
      <View className="flex-1 bg-[#f8fafc]">
        <Stack.Screen
          options={{
            headerShown: true,
            title: t('title'),
            headerTitleStyle: { fontFamily: 'Tajawal_700Bold', fontSize: 18 },
            headerStyle: { backgroundColor: '#fff' },
            headerShadowVisible: false,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} className="ml-2 p-2">
                <ChevronLeft size={24} color="#1e293b" />
              </TouchableOpacity>
            )
          }}
        />
        {renderHeader()}
        <SearchGridSkeleton />
      </View>
    );
  }

  // ── Main render ──────────────────────────────
  return (
    <View className="flex-1 bg-[#f8fafc]">
      <Stack.Screen
        options={{
          headerShown: true,
          title: query !== '*' ? query : t('title'),
          headerTitleStyle: { fontFamily: 'Tajawal_700Bold', fontSize: 18 },
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-2 p-2">
              <ChevronLeft size={24} color="#1e293b" />
            </TouchableOpacity>
          )
        }}
      />

      <FlatList
        ref={flatListRef}
        data={allProducts}
        numColumns={2}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 40 }}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <View style={{ flex: 1, maxWidth: '50%' }}>
            <ProductCard product={item} layout="grid" />
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && page === 1}
            onRefresh={() => {
              setPage(1);
              refetch();
            }}
            tintColor={TEAL}
          />
        }
        // ⚡ Performance
        removeClippedSubviews
        maxToRenderPerBatch={8}
        windowSize={7}
        initialNumToRender={6}
      />
    </View>
  );
}
