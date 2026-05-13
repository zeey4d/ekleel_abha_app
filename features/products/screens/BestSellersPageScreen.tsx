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
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useRouter, Stack } from 'expo-router';
import { I18nManager } from "react-native";

const TEAL = "#0d9488";

// Hooks & Redux
import { useGetHomepageContentQuery } from "@/store/features/cms/cmsSlice";

// Components
import { ProductCard } from "@/features/products/components/ProductCard";
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
    <SafeAreaView className="flex-1 bg-[#f8fafc]">
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("Header.title", { defaultValue: "الأكثر مبيعاً" }),
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
            <View className="py-6 items-center h-28 justify-center">
              <ActivityIndicator color={TEAL} size="small" />
              <Text style={{ fontFamily: 'Tajawal-Medium' }} className="text-slate-400 text-xs mt-3">جاري تحميل المزيد...</Text>
            </View>
          ) : (
            <View className="h-20" /> 
          )
        )}

        ListEmptyComponent={() => (
           <View className="mt-32 items-center px-10">
             <Text style={{ fontFamily: 'Tajawal-Bold' }} className="text-xl text-slate-800 text-center">
               {t("Content.noProducts", { defaultValue: "لا توجد منتجات حالياً" })}
             </Text>
           </View>
        )}
      />
    </SafeAreaView>
  );
}

// --- Skeleton ---
function BestSellersSkeleton() {
  const { t } = useTranslation("best_sellers");
  return (
    <View className="flex-1 bg-[#f8fafc]">
      <Stack.Screen 
        options={{ 
            headerShown: true, 
            title: t("Header.title", { defaultValue: "الأكثر مبيعاً" }),
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
