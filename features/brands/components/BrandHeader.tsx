import React from 'react';
import { View, Text, Image } from 'react-native';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react-native';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslation } from 'react-i18next';

interface BrandHeaderProps {
  brand: {
    id: number;
    name: string;
    image: string | null;
    product_count?: number;
  };
}

export const BrandHeader = ({ brand }: BrandHeaderProps) => {
  const { t } = useTranslation('brands');

  return (
    <View className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 mx-4 flex-row items-center gap-6">
      {/* Brand Logo */}
      <View className="w-32 h-32 flex-shrink-0 bg-white border border-slate-100 rounded-xl p-4 items-center justify-center shadow-sm">
        {brand.image ? (
          <Image
            source={{ uri: getImageUrl(brand.image) }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        ) : (
          <Text className="text-4xl font-bold text-slate-200">
            {brand.name[0]}
          </Text>
        )}
      </View>

      {/* Brand Info */}
      <View className="flex-1 space-y-4">
        <View className="flex-row items-center gap-3">
          <Text className="text-3xl font-bold text-slate-900">
            {brand.name}
          </Text>
          <Badge variant="secondary" className="bg-blue-50">
            <View className="flex-row items-center gap-1">
              <CheckCircle2 size={12} color="#1d4ed8" />
              <Text className="text-blue-700 text-xs">
                {t('BrandHeader.officialPartner') || 'Official'}
              </Text>
            </View>
          </Badge>
        </View>

        <Text className="text-slate-500 text-base leading-relaxed">
          {t('BrandHeader.description', { brandName: brand.name }) || 
           `Discover the latest products from ${brand.name}`}
        </Text>
      </View>
    </View>
  );
};