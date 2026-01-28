import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Star } from 'lucide-react-native'; // نسخة الموبايل
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export const RatingFilter = () => {
  const { t } = useTranslation('products');
  const router = useRouter();
  const params = useLocalSearchParams();

  // جلب التقييم الحالي من المعاملات
  const currentRating = Number(params.rating) || 0;

  const handleRatingClick = (rating: number) => {
    // تحديث المعاملات في Expo Router
    router.setParams({
      rating: currentRating === rating ? undefined : rating.toString(),
      page: '1',
    });
  };

  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold text-foreground">{t('Filters.rating')}</Text>

      <View className="gap-1">
        {[5, 4, 3, 2, 1].map((rating) => {
          const isSelected = currentRating === rating;

          return (
            <Pressable
              key={rating}
              onPress={() => handleRatingClick(rating)}
              // تأثير الضغط في React Native
              className={cn(
                'flex-row items-center rounded-md px-3 py-2',
                isSelected ? 'bg-secondary' : 'active:bg-secondary/50'
              )}>
              <View className="mr-3 flex-row items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={16}
                    // استخدام fill و color لمحاكاة تصميم الويب
                    fill={index < rating ? '#facc15' : 'transparent'}
                    stroke={index < rating ? '#facc15' : '#e2e8f0'}
                    className={cn(index < rating ? 'text-yellow-400' : 'text-slate-200')}
                  />
                ))}
              </View>

              <Text
                className={cn(
                  'text-sm',
                  isSelected ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}>
                {rating === 5 ? '5 Stars' : t('Filters.andUp')}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
