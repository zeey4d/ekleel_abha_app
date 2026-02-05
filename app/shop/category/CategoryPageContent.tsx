import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router';

// Components
import { ProductCard } from '@/components/products/ProductCard';
import { SubCategories } from '@/components/categories/SubCategories';
import { SearchFacets } from '@/components/search/SearchFacets';
import { ProductSort } from '@/components/products/ProductSort';
import { FilterChips } from '@/components/products/ProductFilters/FilterChips';

// UI
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter } from 'lucide-react-native';

// Hooks
import { 
  useGetCategoryByIdQuery, 
  useGetCategoryChildrenQuery 
} from "@/store/features/categories/categoriesSlice";
import { useSearchProductsQuery } from "@/store/features/search/searchSlice";

interface CategoryPageContentProps {
  categoryId: number;
  productLinkPrefix?: string;
}

export function CategoryPageContent({ categoryId, productLinkPrefix }: CategoryPageContentProps) {
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch category data
  const { data: category, isLoading: isCatLoading } = useGetCategoryByIdQuery(categoryId);
  const { data: subCategories } = useGetCategoryChildrenQuery({ id: categoryId });

  // Fetch products
  const {
    data: searchData,
    isLoading: isProdLoading,
    isFetching,
  } = useSearchProductsQuery({
    category_ids: [categoryId],
    per_page: 12,
  });

  const products = searchData?.ids.map((id) => searchData.entities[id]) || [];

  if (isCatLoading) return <CategorySkeleton />;

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
        ListHeaderComponent={
          <View className="pt-4 pb-2">
            {/* Sub-categories */}
            <SubCategories categories={subCategories || []} />

            {/* Toolbar */}
            <View className="flex-row justify-between items-center px-4 py-4 border-b border-border">
              <View className="flex-row items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-row gap-2 rounded-full"
                  onPress={() => setMobileFiltersOpen(true)}
                >
                  <Filter size={16} color="#64748b" />
                  <Text>تصفية</Text>
                </Button>
                <Text className="text-xs text-muted-foreground">
                   {products.length} منتج
                </Text>
              </View>
              <ProductSort />
            </View>
            
            <FilterChips />
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ width: '48%' }} className="mb-4">
            <ProductCard product={item} linkPrefix={productLinkPrefix} />
          </View>
        )}
        ListEmptyComponent={
          !isProdLoading && (
            <View className="py-20 items-center">
              <Text className="text-muted-foreground">لا توجد منتجات في هذا القسم</Text>
            </View>
          )
        }
        ListFooterComponent={isFetching ? <Skeleton className="h-20 w-full m-4" /> : null}
      />

      {/* Filters Modal */}
      {mobileFiltersOpen && (
        <SearchFacets 
          visible={mobileFiltersOpen} 
          onClose={() => setMobileFiltersOpen(false)} 
          facets={searchData?.facets}
        />
      )}
    </View>
  );
}

function CategorySkeleton() {
  return (
    <View className="flex-1 p-4 gap-4">
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
