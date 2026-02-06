import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Filter, Timer, Zap, ChevronLeft, X } from "lucide-react-native";
import { useRouter } from 'expo-router';

// استيراد الـ Hooks والـ Slice
import { useSearchProductsQuery } from "@/store/features/search/searchSlice";

// مكونات الـ Native المخصصة
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductSort } from "@/components/products/ProductSort"; // تأكد من تحويله لـ Native
import SearchFacets  from '../../search/SearchFacets';

export default function DealsScreen() {
  const { t } = useTranslation("deals");
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  // 1. إدارة الحالة (بدلاً من SearchParams)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc" | "date_added_desc" | "date_added_asc">("relevance");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]); // For checkbox ranges
  const [onSaleFilter, setOnSaleFilter] = useState<boolean | null>(true); // Default to on_sale=true for Deals page
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null);

  const [allProducts, setAllProducts] = useState<any[]>([]);

  // 2. جلب البيانات (Sale Items)
  const { data, isLoading, isFetching, error, refetch } = useSearchProductsQuery({
    q: "*",
    on_sale: onSaleFilter,
    page,
    per_page: 12,
    sort_by: sortBy,
    categories: selectedCategories,
    brand: selectedBrands,
    price_range: selectedPriceRanges,
    status: statusFilter,
  });

  const productsFromQuery = useMemo(() => {
     return data?.ids.map((id) => data.entities[id]) || [];
  }, [data]);
  
  const pagination = data?.pagination;

  // تحديث قائمة المنتجات التراكمية
  useEffect(() => {
    if (productsFromQuery.length > 0) {
      if (page === 1) {
        setAllProducts(productsFromQuery);
      } else {
        setAllProducts(prev => {
            return [...prev, ...productsFromQuery];
        });
      }
    } else if (page === 1 && !isFetching) {
        setAllProducts([]);
    }
  }, [productsFromQuery, page]);

  // Handler for Facet Changes from SearchFacets
  const handleFacetChange = (group: string, value: string, checked: boolean) => {
    setPage(1);
    setAllProducts([]); // Clear current products to avoid mixing with new filtered results

    switch (group) {
        case 'categories':
            setSelectedCategories(prev => checked ? [...prev, value] : prev.filter(item => item !== value));
            break;
        case 'brand':
            setSelectedBrands(prev => checked ? [...prev, value] : prev.filter(item => item !== value));
            break;
        case 'price_range':
            setSelectedPriceRanges(prev => checked ? [...prev, value] : prev.filter(item => item !== value));
            break;
        case 'on_sale':
             // Assuming on_sale facet returns '1' or '0' or similar, but for logic we might just toggle boolean or handle specific values
             // If the facet is a simple checkbox for "On Sale", value might be "1"
             // For now, let's assume if checked it's true, if not it's null (or false)
             setOnSaleFilter(checked ? true : null);
             break;
        case 'status':
            // Similarly for status 'In Stock'
             setStatusFilter(checked ? true : null);
            break;
        default:
            console.warn(`Unhandled facet group: ${group}`);
    }
  };

  // دالة تحميل المزيد
  const loadMore = () => {
    if (!isFetching && pagination && page < pagination.total_pages) {
      setPage(prev => prev + 1);
    }
  };

  // إعادة المحاولة
  const handleRetry = () => {
    setPage(1);
    refetch();
  };

  if (isLoading && page === 1 && allProducts.length === 0) return <DealsGridSkeleton />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* --- Header & Timer Section --- */}
      <View className="px-4 py-6 bg-rose-600 rounded-b-[30px] shadow-lg">
        <View className="flex-row items-center mb-4">
           {/* <TouchableOpacity onPress={() => router.back()} className="mr-2">
              <ChevronLeft color="white" size={24} />
           </TouchableOpacity> */}
           <TouchableOpacity 
             onPress={() => router.back()}
             className="bg-white/20 p-2 mr-2 rounded-full"
           >
             <ChevronLeft color="white" size={20} />
           </TouchableOpacity>
           <View className="bg-white/20 px-3 py-1 rounded-full flex-row items-center">
              <Zap size={14} color="#fde047" fill="#fde047" />
              <Text className="text-white text-xs font-bold ml-1 uppercase">{t('Header.badge')}</Text>
           </View>
        </View>
        
        <View className="flex-row justify-between items-center">
          <View className="flex-1 mr-4">
            <Text className="text-2xl font-black text-white">{t('Header.title')}</Text>
            <Text className="text-rose-100 text-sm mt-1">{t('Header.description')}</Text>
          </View>
          
          {/* الموقت المخصص */}
          <DealTimer t={t} />
        </View>
      </View>

      {/* --- Toolbar --- */}
      <View className="flex-row justify-between items-center px-4 py-4 border-b border-slate-50">
        {/* <TouchableOpacity 
          onPress={() => setMobileFiltersOpen(true)}
          className="flex-row items-center bg-slate-100 px-4 py-2 rounded-xl"
        >
          <Filter size={18} color="#475569" />
          <Text className="ml-2 text-slate-700 font-medium">{t("Toolbar.filter")}</Text>
        </TouchableOpacity> */}
        <SearchFacets
          facets={data?.facets || {}}
          onFilterChange={handleFacetChange}
        />

        <Text className="text-slate-500 text-xs">
          {pagination?.total || 0} {t("Toolbar.deals")}
        </Text>
      </View>

      {/* --- Products Grid --- */}
      {error && allProducts.length === 0 ? (
        <View className="flex-1 justify-center items-center p-10">
          <Text className="text-red-500 text-center">{t("Content.error")}</Text>
          <TouchableOpacity onPress={handleRetry} className="mt-4 bg-red-500 px-6 py-2 rounded-lg">
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={allProducts}
          keyExtractor={(item, index) => `${item.id}-${index}`} // إضافة index لتجنب تكرار المفاتيح في حالات نادرة
          numColumns={2}
          columnWrapperClassName="justify-between px-4"
          contentContainerStyle={{ paddingVertical: 16 }}
          
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          
          renderItem={({ item }) => (
            <View className="w-[48%] mb-4">
              <ProductCard product={item} />
            </View>
          )}
          ListEmptyComponent={() => (
            !isFetching ? (
                <View className="mt-20 items-center px-10">
                <Text className="text-lg font-bold text-slate-900">{t("Content.noDeals")}</Text>
                <Text className="text-slate-500 text-center mt-2">{t("Content.noDealsDesc")}</Text>
                </View>
            ) : null
          )}
          ListFooterComponent={() => (
             <View className="py-6 items-center h-20 justify-center">
                {isFetching && page > 1 ? (
                    <ActivityIndicator size="small" color="#e11d48" />
                ) : pagination && page >= pagination.total_pages && allProducts.length > 0 ? (
                    <Text className="text-slate-400 text-xs">It's all!</Text>
                ) : null}
             </View>
          )}
        />
      )}

      {/* --- Filters Modal (بديل الـ Sheet) --- */}
      <Modal
        visible={mobileFiltersOpen}
        animationType="slide"
        onRequestClose={() => setMobileFiltersOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-slate-100">
            <Text className="text-xl font-bold">{t("Toolbar.filter")}</Text>
            <TouchableOpacity onPress={() => setMobileFiltersOpen(false)}>
              <X size={24} color="black" />
            </TouchableOpacity>
          </View>
          <ScrollView className="p-4">
            {/* هنا تضع الـ SearchFacets المخصصة للـ Native */}
            <Text className="text-slate-400 text-center mt-20">Facets Content Here</Text>
          </ScrollView>
          <View className="p-4 border-t border-slate-100">
            <TouchableOpacity 
              className="bg-rose-600 py-4 rounded-2xl items-center"
              onPress={() => setMobileFiltersOpen(false)}
            >
              <Text className="text-white font-bold text-lg">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// --- Deal Timer Component (Native) ---
function DealTimer({ t }) {
  const [timeLeft, setTimeLeft] = useState({ hrs: 12, min: 45, sec: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.sec > 0) return { ...prev, sec: prev.sec - 1 };
        if (prev.min > 0) return { ...prev, min: prev.min - 1, sec: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, min: 59, sec: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const Unit = ({ val, label }) => (
    <View className="items-center bg-white/10 p-2 rounded-lg w-12">
      <Text className="text-white font-bold text-lg">{val.toString().padStart(2, '0')}</Text>
      <Text className="text-[8px] text-rose-100 uppercase">{label}</Text>
    </View>
  );

  return (
    <View className="flex-row items-center space-x-1">
      <Unit val={timeLeft.hrs} label={t("Timer.hrs")} />
      <Text className="text-white font-bold">:</Text>
      <Unit val={timeLeft.min} label={t("Timer.min")} />
      <Text className="text-white font-bold">:</Text>
      <Unit val={timeLeft.sec} label={t("Timer.sec")} />
    </View>
  );
}

// --- Skeleton Component (Native) ---
function DealsGridSkeleton() {
  return (
    <View className="flex-1 bg-white p-4">
      <View className="h-40 bg-slate-200 rounded-[30px] mb-6" />
      <View className="flex-row flex-wrap justify-between">
        {[...Array(4)].map((_, i) => (
          <View key={i} className="w-[48%] mb-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4 mt-3 rounded-md" />
            <Skeleton className="h-4 w-1/2 mt-2 rounded-md" />
          </View>
        ))}
      </View>
    </View>
  );
}