import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Trophy, Award, ChevronLeft } from "lucide-react-native";
import { useRouter } from 'expo-router';

// Hooks و Redux
import { useGetHomepageContentQuery } from "@/store/features/cms/cmsSlice";

// مكونات الـ Native
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function BestSellersScreen() {
  const router = useRouter();
  const { t } = useTranslation("best_sellers");
  
  // 1. حالات إدارة التمرير اللانهائي
  const [visibleCount, setVisibleCount] = useState(10); // عدد المنتجات المعروضة حالياً
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 2. جلب البيانات
  const {
    data: homepageData,
    isLoading,
    error,
    refetch
  } = useGetHomepageContentQuery();

  const allProducts = homepageData?.top_selling_products || [];

  // 3. المنتجات التي ستظهر في القائمة حالياً
  const displayedProducts = useMemo(() => {
    return allProducts.slice(0, visibleCount);
  }, [allProducts, visibleCount]);

  // 4. دالة تحميل المزيد عند الوصول لنهاية القائمة
  const handleLoadMore = () => {
    // إذا كان هناك المزيد من المنتجات ولم نكن في حالة تحميل بالفعل
    if (visibleCount < allProducts.length && !isLoadingMore) {
      setIsLoadingMore(true);
      
      // محاكاة تأخير بسيط لإعطاء إحساس التحميل (اختياري)
      setTimeout(() => {
        setVisibleCount(prev => prev + 10);
        setIsLoadingMore(false);
      }, 800);
    }
  };

  if (isLoading) return <BestSellersSkeleton />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header الذهبي الفخم */}
      <View className="bg-amber-500 p-6 rounded-b-[40px] shadow-xl relative overflow-hidden">
        <View className="absolute -bottom-10 -right-10 opacity-20">
          <Trophy size={180} color="white" />
        </View>

        <View className="flex-row items-center mb-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="bg-white/20 p-2 rounded-full"
          >
            <ChevronLeft color="white" size={20} />
          </TouchableOpacity>
          <View className="flex-row items-center bg-white/20 px-3 py-1 rounded-full ml-3">
            <Award size={14} color="#fef3c7" />
            <Text className="text-white text-[10px] font-bold ml-1 uppercase">
              {t('Header.badge')}
            </Text>
          </View>
        </View>

        <Text className="text-3xl font-black text-white mb-2">{t('Header.title')}</Text>
        <Text className="text-amber-50 text-sm max-w-[80%]">{t('Header.description')}</Text>
      </View>

      {/* القائمة مع التمرير اللانهائي */}
      <FlatList
        data={displayedProducts}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperClassName="justify-between px-4"
        contentContainerStyle={{ paddingVertical: 20 }}
        
        // التمرير اللانهائي
        onEndReached={handleLoadMore} // الدالة التي تُنفذ عند الوصول للنهاية
        onEndReachedThreshold={0.5} // تنفيذ الدالة عندما يتبقى 50% من طول الشاشة قبل النهاية
        
        renderItem={({ item }) => (
          <View className="w-[48%] mb-4">
            <ProductCard product={item} />
          </View>
        )}

        // مؤشر التحميل في أسفل القائمة
        ListFooterComponent={() => (
          isLoadingMore ? (
            <View className="py-6 items-center">
              <ActivityIndicator color="#d97706" size="large" />
              <Text className="text-amber-600 text-xs mt-2 font-medium">جاري تحميل المزيد...</Text>
            </View>
          ) : (
            <View className="h-20" /> // مسافة أمان في النهاية
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