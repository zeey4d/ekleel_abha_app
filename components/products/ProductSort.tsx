import React, { useRef } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export const ProductSort = () => {
  const { t } = useTranslation('search');
  const router = useRouter();
  const params = useLocalSearchParams();
  const currentSort = (params.sort as string) || 'relevance';
  const [open, setOpen] = React.useState(false);

  const sortOptions = [
    { label: t('Sort.relevance'), value: 'relevance' },
    { label: t('Sort.newest'), value: 'newest' },
    { label: t('Sort.priceLowHigh'), value: 'price_asc' },
    { label: t('Sort.priceHighLow'), value: 'price_desc' },
  ];

  const handleSort = (value: string) => {
    router.setParams({ sort: value } as any);
    setOpen(false);
  };

  const currentLabel = sortOptions.find((o) => o.value === currentSort)?.label;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex-row items-center gap-2">
          <Text className="text-sm font-medium text-foreground">
            {t('Sort.sortBy')}: {currentLabel}
          </Text>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="p-4 rounded-t-xl">
        <Text className="text-lg font-bold mb-4 text-center">{t('Sort.sortBy')}</Text>
        <View className="gap-2">
          {sortOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => handleSort(option.value)}
              className="flex-row items-center justify-between p-4 rounded-lg active:bg-slate-50"
            >
              <Text className={`text-base ${currentSort === option.value ? 'font-bold text-primary' : 'text-slate-700'}`}>
                {option.label}
              </Text>
              {currentSort === option.value && <Check size={20} color="#000" />}
            </Pressable>
          ))}
        </View>
      </SheetContent>
    </Sheet>
  );
};
