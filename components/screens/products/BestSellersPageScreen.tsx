import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  SafeAreaView, 
  ActivityIndicator,
  Pressable
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from "lucide-react-native";
import { useRouter, Stack } from 'expo-router';

// Hooks & Redux
import { useGetHomepageContentQuery } from "@/store/features/cms/cmsSlice";

// Components
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function BestSellersScreen() {
  const router = useRouter();
  const { t } = useTranslation("best_sellers");
  
  // 1. Scroll State
  const [visibleCount, setVisibleCount] = useState(10); 
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 2. Fetch Data
  const {
    data: homepageData,
    isLoading,
    error,
    refetch
  } = useGetHomepageContentQuery();

  const allProducts = homepageData?.top_selling_products || [];

  // 3. Displayed Products
  const displayedProducts = useMemo(() => {
    return allProducts.slice(0, visibleCount);
  }, [allProducts, visibleCount]);

  // 4. Load More Handler
  const handleLoadMore = () => {
    if (visibleCount < allProducts.length && !isLoadingMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleCount(prev => prev + 10);
        setIsLoadingMore(false);
      }, 800);
    }
  };

  if (isLoading) return <BestSellersSkeleton />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Best Sellers",
          headerShadowVisible: false,
          headerBackVisible: true,
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
        data={displayedProducts}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperClassName="justify-between px-4"
        contentContainerStyle={{ paddingVertical: 20 }}
        
        onEndReached={handleLoadMore} 
        onEndReachedThreshold={0.5} 
        
        renderItem={({ item }) => (
          <View className="w-[48%] mb-4">
            <ProductCard product={item} />
          </View>
        )}

        ListFooterComponent={() => (
          isLoadingMore ? (
            <View className="py-6 items-center">
              <ActivityIndicator color="#d97706" size="large" />
              <Text className="text-amber-600 text-xs mt-2 font-medium">جاري تحميل المزيد...</Text>
            </View>
          ) : (
            <View className="h-20" /> 
          )
        )}

        ListEmptyComponent={() => (
           <View className="mt-20 items-center px-10">
             <Text className="text-lg font-bold text-slate-900">{t("Content.noProducts")}</Text>
           </View>
        )}
      />
    </SafeAreaView>
  );
}

// --- Skeleton ---
function BestSellersSkeleton() {
  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: true, title: "Best Sellers" }} />
      <View className="h-60 bg-slate-200 rounded-b-[40px] mb-8" />
      <View className="flex-row flex-wrap justify-between px-4">
        {[...Array(4)].map((_, i) => (
          <View key={i} className="w-[48%] mb-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4 mt-3 rounded-md" />
          </View>
        ))}
      </View>
    </View>
  );
}
