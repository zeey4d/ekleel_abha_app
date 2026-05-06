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

// ─────────────────────────────────────────────
// Skeleton placeholder
// ─────────────────────────────────────────────

function SearchGridSkeleton() {
  return (
    <View style={{ padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <View
          key={i}
          style={{
            width: ITEM_WIDTH,
            borderRadius: 12,
            padding: 12,
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#f1f5f9',
          }}
        >
          <Skeleton className="w-full h-40 rounded-lg" />
          <View style={{ marginTop: 10, gap: 6 }}>
            <Skeleton className="w-3/4 h-4 rounded" />
            <Skeleton className="w-1/2 h-3 rounded" />
            <Skeleton className="w-full h-8 mt-1 rounded" />
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
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 24 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#f8fafc',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Tags size={38} color="#cbd5e1" />
          </View>
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>
            {t('noResults')}
          </Text>
          <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
            {t('tryDifferentSearch')}
          </Text>
          <TouchableOpacity
            onPress={() => router.setParams({ categories: [], brand: [], q: undefined })}
            style={{
              marginTop: 20,
              backgroundColor: '#10b981',
              borderRadius: 50,
              paddingHorizontal: 24,
              paddingVertical: 10,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
              {t('resetSearch')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null,
    [isFetching, t, router],
  );

  const renderFooter = useCallback(
    () => (
      <View style={{ height: 60, alignItems: 'center', justifyContent: 'center' }}>
        {isFetching && page > 1 ? (
          <ActivityIndicator size="small" color="#10b981" />
        ) : pagination && page >= pagination.total_pages && allProducts.length > 0 ? (
          <Text style={{ fontSize: 12, color: '#94a3b8' }}>
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
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: t('title'),
            headerStyle: { backgroundColor: '#fff' },
            headerShadowVisible: false,
          }}
        />
        {renderHeader()}
        <SearchGridSkeleton />
      </View>
    );
  }

  // ── Main render ──────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: query !== '*' ? query : t('title'),
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
            tintColor="#10b981"
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
