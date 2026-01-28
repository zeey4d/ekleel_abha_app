import React from 'react';
import { View, Text } from 'react-native';
import { SearchX } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface NoResultsProps {
  query: string;
}

export const NoResults = ({ query }: NoResultsProps) => {
  const { t } = useTranslation('search');

  return (
    <View className="flex-1 items-center justify-center py-20 px-4">
      <View className="bg-slate-100 p-6 rounded-full mb-6">
        <SearchX size={48} color="#94a3b8" />
      </View>
      <Text className="text-xl font-bold text-slate-900 mb-2 text-center">
        {t('NoResults.title') || 'No products found'}
      </Text>
      <Text className="text-slate-500 text-center max-w-xs">
        {query 
          ? t('NoResults.descriptionWithQuery', { query }) 
          : t('NoResults.description') || 'Try adjusting your search or filter to find what you are looking for.'}
      </Text>
    </View>
  );
};
