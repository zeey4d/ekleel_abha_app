import React from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

interface FacetValue {
  value: string;
  count: number;
}

interface Facet {
  field: string;
  values: FacetValue[];
}

interface SearchFacetsProps {
  facets?: {
    categories?: Facet;
    brand?: Facet;
    price_range?: Facet;
    on_sale?: Facet;
    status?: Facet;
    [key: string]: Facet | undefined;
  };
  mobile?: boolean;
  onClose?: () => void;
}

export const SearchFacets = ({ facets, mobile, onClose }: SearchFacetsProps) => {
  const { t } = useTranslation('search');
  const [selected, setSelected] = React.useState<{ [key: string]: string[] }>({});

  if (!facets) return null;

  const toggleValue = (group: string, value: string) => {
    setSelected((prev) => {
      const arr = prev[group] || [];
      if (arr.includes(value)) {
        return { ...prev, [group]: arr.filter((v) => v !== value) };
      } else {
        return { ...prev, [group]: [...arr, value] };
      }
    });
  };

  const FacetGroup = ({
    title,
    items,
    groupKey,
  }: {
    title: string;
    items: FacetValue[];
    groupKey: string;
  }) => {
    if (!items || items.length === 0) return null;
    return (
      <View className="mb-4">
        <Text className="mb-2 text-base font-semibold">{title}</Text>
        {items.map((item) => {
          const isChecked = selected[groupKey]?.includes(item.value);
          return (
            <View key={item.value} className="mb-1 flex-row items-center justify-between">
              <Text className="text-sm">
                {item.value} ({item.count})
              </Text>
              <Switch value={isChecked} onValueChange={() => toggleValue(groupKey, item.value)} />
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <ScrollView className="px-2">
      {mobile && (
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-bold">{t('SearchFacets.filters')}</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose}>
              <Text className="text-sm text-primary">{t('SearchFacets.clearAll')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {facets.categories && (
        <FacetGroup
          title={t('SearchFacets.categories')}
          groupKey="categories"
          items={facets.categories.values}
        />
      )}
      {facets.brand && (
        <FacetGroup title={t('SearchFacets.brands')} groupKey="brand" items={facets.brand.values} />
      )}
      {facets.price_range && (
        <FacetGroup
          title={t('SearchFacets.priceRange')}
          groupKey="price_range"
          items={facets.price_range.values}
        />
      )}
      {facets.on_sale && (
        <FacetGroup
          title={t('SearchFacets.promotions')}
          groupKey="on_sale"
          items={facets.on_sale.values}
        />
      )}
      {facets.status && (
        <FacetGroup
          title={t('SearchFacets.availability')}
          groupKey="status"
          items={facets.status.values}
        />
      )}

      {mobile && onClose && (
        <TouchableOpacity onPress={onClose} className="mt-4 rounded bg-primary py-3">
          <Text className="text-center text-white">{t('SearchFacets.showResults')}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};
