
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image,
  Keyboard,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Stack } from 'expo-router';
import { Search, X, Clock, Trash2, ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useGetFeaturedBrandsQuery } from '@/store/features/brands/brandsSlice';
import { getImageUrl } from '@/lib/image-utils';

// --- Types ---
interface Brand {
  id: number | string;
  name: string;
  image: string | null;
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

/**
 * SearchScreen Component
 * 
 * Functions:
 * 1. Displays a search bar (Input + Search button + Clear button).
 * 2. Manages recent searches locally using AsyncStorage (Max 10 items).
 * 3. Navigates to product results on search.
 * 4. Displays a grid of brands.
 */
export default function SearchLandingScreen() {
  const router = useRouter();
  const { t } = useTranslation('search');
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // 1. Fetch Brands (API with fallback)
  const { data: apiBrands, isLoading } = useGetFeaturedBrandsQuery({ limit: 12 });
  const brands = (apiBrands && apiBrands.length > 0) ? apiBrands : SAMPLE_BRANDS;

  // --- AsyncStorage Logic ---

  // Load history on mount
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

  const saveRecentSearch = async (term: string) => {
    try {
      if (!term.trim()) return;
      const normalizedTerm = term.trim();
      
      // Remove duplicates and keep top 10
      const newHistory = [
        normalizedTerm,
        ...recentSearches.filter(item => item !== normalizedTerm)
      ].slice(0, 10);

      setRecentSearches(newHistory);
      await AsyncStorage.setItem('recent_searches', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save search history', e);
    }
  };

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

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    // Save to history
    saveRecentSearch(searchTerm);

    // Navigate to results
    console.log('Searching for:', searchTerm);
    router.push({
      pathname: '/(tabs)/(home)/(context)/products',
      params: { q: searchTerm }
    });
    Keyboard.dismiss();
  };

  const handleBrandClick = (brand: Brand) => {
    // Determine if we search by brand name or navigate to brand page
    // User request said: "Re-execute search with brand name OR navigate to brand page"
    // We will navigate to brand page as per previous implementation logic
    router.push({
        pathname: '/(tabs)/(home)/(context)/brands/[id]',
        params: { id: brand.id }
    });
  };

  // --- Render ---

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      
      
      {/* 1. Header & Search Bar */}
      <View className="px-4 py-2 border-b border-gray-100 flex-row items-center gap-2">
           <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-gray-200 p-2 rounded-full"
        >
          <ChevronLeft color="white" size={20} />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 h-11">
          <Search size={20} color="#64748b" />
          <TextInput
            className="flex-1 mx-2 text-base text-slate-800 text-right font-medium" // Text-right for Arabic
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
        
        {/* Search Button */}
        {/* <TouchableOpacity 
          onPress={() => handleSearch(query)}
          className="bg-emerald-600 h-10 px-4 rounded-full justify-center"
        >
          <Text className="text-white font-bold">بحث</Text>
        </TouchableOpacity> */}
     
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        
        {/* 2. Recent Searches */}
        {recentSearches.length > 0 && (
          <View className="p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold text-slate-800">{t('History.title', 'آخر عمليات البحث')}</Text>
              <TouchableOpacity onPress={clearAllHistory}>
                <Text className="text-sm text-blue-500 font-medium">{t('History.clearAll', 'مسح الكل')}</Text>
              </TouchableOpacity>
            </View>
            
            <View className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
              {recentSearches.map((term, index) => (
                <View key={term} className={`flex-row items-center justify-between p-3 ${index !== recentSearches.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <TouchableOpacity 
                    className="flex-1 flex-row items-center"
                    onPress={() => {
                        setQuery(term);
                        handleSearch(term);
                    }}
                  >
                    <Clock size={16} color="#94a3b8" className="mr-3" />
                    <Text className="text-slate-700 text-base px-2">{term}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => removeHistoryItem(term)} className="p-1">
                    <X size={16} color="#cbd5e1" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 3. Brands Grid */}
        <View className="p-4">
          <Text className="text-lg font-bold text-slate-800 mb-4">{t('Brands.title', 'تصفح حسب الماركة')}</Text>
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
                     <Text className="text-2xl font-bold text-slate-300">{brand.name.charAt(0)}</Text>
                     <Text className="text-xs text-slate-500 mt-1 text-center" numberOfLines={1}>{brand.name}</Text>
                   </View>
                 )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. Empty State Example (Hidden if there is data) */}
        {!brands.length && recentSearches.length === 0 && (
          <View className="items-center justify-center py-20">
             <Text className="text-slate-400">{t('Empty.title', 'لا يوجد تاريخ بحث أو ماركات للعرض')}</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Manual Test Steps ---
/*
1. Open Search Page: Tap on header search bar.
2. Initial State: Should show empty recent searches (or loaded from history) and list of brands.
3. Search: Type "iPhone" and press Search button.
4. Verify: 
    - Navigates to product list.
    - "iPhone" added to history.
5. Search again: Go back to search. "iPhone" should be at the top of list.
6. Local Storage: Reload app (simulated). Search history should persist.
7. Remove Item: Click 'X' next to "iPhone". Should disappear.
8. Clear All: Click "Clear All". List should empty.
9. Brands: Click a brand logo. Should navigate to brand page.
*/
