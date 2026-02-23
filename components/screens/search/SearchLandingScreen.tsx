
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image,
  Keyboard,
  ScrollView,
  ActivityIndicator,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Stack } from 'expo-router';
import { Search, X, Clock, ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useGetFeaturedBrandsQuery } from '@/store/features/brands/brandsSlice';
import { 
  useLazySearchProductsQuery, 
  useLazyAutocompleteQuery 
} from '@/store/features/search/searchSlice';
import { getImageUrl } from '@/lib/image-utils';

// --- Types ---
interface Brand {
  id: number | string;
  name: string;
  image: string | null;
}

interface SearchSuggestion {
  id: string | number;
  name: string;
  name_en?: string;
  name_ar?: string;
  price: number;
  final_price?: number;
  image?: string;
  main_image?: string;
}

// --- Sample Data for Brands (Fallback) ---
const SAMPLE_BRANDS: Brand[] = [
  { id: 1, name: 'Nike', image: null },
  { id: 2, name: 'Adidas', image: null },
  { id: 3, name: 'Puma', image: null },
  { id: 4, name: 'Zara', image: null },
  { id: 5, name: 'H&M', image: null },
  { id: 6, name: 'Gucci', image: null },
];

// Debounce delay for search
const DEBOUNCE_MS = 300;

/**
 * SearchLandingScreen Component
 * 
 * Features:
 * 1. Live autocomplete suggestions while typing
 * 2. Product preview cards in search results
 * 3. Recent searches management
 * 4. Brands grid for browsing
 */
export default function SearchLandingScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation('search');
  const isRTL = i18n.language === 'ar';
  
  // --- State ---
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // --- RTK Query Hooks ---
  const { data: apiBrands, isLoading: brandsLoading } = useGetFeaturedBrandsQuery({ limit: 12 });
  const brands = (apiBrands && apiBrands.length > 0) ? apiBrands : SAMPLE_BRANDS;
  
  // Lazy queries for live search
  const [triggerSearch, { 
    data: searchResults, 
    isLoading: searchLoading, 
    isFetching: searchFetching 
  }] = useLazySearchProductsQuery();
  
  const [triggerAutocomplete, { 
    data: autocompleteSuggestions, 
    isLoading: autocompleteLoading,
    isFetching: autocompleteFetching 
  }] = useLazyAutocompleteQuery();

  // --- Debounce Effect ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);
    
    return () => clearTimeout(timer);
  }, [query]);

  // --- Fetch suggestions when debounced query changes ---
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      // Fetch autocomplete suggestions
      triggerAutocomplete({ q: debouncedQuery, limit: 6 });
      // Fetch product results for preview
      triggerSearch({ q: debouncedQuery, per_page: 10 });
    }
  }, [debouncedQuery, triggerAutocomplete, triggerSearch]);

  // --- Memoized values ---
  const showLiveResults = useMemo(() => {
    return query.trim().length >= 2;
  }, [query]);

  const isSearching = useMemo(() => {
    return autocompleteLoading || autocompleteFetching || searchLoading || searchFetching;
  }, [autocompleteLoading, autocompleteFetching, searchLoading, searchFetching]);

  // Get products from search results
  const liveProducts = useMemo(() => {
    if (!searchResults?.ids) return [];
    return searchResults.ids.map(id => searchResults.entities[id]).filter(Boolean).slice(0, 10);
  }, [searchResults]);

  // Get text suggestions from autocomplete
  const textSuggestions = useMemo(() => {
    if (!autocompleteSuggestions) return [];
    return autocompleteSuggestions.map(item => {
      const name = isRTL 
        ? (item.name_ar || item.name_en || '') 
        : (item.name_en || item.name_ar || '');
      return name;
    }).filter((name, index, arr) => name && arr.indexOf(name) === index).slice(0, 5);
  }, [autocompleteSuggestions, isRTL]);

  // --- AsyncStorage Logic ---
  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const history = await AsyncStorage.getItem('recent_searches');
      if (history) {
        setRecentSearches(JSON.parse(history));
      }
    } catch (e) {
      console.error('Failed to load search history', e);
    }
  };

  const saveRecentSearch = useCallback(async (term: string) => {
    try {
      if (!term.trim()) return;
      const normalizedTerm = term.trim();
      
      const newHistory = [
        normalizedTerm,
        ...recentSearches.filter(item => item !== normalizedTerm)
      ].slice(0, 10);

      setRecentSearches(newHistory);
      await AsyncStorage.setItem('recent_searches', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save search history', e);
    }
  }, [recentSearches]);

  const clearAllHistory = async () => {
    try {
      await AsyncStorage.removeItem('recent_searches');
      setRecentSearches([]);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  };

  const removeHistoryItem = async (itemToRemove: string) => {
    try {
      const newHistory = recentSearches.filter(item => item !== itemToRemove);
      setRecentSearches(newHistory);
      await AsyncStorage.setItem('recent_searches', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to remove item', e);
    }
  };

  // --- Handlers ---
  const handleSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    saveRecentSearch(searchTerm);
    console.log('Searching for:', searchTerm);
    router.push({
      pathname: '/(tabs)/(home)/(context)/(search)/search',
      params: { q: searchTerm }
    });
    Keyboard.dismiss();
  }, [router, saveRecentSearch]);

  const handleSuggestionPress = useCallback((suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  }, [handleSearch]);

  const handleProductPress = useCallback((productId: string | number) => {
    router.push({
      pathname: '/(tabs)/(home)/(context)/products/[id]',
      params: { id: productId }
    });
  }, [router]);

  const handleBrandClick = useCallback((brand: Brand) => {
    router.push({
      pathname: '/(tabs)/(home)/(context)/brands/[id]',
      params: { id: brand.id }
    });
  }, [router]);

  // --- Get localized product name ---
  const getProductName = useCallback((product: any) => {
    if (isRTL) {
      return product.name_ar || product.name || product.name_en || '';
    }
    return product.name_en || product.name || product.name_ar || '';
  }, [isRTL]);

  // --- Render Product Card ---
  const renderProductCard = useCallback((product: any) => {
    const imageUrl = product.main_image || product.image || product.thumbnail;
    const name = getProductName(product);
    const price = product.final_price || product.price || 0;
    const originalPrice = product.price || 0;
    const hasDiscount = product.final_price && product.final_price < product.price;
    const discountPercent = hasDiscount 
      ? Math.round(((originalPrice - price) / originalPrice) * 100) 
      : 0;

    return (
      <TouchableOpacity
        key={product.id}
        onPress={() => handleProductPress(product.id)}
        className="flex-row bg-white border-b border-gray-100 py-3 px-4"
      >
        {/* Product Image */}
        <View className="w-16 h-16 rounded-lg bg-gray-50 overflow-hidden">
          {imageUrl ? (
            <Image 
              source={{ uri: getImageUrl(imageUrl) }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gray-100">
              <Text className="text-gray-400 text-xs">No Image</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="flex-1 ml-3 justify-center">
          <Text className="text-sm text-gray-800 font-medium" numberOfLines={2}>
            {name}
          </Text>
          
          {/* Price Row */}
          <View className="flex-row items-center mt-1 gap-2">
            <Text className="text-sm font-bold text-emerald-600">
              {price.toFixed(0)} ر.س
            </Text>
            
            {hasDiscount && (
              <>
                <Text className="text-xs text-gray-400 line-through">
                  {originalPrice.toFixed(0)}
                </Text>
                <View className="bg-red-100 px-1.5 py-0.5 rounded">
                  <Text className="text-xs text-red-600 font-medium">
                    -{discountPercent}%
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [getProductName, handleProductPress]);

  // --- Render ---
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* 1. Header & Search Bar */}
      <View className="px-4 py-2 border-b border-gray-100 flex-row items-center gap-2">
            <Pressable onPress={() => router.back()} >
              <ChevronLeft color="#000000ff" size={28} />
            </Pressable>
        
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 h-11">
          <Search size={20} color="#64748b" />
          <TextInput
            className="flex-1 mx-2 text-base text-slate-800 font-medium"
            placeholder={t('SearchHeader.searchPlaceholder', 'ابحث عن المنتجات...')}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch(query)}
            returnKeyType="search"
            autoFocus={true}
            placeholderTextColor="#9ca3af"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>

        {/* Cancel Button */}
        {/* <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-500 font-medium">{t('cancel', 'إلغاء')}</Text>
        </TouchableOpacity> */}
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        
        {/* === Live Search Results (while typing) === */}
        {showLiveResults && (
          <View>
            {/* Loading Indicator */}
            {isSearching && (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#10b981" />
              </View>
            )}

            {/* Text Suggestions */}
            {textSuggestions.length > 0 && (
              <View className="border-b border-gray-100">
                <Text className="px-4 py-2 text-sm font-bold text-gray-500">
                  {t('Suggestions.title', 'اقتراحات')}
                </Text>
                {textSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={`suggestion-${index}`}
                    onPress={() => handleSuggestionPress(suggestion)}
                    className="flex-row items-center px-4 py-3 border-b border-gray-50"
                  >
                    <Search size={16} color="#9ca3af" />
                    <Text className="text-gray-700 text-base mx-3 flex-1">
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Product Preview Cards */}
            {liveProducts.length > 0 && (
              <View>
                <Text className="px-4 py-2 text-sm font-bold text-gray-500">
                  {t('Products.title', 'منتج')}
                </Text>
                {liveProducts.map(product => renderProductCard(product))}
              </View>
            )}

            {/* No Results */}
            {!isSearching && textSuggestions.length === 0 && liveProducts.length === 0 && debouncedQuery.length >= 2 && (
              <View className="py-8 items-center">
                <Text className="text-gray-400">
                  {t('NoResults.title', 'لا توجد نتائج لـ')} "{debouncedQuery}"
                </Text>
              </View>
            )}
          </View>
        )}

        {/* === Default Content (when not typing) === */}
        {!showLiveResults && (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View className="p-4">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-lg font-bold text-slate-800">
                    {t('History.title', 'آخر عمليات البحث')}
                  </Text>
                  <TouchableOpacity onPress={clearAllHistory}>
                    <Text className="text-sm text-blue-500 font-medium">
                      {t('History.clearAll', 'مسح الكل')}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                  {recentSearches.map((term, index) => (
                    <View 
                      key={term} 
                      className={`flex-row items-center justify-between p-3 ${
                        index !== recentSearches.length - 1 ? 'border-b border-slate-100' : ''
                      }`}
                    >
                      <TouchableOpacity 
                        className="flex-1 flex-row items-center"
                        onPress={() => handleSuggestionPress(term)}
                      >
                        <Clock size={16} color="#94a3b8" />
                        <Text className="text-slate-700 text-base px-2">{term}</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        onPress={() => removeHistoryItem(term)} 
                        className="p-1"
                      >
                        <X size={16} color="#cbd5e1" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Brands Grid */}
            <View className="p-4">
              <Text className="text-lg font-bold text-slate-800 mb-4">
                {t('Brands.title', 'تصفح حسب الماركة')}
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {brands.map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    onPress={() => handleBrandClick(brand)}
                    className="w-[31%] aspect-square bg-white border border-slate-200 rounded-xl items-center justify-center mb-3 p-2"
                  >
                    {brand.image ? (
                      <Image 
                        source={{ uri: getImageUrl(brand.image) }}
                        className="w-full h-full"
                        resizeMode="contain"
                      />
                    ) : (
                      <View className="items-center">
                        <Text className="text-2xl font-bold text-slate-300">
                          {brand.name.charAt(0)}
                        </Text>
                        <Text 
                          className="text-xs text-slate-500 mt-1 text-center" 
                          numberOfLines={1}
                        >
                          {brand.name}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Empty State */}
            {!brands.length && recentSearches.length === 0 && (
              <View className="items-center justify-center py-20">
                <Text className="text-slate-400">
                  {t('Empty.title', 'لا يوجد تاريخ بحث أو ماركات للعرض')}
                </Text>
              </View>
            )}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
