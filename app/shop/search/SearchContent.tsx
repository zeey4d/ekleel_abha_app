import React, { useState, useMemo } from 'react';
import { View, FlatList, Pressable, RefreshControl, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Filter, LayoutGrid, List, Tags, ArrowLeft } from 'lucide-react-native';

// Components
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

import { useSearchProductsQuery } from "@/store/features/search/searchSlice";
import { ProductCard } from "@/components/products/ProductCard";
import SearchFacets from "@/components/search/SearchFacets";
import { ProductSort } from "@/components/products/ProductSort";
import { FilterChips } from "@/components/products/ProductFilters/FilterChips";
import { useTranslation } from 'react-i18next';

export default function SearchScreen() {
  const { t } = useTranslation('search');
  const router = useRouter();
  const params = useLocalSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const query = (params.q as string) || "*";
  const page = Number(params.page) || 1;
  const sort_by = (params.sort as any) || "relevance";
  const categories = Array.isArray(params.categories) ? params.categories : (params.categories ? [params.categories] : []);

  const { data, isLoading, isFetching, error, refetch } = useSearchProductsQuery({
    q: query,
    page,
    per_page: 12,
    sort_by,
    categories,
  });

  const products = useMemo(() => {
    return (data?.ids.map((id) => data.entities[id]) || []).filter(Boolean);
  }, [data]);

  const renderHeader = () => (
    <View className="bg-background z-10">
      {/* Search Query Display */}
      {query !== "*" && (
        <View className="px-4 py-3 bg-secondary/20 border-b border-border">
          <Text className="text-sm text-muted-foreground">
            {t('resultsFor', { query })}
          </Text>
        </View>
      )}

      {/* Filter & Sort Bar */}
      <View className="px-4 py-3 border-b border-border flex-row justify-between items-center bg-card shadow-sm shadow-black/5">
        <View className="flex-row items-center gap-2">
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex-row gap-2 border-border bg-background active:bg-accent">
                <Filter size={16} className="text-foreground" />
                <Text className="font-medium">{t('filter')}</Text>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85%] rounded-t-2xl">
              <SheetHeader className="border-b border-border pb-4 mb-2">
                <SheetTitle className="text-center">{t('filterProducts')}</SheetTitle>
              </SheetHeader>
              <View className="flex-1">
                <SearchFacets 
                    facets={data?.facets} 
                    onClose={() => setIsFilterSheetOpen(false)} 
                />
              </View>
            </SheetContent>
          </Sheet>
          
          <ProductSort />
        </View>

        <View className="flex-row gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
          <Pressable 
            onPress={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background shadow-xs' : ''}`}
          >
            <LayoutGrid size={18} color={viewMode === 'grid' ? '#000' : '#888'} />
          </Pressable>
          <Pressable 
            onPress={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-background shadow-xs' : ''}`}
          >
            <List size={18} color={viewMode === 'list' ? '#000' : '#888'} />
          </Pressable>
        </View>
      </View>

      {/* Active Filters & Specs */}
      <View className="bg-background">
        <FilterChips />
        <View className="px-4 py-2 bg-secondary/20">
            <Text className="text-xs text-muted-foreground font-medium">
            {isLoading ? t('searching') : t('foundProducts', { count: data?.pagination?.total || 0 })}
            </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading && !isFetching && !products.length) {
    return (
        <View className="flex-1 bg-background">
            <Stack.Screen options={{ headerShown: true, title: t('title') }} />
            {renderHeader()}
            <SearchGridSkeleton viewMode={viewMode} />
        </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen 
        options={{ 
            headerShown: true, 
            title: query !== "*" ? query : t('title'),

            headerStyle: { backgroundColor: '#fff' },
            headerShadowVisible: false,
        }} 
      />

      <FlatList
        data={products}
        key={viewMode} 
        numColumns={viewMode === 'grid' ? 2 : 1}
        keyExtractor={(item) => item.id.toString()}
        
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
        
        contentContainerStyle={{ paddingBottom: 40 }}
        columnWrapperStyle={viewMode === 'grid' ? { gap: 12, paddingHorizontal: 16 } : null}
        style={viewMode === 'list' ? { paddingHorizontal: 16 } : {}}
        ItemSeparatorComponent={() => <View className="h-3" />}
        
        renderItem={({ item }) => (
          <View className={viewMode === 'grid' ? 'flex-1 max-w-[50%]' : 'w-full'}>
             <ProductCard product={item} layout={viewMode} />
          </View>
        )}
        
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center pt-20 px-4">
             <View className="w-20 h-20 bg-secondary/50 rounded-full items-center justify-center mb-4">
                <Tags size={40} className="text-muted-foreground/50" />
             </View>
            <Text className="text-lg font-semibold text-foreground">{t('noResults')}</Text>
            <Text className="text-sm text-muted-foreground text-center mt-2">
                {t('tryDifferentSearch')}
            </Text>
            <Button variant="link" className="mt-4" onPress={() => router.setParams({ categories: [], q: undefined })}>
                <Text>{t('resetSearch')}</Text>
            </Button>
          </View>
        )}
        
        refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

function SearchGridSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  const { width } = Dimensions.get('window');
  const itemWidth = (width - 44) / 2;

  return (
    <View className="p-4 flex-row flex-wrap gap-3">
      {[...Array(6)].map((_, i) => (
        <View 
          key={i} 
          style={{ width: viewMode === 'grid' ? itemWidth : '100%' }} 
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
