import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const PriceRangeFilter = ({ min = 0, max = 10000 }) => {
  const { t } = useTranslation('products');
  const router = useRouter();
  const params = useLocalSearchParams();

  const urlMin = Number(params.min_price) || min;
  const urlMax = Number(params.max_price) || max;

  const [range, setRange] = useState([urlMin, urlMax]);

  // خيارات سريعة للمستخدم (Presets)
  const pricePresets = [
    { label: 'Under 500', values: [0, 500] },
    { label: '500 - 2000', values: [500, 2000] },
    { label: '2000 - 5000', values: [2000, 5000] },
    { label: 'Over 5000', values: [5000, 10000] },
  ];

  useEffect(() => {
    setRange([urlMin, urlMax]);
  }, [urlMin, urlMax]);

  const applyPrice = (customRange?: number[]) => {
    const targetRange = customRange || range;
    router.setParams({
      min_price: targetRange[0].toString(),
      max_price: targetRange[1].toString(),
      page: '1',
    });
  };

  return (
    <View className="gap-4">
      <Text className="text-sm font-semibold text-foreground">{t('Filters.priceRange')}</Text>

      {/* البديل: نُطاقات سعرية جاهزة (Quick Selection) */}
      <View className="flex-row flex-wrap gap-2">
        {pricePresets.map((preset) => {
          const isSelected = range[0] === preset.values[0] && range[1] === preset.values[1];
          return (
            <TouchableOpacity
              key={preset.label}
              onPress={() => {
                setRange(preset.values);
                applyPrice(preset.values);
              }}
              className={cn(
                'rounded-full border px-3 py-2',
                isSelected ? 'border-primary bg-primary' : 'border-border bg-secondary/20'
              )}>
              <Text
                className={cn(
                  'text-xs',
                  isSelected ? 'font-medium text-primary-foreground' : 'text-muted-foreground'
                )}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="mt-2 flex-row items-center gap-2">
        <View className="flex-1 gap-1">
          <Text className="ml-1 text-[10px] text-muted-foreground">Min Price</Text>
          <Input
            keyboardType="numeric"
            value={range[0].toString()}
            onChangeText={(v) => setRange([Number(v) || 0, range[1]])}
            className="h-10 px-2 text-xs"
          />
        </View>

        <Text className="mt-4 text-muted-foreground">-</Text>

        <View className="flex-1 gap-1">
          <Text className="ml-1 text-[10px] text-muted-foreground">Max Price</Text>
          <Input
            keyboardType="numeric"
            value={range[1].toString()}
            onChangeText={(v) => setRange([range[0], Number(v) || 0])}
            className="h-10 px-2 text-xs"
          />
        </View>
      </View>

      <Button size="sm" onPress={() => applyPrice()} className="h-10 w-full rounded-xl">
        <Text className="text-xs font-bold text-primary-foreground">
          {t('Filters.applyCustom')}
        </Text>
      </Button>
    </View>
  );
};
