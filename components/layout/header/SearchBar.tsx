import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  ActivityIndicator,
  Keyboard
} from "react-native";
import { useRouter } from "expo-router";
import { Search, X, AlertCircle } from "lucide-react-native";
import { useLazyAutocompleteQuery } from "@/store/features/search/searchSlice";
import { useDebounce } from "@/store/slices/useDebounce";
import { getImageUrl } from "@/lib/image-utils";
import { useTranslation } from "react-i18next";

export const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const { t } = useTranslation('home');

  // RTK Query Hook
  const [triggerSearch, { data: suggestions, isFetching, error, isError }] = useLazyAutocompleteQuery();

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      console.log('🔍 Sending autocomplete request for:', debouncedQuery);
      triggerSearch({ q: debouncedQuery })
        .unwrap()
        .then((result) => {
          console.log('✅ Autocomplete response:', result);
        })
        .catch((err) => {
          console.error('❌ Autocomplete error:', err);
        });
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);

  const handleSearch = () => {
    if (query.trim()) {
      console.log('🔍 Navigating to search with query:', query);
      setShowSuggestions(false);
      Keyboard.dismiss();
      // التوجه لشاشة البحث مع إرسال الكلمة كـ Param
      router.push({
        pathname: "/(tabs)/(home)/(context)/search",
        params: { q: query }
      });
    }
  };

  const navigateToProduct = (id: string) => {
    console.log('🛒 Navigating to product:', id);
    setShowSuggestions(false);
    Keyboard.dismiss();
    router.push({
      pathname: "/(tabs)/(home)/(context)/products/[id]",
      params: { id }
    });
  };

  return (
    <View className="relative w-full z-50 px-0">
      {/* Search Input Field */}
      {/* Search Input Field - Acts as a button to open Search Page */}
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => {
          console.log('🔍 Opening Search Landing Page');
          router.push("/(tabs)/(home)/(context)/search");
        }}
        className="relative flex-row items-center bg-[#f5f5f5] rounded-full px-4 h-10 border border-transparent"
      >
        <Search size={20} color="#64748b" />
        
        <Text className="flex-1 ml-2 text-base text-slate-400 text-left">
          {t('Header.searchPlaceholder', { defaultValue: 'ابحث عن المنتجات...' })}
        </Text>
      </TouchableOpacity>

      {/* Suggestions Dropdown (Absolute Overlay) */}
      {showSuggestions && (
        <View className="absolute top-14 left-0 right-0 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden max-h-80">
          {isFetching ? (
            <View className="p-4 items-center">
              <ActivityIndicator color="#10b981" />
              <Text className="text-slate-500 mt-2 text-sm">جاري البحث...</Text>
            </View>
          ) : isError ? (
            <View className="p-4 items-center flex-row justify-center">
              <AlertCircle size={20} color="#ef4444" />
              <Text className="text-red-500 mr-2 text-sm">
                فشل الاتصال. تحقق من الانترنت.
              </Text>
            </View>
          ) : suggestions && suggestions.length > 0 ? (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => navigateToProduct(item.id.toString())}
                  className="flex-row items-center p-3 border-b border-slate-50 active:bg-slate-50"
                >
                  <View className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    {(item.image || item.main_image) && (
                      <Image
                        source={{ uri: getImageUrl(item.image || item.main_image) }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    )}
                  </View>
                  
                  <View className="flex-1 ml-3">
                    <Text className="text-sm font-semibold text-slate-800" numberOfLines={1}>
                      {item.name_ar || item.name_en}
                    </Text>
                    <Text className="text-xs text-slate-500">{item.price} ر.س</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListFooterComponent={() => (
                <TouchableOpacity 
                  onPress={handleSearch}
                  className="p-4 items-center border-t border-slate-100"
                >
                  <Text className="text-emerald-600 font-bold text-sm">
                    عرض جميع النتائج لـ "{query}"
                  </Text>
                </TouchableOpacity>
              )}
            />
          ) : query.length > 2 ? (
            <View className="p-4 items-center">
              <Text className="text-slate-500 text-sm">لا توجد نتائج لـ "{query}"</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};
