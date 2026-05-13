import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  ScrollView,
  ActivityIndicator,
  Pressable,
  I18nManager,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Stack } from 'expo-router';
import { Search, X, Clock, ChevronLeft, ChevronRight, TrendingUp, SaudiRiyal } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useGetFeaturedBrandsQuery } from '@/store/features/brands/brandsSlice';
import {
  useLazySearchProductsQuery,
  useLazyAutocompleteQuery,
} from '@/store/features/search/searchSlice';
import { getImageUrl } from '@/lib/image-utils';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Brand {
  id: number | string;
  name: string;
  image: string | null;
}

const DEBOUNCE_MS = 300;
const MAX_HISTORY = 10;
const RECENT_KEY = 'recent_searches';
const TEAL = "#0d9488";

// ─────────────────────────────────────────────
// useRecentSearches hook
// ─────────────────────────────────────────────

function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY)
      .then((raw) => raw && setRecentSearches(JSON.parse(raw)))
      .catch(() => {});
  }, []);

  const save = useCallback(
    async (term: string) => {
      const normalised = term.trim();
      if (!normalised) return;
      const next = [normalised, ...recentSearches.filter((i) => i !== normalised)].slice(
        0,
        MAX_HISTORY,
      );
      setRecentSearches(next);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(() => {});
    },
    [recentSearches],
  );

  const remove = useCallback(
    async (term: string) => {
      const next = recentSearches.filter((i) => i !== term);
      setRecentSearches(next);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(() => {});
    },
    [recentSearches],
  );

  const clear = useCallback(async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_KEY).catch(() => {});
  }, []);

  return { recentSearches, save, remove, clear };
}

// ─────────────────────────────────────────────
// ProductRow — live result card
// ─────────────────────────────────────────────

const ProductRow = React.memo(
  ({
    product,
    onPress,
    isRTL,
  }: {
    product: any;
    onPress: (id: string | number) => void;
    isRTL: boolean;
  }) => {
    const name = isRTL
      ? product.name_ar || product.name || product.name_en || ''
      : product.name_en || product.name || product.name_ar || '';
    const imageUrl = product.main_image || product.image || product.thumbnail;
    const price = product.final_price || product.price || 0;
    const originalPrice = product.price || 0;
    const hasDiscount = product.final_price && product.final_price < product.price;
    const discount = hasDiscount
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

    return (
      <TouchableOpacity
        onPress={() => onPress(product.id)}
        activeOpacity={0.7}
        className="flex-row items-center py-3 px-4 border-b border-slate-50 bg-white"
        style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
        }}
      >
        {/* Thumbnail */}
        <View className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
          {imageUrl ? (
            <Image
              source={{ uri: getImageUrl(imageUrl) }}
              className="w-full h-full"
              contentFit="contain"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-[10px] text-slate-400">لا صورة</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View 
          className="flex-1 mx-4"
          style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}
        >
          <Text 
            numberOfLines={1} 
            style={{ fontFamily: 'Tajawal_700Bold', textAlign: isRTL ? 'right' : 'left' }} 
            className="text-sm text-slate-800 w-full"
          >
            {name}
          </Text>
          <View 
            className="flex-row items-center gap-2 mt-1.5"
            style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
          >
            <View className="flex-row items-center" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Text style={{ fontFamily: 'Tajawal_800ExtraBold', color: TEAL }} className="text-base">
                {price.toFixed(0)}
              </Text>
              <SaudiRiyal size={14} color={TEAL} style={{ marginHorizontal: 2 }} />
            </View>
            {hasDiscount && (
              <>
                <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-[10px] text-slate-300 line-through">
                  {originalPrice.toFixed(0)}
                </Text>
                <View className="bg-red-50 px-2 py-0.5 rounded-lg">
                  <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-[9px] text-red-500">
                    -{discount}%
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

// ─────────────────────────────────────────────
// SearchLandingScreen
// ─────────────────────────────────────────────

export default function SearchLandingScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation('search');
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { recentSearches, save, remove, clear } = useRecentSearches();

  // ── API queries ─────────────────────────────
  const { data: apiBrands } = useGetFeaturedBrandsQuery({ limit: 12 });
  const brands: Brand[] = apiBrands && apiBrands.length > 0 ? apiBrands : [];

  const [triggerSearch, { data: searchResults, isLoading: searchLoading, isFetching: searchFetching }] =
    useLazySearchProductsQuery();
  const [triggerAutocomplete, { data: autocompleteSuggestions, isFetching: autocompleteFetching }] =
    useLazyAutocompleteQuery();

  // ── Debounce ─────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      triggerAutocomplete({ q: debouncedQuery, limit: 6 });
      triggerSearch({ q: debouncedQuery, per_page: 8 });
    }
  }, [debouncedQuery]);

  // ── Derived values ────────────────────────────
  const showLiveResults = query.trim().length >= 2;
  const isSearching = searchLoading || searchFetching || autocompleteFetching;

  const liveProducts = useMemo(() => {
    if (!searchResults?.ids) return [];
    return searchResults.ids
      .map((id) => searchResults.entities[id])
      .filter(Boolean)
      .slice(0, 8);
  }, [searchResults]);

  const textSuggestions = useMemo(() => {
    if (!autocompleteSuggestions) return [];
    return autocompleteSuggestions
      .map((item) =>
        isRTL ? item.name_ar || item.name_en || '' : item.name_en || item.name_ar || '',
      )
      .filter((name, idx, arr) => name && arr.indexOf(name) === idx)
      .slice(0, 5);
  }, [autocompleteSuggestions, isRTL]);

  // ── Handlers ─────────────────────────────────
  const handleSearch = useCallback(
    (term: string) => {
      if (!term.trim()) return;
      save(term);
      router.push({ pathname: '/(tabs)/(home)/(context)/(search)/search', params: { q: term } });
      Keyboard.dismiss();
    },
    [save, router],
  );

  const handleSuggestionPress = useCallback((s: string) => {
    setQuery(s);
    handleSearch(s);
  }, [handleSearch]);

  const handleProductPress = useCallback(
    (id: string | number) => router.push({ pathname: '/(tabs)/(home)/(context)/products/[id]', params: { id } }),
    [router],
  );

  const handleBrandPress = useCallback(
    (brand: Brand) => router.push({ pathname: '/(tabs)/(home)/(context)/brands/[id]', params: { id: brand.id } }),
    [router],
  );

  const ChevronBack = isRTL ? ChevronRight : ChevronLeft;

  // ─────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Search Header ──────────────────── */}
      <View
        className="px-4 py-3 bg-white border-b border-slate-50 flex-row items-center gap-3"
        style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronBack size={24} color="#334155" />
        </Pressable>

        <View
          className="flex-1 bg-slate-50 rounded-[32px] px-4 h-11 border border-slate-100 flex-row items-center gap-3 shadow-sm"
          style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}
        >
          <Search size={18} color={TEAL} />
          <TextInput
            ref={inputRef}
            style={{
              flex: 1,
              fontFamily: 'Tajawal_500Medium',
              fontSize: 14,
              color: '#1e293b',
              textAlign: isRTL ? 'right' : 'left',
            }}
            placeholder={t('SearchHeader.searchPlaceholder', 'ابحث عن المنتجات...')}
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch(query)}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <X size={16} color="#94a3b8" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── Live Results ───────────────────── */}
        {showLiveResults && (
          <View>
            {isSearching && (
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color={TEAL} />
              </View>
            )}

            {/* Text suggestions */}
            {textSuggestions.length > 0 && (
              <View className="border-b border-slate-50">
                <Text style={{ fontFamily: 'Tajawal_700Bold', textAlign: isRTL ? 'right' : 'left' }} className="px-5 py-3 text-[11px] text-slate-400 uppercase tracking-widest">
                  {t('Suggestions.title', 'اقتراحات')}
                </Text>
                {textSuggestions.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleSuggestionPress(s)}
                    activeOpacity={0.6}
                    className="flex-row items-center px-5 py-4 border-b border-slate-50 gap-3"
                    style={{
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    }}
                  >
                    <TrendingUp size={14} color={TEAL} />
                    <Text style={{ fontFamily: 'Tajawal_500Medium', textAlign: isRTL ? 'right' : 'left' }} className="text-sm text-slate-600 flex-1">{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Product preview */}
            {liveProducts.length > 0 && (
              <View>
                <Text style={{ fontFamily: 'Tajawal_700Bold', textAlign: isRTL ? 'right' : 'left' }} className="px-5 py-3 text-[11px] text-slate-400 uppercase tracking-widest">
                  {t('Products.title', 'منتجات')}
                </Text>
                {liveProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onPress={handleProductPress}
                    isRTL={isRTL}
                  />
                ))}
              </View>
            )}

            {/* No results */}
            {!isSearching && textSuggestions.length === 0 && liveProducts.length === 0 && debouncedQuery.length >= 2 && (
              <View className="py-12 items-center px-6">
                <Search size={40} color="#e2e8f0" />
                <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-slate-400 mt-4 text-center">
                  {t('NoResults.title', 'لا توجد نتائج لـ')} "{debouncedQuery}"
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Default Content ─────────────────── */}
        {!showLiveResults && (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View className="px-4 py-6">
                <View
                  className="flex-row items-center justify-between mb-4"
                  style={{
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  }}
                >
                  <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-lg text-slate-800">
                    {t('History.title', 'آخر عمليات البحث')}
                  </Text>
                  <TouchableOpacity onPress={clear}>
                    <Text style={{ fontFamily: 'Tajawal_700Bold', color: TEAL }} className="text-sm">
                      {t('History.clearAll', 'مسح الكل')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="bg-slate-50 rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                  {recentSearches.map((term, idx) => (
                    <View
                      key={term}
                      className="flex-row items-center px-5 py-4 border-b border-slate-100"
                      style={{
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        borderBottomWidth: idx < recentSearches.length - 1 ? 1 : 0,
                        borderBottomColor: '#f1f5f9',
                      }}
                    >
                      <TouchableOpacity
                        style={{ flex: 1, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 }}
                        onPress={() => handleSuggestionPress(term)}
                        activeOpacity={0.6}
                      >
                        <Clock size={15} color="#94a3b8" />
                        <Text style={{ fontSize: 14, color: '#475569' }}>{term}</Text>
                      </TouchableOpacity>
                      <Pressable onPress={() => remove(term)} hitSlop={8}>
                        <X size={15} color="#cbd5e1" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Featured Brands Section */}
            {brands.length > 0 && (
              <View className="py-6">
                <View 
                  className="px-4 mb-5 flex-row items-center justify-between"
                  style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                >
                  <Text style={{ fontFamily: 'Tajawal_800ExtraBold' }} className="text-xl text-slate-800">
                    {t('Brands.title', 'أشهر الماركات')}
                  </Text>
                  <TouchableOpacity activeOpacity={0.6}>
                    <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-sm text-teal-600">
                      {t('Brands.viewAll', 'عرض الكل')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ 
                    paddingHorizontal: 16,
                    flexDirection: isRTL ? 'row-reverse' : 'row'
                  }}
                >
                  {brands.map((brand) => (
                    <TouchableOpacity
                      key={brand.id}
                      onPress={() => handleBrandPress(brand)}
                      activeOpacity={0.8}
                      className="items-center mr-6"
                      style={{ marginEnd: 20 }}
                    >
                      <View 
                        className="w-20 h-20 bg-white rounded-full items-center justify-center border border-slate-50 shadow-sm"
                        style={{
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.05,
                          shadowRadius: 10,
                          elevation: 2
                        }}
                      >
                        {brand.image ? (
                          <Image
                            source={{ uri: getImageUrl(brand.image) }}
                            className="w-12 h-12"
                            resizeMode="contain"
                          />
                        ) : (
                          <Text style={{ fontFamily: 'Tajawal_800ExtraBold' }} className="text-xl text-slate-200">
                            {brand.name.charAt(0)}
                          </Text>
                        )}
                      </View>
                      <Text 
                        numberOfLines={1} 
                        style={{ fontFamily: 'Tajawal_700Bold' }} 
                        className="text-[12px] text-slate-600 mt-3 text-center w-20"
                      >
                        {brand.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Empty state */}
            {brands.length === 0 && recentSearches.length === 0 && (
              <View className="items-center justify-center py-24 px-8">
                <View className="bg-slate-50 p-8 rounded-full mb-6">
                  <Search size={48} color="#cbd5e1" />
                </View>
                <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-lg text-slate-400 text-center">
                  {t('Empty.title', 'ابدأ البحث عن أي منتج')}
                </Text>
                <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-slate-300 mt-2 text-center">
                  اكتشف ملايين المنتجات بأفضل الأسعار
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
