import React, { useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Pressable, 
  StyleSheet 
} from 'react-native';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useRouter, Stack } from 'expo-router';
import { BlurView } from 'expo-blur';

// Hooks & Redux
import { useGetHomepageContentQuery } from "@/store/features/cms/cmsSlice";

// Components
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewArrivalsScreen() {
  const { t } = useTranslation("new_arrivals");
  const router = useRouter();

  // 1. List Settings
  const perPage = 12;
  const [visibleCount, setVisibleCount] = useState(perPage);

  // 2. Fetch Data
  const {
    data: homepageData,
    isLoading,
    isFetching,
    error,
    refetch
  } = useGetHomepageContentQuery();

  const allProducts = homepageData?.new_arrivals || [];

  // 3. Logic - Accumulate Products
  const products = useMemo(() => {
    return allProducts.slice(0, visibleCount);
  }, [allProducts, visibleCount]);

  const loadMore = () => {
    if (visibleCount < allProducts.length) {
      setVisibleCount((prev) => Math.min(prev + perPage, allProducts.length));
    }
  };

  if (isLoading && !products.length) return <NewArrivalsSkeleton />;

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-white">
        <Stack.Screen options={{ headerShown: true, title: "New Arrivals" }} />
        <View className="bg-red-50 p-6 rounded-2xl items-center w-full">
          <Text className="text-red-600 font-bold text-lg mb-2">{t("Content.errorTitle")}</Text>
          <Text className="text-red-500 text-center mb-4">{t("Content.errorDesc")}</Text>
          <TouchableOpacity 
            className="bg-red-500 px-6 py-3 rounded-xl"
            onPress={refetch}
          >
            <Text className="text-white font-semibold">{t("Content.retry")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerShown: true,
          title: "New Arrivals",
          headerTransparent: true, 
          headerBlurEffect: 'light', 
          headerShadowVisible: false,
          headerTintColor: '#000',
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
                paddingLeft: 10
              })}
            >
              <ChevronLeft color="#000" size={28} />
            </Pressable>
          ),
          headerBackground: () => (
            <BlurView 
              intensity={80} 
              tint="light" 
              style={StyleSheet.absoluteFill} 
            />
          ),
        }}
      />

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperClassName="justify-between px-4"
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 100 }} // Added paddingTop for transparent header
        
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}

        ListHeaderComponent={() => (
          <View className="px-4 py-6">
            <View className="flex-row items-center space-x-2 mb-2">
              <Sparkles size={16} color="#eab308" />
              <Text className="text-yellow-600 font-medium uppercase tracking-wider text-xs">
                {t('Header.badge')}
              </Text>
            </View>
            <Text className="text-sm text-slate-500">
              {t("Content.showing", { count: products.length, total: allProducts.length })}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View className="w-[48%] mb-4">
            <ProductCard product={item} />
          </View>
        )}
        ListFooterComponent={() => (
          <View className="py-6 items-center">
            {visibleCount < allProducts.length ? (
              <ActivityIndicator size="small" color="#0ea5e9" />
            ) : products.length > 0 ? (
               <View className="bg-slate-50 px-4 py-2 rounded-full">
                  <Text className="text-slate-400 text-xs">
                    {t("Content.allProductsLoaded", "تم عرض جميع المنتجات")}
                  </Text>
               </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={() => (
           !isLoading ? (
            <View className="mt-20 items-center px-10">
              <View className="bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-300 w-full items-center">
                <Text className="text-lg font-bold text-slate-900">{t("Content.noProducts")}</Text>
                <Text className="text-slate-500 text-center mt-2">{t("Content.noProductsDesc")}</Text>
              </View>
            </View>
           ) : null
        )}
      />
    </View>
  );
}

function NewArrivalsSkeleton() {
  return (
    <View className="flex-1 bg-white p-4 pt-24">
      <Stack.Screen options={{ headerShown: true, title: "New Arrivals", headerTransparent: true }} />
      <View className="flex-row flex-wrap justify-between">
        {[...Array(6)].map((_, i) => (
          <View key={i} className="w-[48%] mb-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <View className="mt-3 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}