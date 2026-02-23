import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import { Text } from '@/components/ui/text';
import { SlidersHorizontal, ArrowUpDown, ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ProductSort } from './ProductSort';
import SearchFacets from '@/components/search/SearchFacets';

interface Facets {
  [key: string]: { field: string; values: { value: string; count: number }[] } | undefined;
}

interface Props {
  /** Facets data from search API */
  facets?: Facets;
  /** Currently active filters */
  activeFilters?: Record<string, string[]>;
  /** Current sort value */
  currentSort?: string;
  /** Callback when sort changes */
  onSortChange?: (sortValue: string) => void;
  /** Callback when filters are applied */
  onApplyFilters?: (filters: Record<string, string[]>) => void;
  /** Total results count */
  totalResults?: number;
}

export default function ProductFilterBar({
  facets,
  activeFilters = {},
  currentSort = 'date_added_desc',
  onSortChange,
  onApplyFilters,
  totalResults,
}: Props) {
  const { t, i18n } = useTranslation('search');
  const isRTL = I18nManager.isRTL || i18n.language === 'ar';

  // Count total active filters
  const activeFilterCount = Object.values(activeFilters).reduce(
    (count, values) => count + (Array.isArray(values) ? values.length : 0),
    0
  );

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isRTL && { flexDirection: 'row-reverse' },
          ]}
        >

          {/* Sort (رتب حسب) chip */}
          <ProductSort
            currentSort={currentSort}
            onSortChange={onSortChange}
          />
          {/* Filter (تصفية) chip - wraps SearchFacets trigger */}
          <SearchFacets
            facets={facets}
            activeFilters={activeFilters}
            onApply={onApplyFilters}
          />

          {/* Divider */}
          <View style={styles.divider} />

 
        </ScrollView>

        {/* Results count */}
        {totalResults !== undefined && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>
              {totalResults} {t('results', 'منتج')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  bar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.04,
    // shadowRadius: 3,
    // elevation: 3,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 0,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 6,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  resultsText: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'left',
  },
});
