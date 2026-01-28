import React, { useState, useMemo } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Search, Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Brand {
  id: number | string;
  name: string;
  count?: number;
}

interface BrandFilterProps {
  brands?: Brand[];
}

export const BrandFilter = ({ brands = [] }: BrandFilterProps) => {
  const { t } = useTranslation('products');
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const [searchQuery, setSearchQuery] = useState("");

  // استخراج الماركات المختارة من الـ Params (React Navigation)
  const selectedBrands = useMemo(() => {
    const brandParam = route.params?.brand;
    if (!brandParam) return [];
    return typeof brandParam === 'string' ? brandParam.split(",") : brandParam;
  }, [route.params?.brand]);

  const handleBrandChange = (brandName: string) => {
    let newSelected = [...selectedBrands];
    const isChecked = newSelected.includes(brandName);

    if (!isChecked) {
      newSelected.push(brandName);
    } else {
      newSelected = newSelected.filter((b) => b !== brandName);
    }

    // تحديث الـ Params في الصفحة الحالية
    navigation.setParams({
      brand: newSelected.length > 0 ? newSelected.join(",") : undefined,
      page: 1,
    });
  };

  const displayBrands = (brands.length > 0 ? brands : [
    { id: 1, name: "Apple", count: 45 },
    { id: 2, name: "Samsung", count: 32 },
    { id: 3, name: "Sony", count: 12 },
    { id: 4, name: "Nike", count: 28 },
    { id: 5, name: "Adidas", count: 15 },
  ]).filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <View className="space-y-4 p-2">
      <Text className="font-semibold text-sm text-slate-900 mb-2">
        {t('Filters.brands')}
      </Text>

      {/* Search Input */}
      <View className="relative flex-row items-center bg-slate-100 rounded-lg px-3 h-10">
        <Search size={16} color="#94a3b8" />
        <TextInput
          placeholder={t('Filters.searchBrands')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 ml-2 text-sm text-slate-900"
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Brand List */}
      <View className="mt-3 max-h-52">
        <ScrollView nestedScrollEnabled={true}>
          {displayBrands.length > 0 ? (
            displayBrands.map((brand) => {
              const isChecked = selectedBrands.includes(brand.name);
              return (
                <TouchableOpacity
                  key={brand.id}
                  onPress={() => handleBrandChange(brand.name)}
                  className="flex-row items-center py-2 gap-3"
                  activeOpacity={0.7}
                >
                  {/* Custom Checkbox UI */}
                  <View 
                    className={cn(
                      "w-5 h-5 rounded border items-center justify-center",
                      isChecked ? "bg-primary border-primary" : "border-slate-300"
                    )}
                  >
                    {isChecked && <Check size={14} color="white" strokeWidth={3} />}
                  </View>

                  <Text 
                    className={cn(
                      "flex-1 text-sm",
                      isChecked ? "text-primary font-medium" : "text-slate-600"
                    )}
                  >
                    {brand.name}
                  </Text>

                  {brand.count !== undefined && (
                    <Text className="text-xs text-slate-400">({brand.count})</Text>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <Text className="text-xs text-slate-400 text-center py-4">
              {t('Filters.noBrandsFound')}
            </Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
};