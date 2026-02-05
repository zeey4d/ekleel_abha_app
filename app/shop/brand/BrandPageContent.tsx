import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useGetBrandByIdQuery } from '@/store/features/brands/brandsSlice';
import { useSearchProductsQuery } from '@/store/features/search/searchSlice';
import { ProductCard } from '@/components/products/ProductCard';
import { FilterChips } from '@/components/products/ProductFilters/FilterChips';
import { FiltersSidebar } from '@/components/products/ProductFilters/FiltersSidebar';
import { ProductSort } from '@/components/products/ProductSort';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, ArrowLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '@/lib/image-utils';

interface BrandPageContentProps {
  brandId: number;
  productLinkPrefix?: string;
}

export function BrandPageContent({ brandId, productLinkPrefix }: BrandPageContentProps) {
  const { t } = useTranslation('brand_details');
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch Brand Details
  const { data: brand, isLoading: isBrandLoading } = useGetBrandByIdQuery(brandId);

  // Fetch Products
  const { data: searchData, isLoading: isProdLoading, isFetching } = useSearchProductsQuery({
    page: 1,
    sort_by: 'date_added_desc',
    brand: brand ? [brand.name] : [],
    per_page: 12,
  }, {
    skip: !brand
  });

  const products = useMemo(() => {
    if (!searchData?.ids) return [];
    return searchData.ids.map((id) => searchData.entities[id]);
  }, [searchData]);

  const facets = searchData?.facets ? { ...searchData.facets, brand: undefined } : undefined;

  if (isBrandLoading) return <BrandPageSkeleton />;

  if (!brand) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-2xl font-bold text-foreground">
          {t('Error.notFoundTitle') || 'العلامة التجارية غير موجودة'}
        </Text>
        <Text className="text-muted-foreground mt-2">
          {t('Error.notFoundDesc') || 'العلامة التي تبحث عنها غير موجودة.'}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16, justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        
        ListHeaderComponent={
          <View className="px-4 mb-6">
            {/* Brand Header */}
            <View className="bg-white rounded-2xl border border-border p-6 mb-6">
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
                    <Text className="text-2xl font-bold text-slate-400">
                      {brand.name.charAt(0)}
                    </Text>
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-foreground mb-1">
                    {brand.name}
                  </Text>
                  {brand.description && (
                    <Text className="text-sm text-muted-foreground" numberOfLines={2}>
                      {brand.description}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Toolbar */}
            <View className="flex-row items-center justify-between mb-4 py-2 border-y border-border/50">
              <Button 
                variant="outline" 
                size="sm" 
                onPress={() => setMobileFiltersOpen(true)}
                className="flex-row items-center gap-2 rounded-full border-slate-200"
              >
                <Filter size={16} color="#64748b" />
                <Text className="text-slate-600">{t('Toolbar.filter') || 'تصفية'}</Text>
              </Button>

              <ProductSort />
            </View>

            <FilterChips />
            
            {products.length > 0 && (
              <Text className="text-xs text-muted-foreground mb-4">
                {products.length} {t('Toolbar.results') || 'نتيجة'}
              </Text>
            )}
          </View>
        }

        renderItem={({ item }) => (
          <View style={{ width: '48%', marginBottom: 16 }}>
            <ProductCard product={item} linkPrefix={productLinkPrefix} />
          </View>
        )}

        ListEmptyComponent={
          !isFetching ? (
            <View className="py-20 items-center">
              <Text className="text-lg font-semibold text-foreground">
                لا توجد منتجات
              </Text>
              <Text className="text-muted-foreground mt-1">
                لا توجد منتجات لـ {brand.name}
              </Text>
            </View>
          ) : null
        }

        ListFooterComponent={
          isFetching ? (
            <View className="py-6">
              <ActivityIndicator size="small" color="#020617" />
            </View>
          ) : (
            <View className="h-10" />
          )
        }
      />

      {/* Filters Sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="right" className="w-[85%] p-0">
          <FiltersSidebar 
            facets={facets} 
            mobile 
            onClose={() => setMobileFiltersOpen(false)} 
          />
        </SheetContent>
      </Sheet>
    </View>
  );
}

// Skeleton Component
function BrandPageSkeleton() {
  return (
    <View className="flex-1 bg-background px-4 pt-6">
      <Skeleton className="h-10 w-48 mb-6 rounded-lg" />
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
            <Skeleton className="h-4 w-1/2" />
          </View>
        ))}
      </View>
    </View>
  );
}
