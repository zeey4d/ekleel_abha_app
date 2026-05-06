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
import { Search, X, Clock, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react-native';
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
        style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
          backgroundColor: '#fff',
        }}
      >
        {/* Thumbnail */}
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 10,
            overflow: 'hidden',
            backgroundColor: '#f8fafc',
            borderWidth: 1,
            borderColor: '#e2e8f0',
          }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: getImageUrl(imageUrl) }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 10, color: '#94a3b8' }}>لا صورة</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text numberOfLines={2} style={{ fontSize: 13, fontWeight: '500', color: '#1e293b' }}>
            {name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#10b981' }}>
              {price.toFixed(0)} ر.س
            </Text>
            {hasDiscount && (
              <>
                <Text style={{ fontSize: 11, color: '#94a3b8', textDecorationLine: 'line-through' }}>
                  {originalPrice.toFixed(0)}
                </Text>
                <View style={{ backgroundColor: '#fef2f2', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ fontSize: 10, color: '#ef4444', fontWeight: '600' }}>
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
        style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
          gap: 10,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronBack size={26} color="#1e293b" />
        </Pressable>

        <View
          style={{
            flex: 1,
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: 12,
            paddingHorizontal: 14,
            height: 44,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            gap: 8,
          }}
        >
          <Search size={18} color="#94a3b8" />
          <TextInput
            ref={inputRef}
            style={{
              flex: 1,
              fontSize: 15,
              color: '#0f172a',
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
            <Pressable onPress={() => setQuery('')} hitSlop={6}>
              <X size={17} color="#94a3b8" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── Live Results ───────────────────── */}
        {showLiveResults && (
          <View>
            {isSearching && (
              <View style={{ paddingVertical: 14, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#10b981" />
              </View>
            )}

            {/* Text suggestions */}
            {textSuggestions.length > 0 && (
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                <Text style={{ paddingHorizontal: 16, paddingVertical: 8, fontSize: 12, color: '#94a3b8', fontWeight: '600' }}>
                  {t('Suggestions.title', 'اقتراحات')}
                </Text>
                {textSuggestions.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleSuggestionPress(s)}
                    activeOpacity={0.6}
                    style={{
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#f8fafc',
                      gap: 12,
                    }}
                  >
                    <TrendingUp size={15} color="#10b981" />
                    <Text style={{ fontSize: 15, color: '#334155', flex: 1 }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Product preview */}
            {liveProducts.length > 0 && (
              <View>
                <Text style={{ paddingHorizontal: 16, paddingVertical: 8, fontSize: 12, color: '#94a3b8', fontWeight: '600' }}>
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
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <Text style={{ color: '#94a3b8', fontSize: 14 }}>
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
              <View style={{ padding: 16 }}>
                <View
                  style={{
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a' }}>
                    {t('History.title', 'آخر عمليات البحث')}
                  </Text>
                  <TouchableOpacity onPress={clear}>
                    <Text style={{ fontSize: 13, color: '#10b981', fontWeight: '600' }}>
                      {t('History.clearAll', 'مسح الكل')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ backgroundColor: '#f8fafc', borderRadius: 14, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' }}>
                  {recentSearches.map((term, idx) => (
                    <View
                      key={term}
                      style={{
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                        alignItems: 'center',
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

            {/* Brands Grid */}
            {brands.length > 0 && (
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 14 }}>
                  {t('Brands.title', 'تصفح حسب الماركة')}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {brands.map((brand) => (
                    <TouchableOpacity
                      key={brand.id}
                      onPress={() => handleBrandPress(brand)}
                      activeOpacity={0.75}
                      style={{
                        width: '31%',
                        aspectRatio: 1,
                        backgroundColor: '#fff',
                        borderWidth: 1,
                        borderColor: '#e2e8f0',
                        borderRadius: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 8,
                      }}
                    >
                      {brand.image ? (
                        <Image
                          source={{ uri: getImageUrl(brand.image) }}
                          style={{ width: '100%', height: '75%' }}
                          resizeMode="contain"
                        />
                      ) : (
                        <>
                          <Text style={{ fontSize: 26, fontWeight: '700', color: '#cbd5e1' }}>
                            {brand.name.charAt(0)}
                          </Text>
                          <Text numberOfLines={1} style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                            {brand.name}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Empty state */}
            {brands.length === 0 && recentSearches.length === 0 && (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
                <Search size={48} color="#e2e8f0" />
                <Text style={{ color: '#94a3b8', marginTop: 16, fontSize: 14 }}>
                  {t('Empty.title', 'ابدأ البحث عن أي منتج')}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
