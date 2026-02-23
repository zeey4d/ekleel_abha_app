import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, I18nManager, TextInput, Platform } from 'react-native';
import { 
  BottomSheetModal, 
  BottomSheetFlatList, 
  BottomSheetBackdrop,
  BottomSheetFooter
} from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { ChevronDown, Check, Search, X, SlidersHorizontal } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface FacetValue {
  value: string;
  count: number;
}

interface Facet {
  field: string;
  values: FacetValue[];
}

interface Facets {
  categories?: Facet;
  brand?: Facet;
  price_range?: Facet;
  on_sale?: Facet;
  status?: Facet;
  [key: string]: Facet | undefined;
}

interface Props {
  facets?: Facets;
  onFilterChange?: (group: string, value: string, checked: boolean) => void;
  onApply?: (selectedFilters: Record<string, string[]>) => void;
  onClose?: () => void;
  activeFilters?: Record<string, string[]>;
}

// Map facet keys to i18n translation keys
const FACET_I18N_KEYS: Record<string, string> = {
  categories: 'SearchFacets.categories',
  brand: 'SearchFacets.brands',
  price_range: 'SearchFacets.priceRange',
  on_sale: 'SearchFacets.onSale',
  status: 'SearchFacets.status',
};

export default function SearchFacets({ facets, onFilterChange, onApply, onClose, activeFilters = {} }: Props) {
  const { t, i18n } = useTranslation('search');
  const isRTL = I18nManager.isRTL || i18n.language === 'ar';

  const [selectedFacet, setSelectedFacet] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['65%'], []);

  const openFacet = useCallback((facetKey: string) => {
    setSelectedFacet(facetKey);
    setSearchQuery('');
    setCheckedItems(prev => ({
      ...prev,
      [facetKey]: activeFilters[facetKey] || []
    }));
    bottomSheetModalRef.current?.present();
  }, [activeFilters]);

  const closeFacet = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const handleCheckboxChange = useCallback((facetKey: string, value: string) => {
    setCheckedItems(prev => {
      const current = prev[facetKey] || [];
      const isChecked = current.includes(value);
      const updated = isChecked
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [facetKey]: updated };
    });
  }, []);

  const handleReset = useCallback(() => {
    if (selectedFacet) {
      setCheckedItems(prev => ({ ...prev, [selectedFacet]: [] }));
    }
  }, [selectedFacet]);

  const handleApply = useCallback(() => {
    closeFacet();
    if (onApply) onApply(checkedItems);
    onClose?.();
  }, [checkedItems, closeFacet, onApply, onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
        pressBehavior="close"
      />
    ),
    []
  );

  const getCurrentFacetCount = useCallback(() => {
    if (!selectedFacet) return 0;
    return checkedItems[selectedFacet]?.length || 0;
  }, [selectedFacet, checkedItems]);

  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props} bottomInset={10}>
        <View style={styles.sheetFooter}>
          <TouchableOpacity 
            style={styles.applyButton} 
            onPress={handleApply}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>
              {t('SearchFacets.apply')}
              {getCurrentFacetCount() > 0 && ` (${getCurrentFacetCount()})`}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetFooter>
    ),
    [handleApply, getCurrentFacetCount, t]
  );

  const facetKeys = facets 
    ? Object.keys(facets).filter((key) => facets[key]?.values?.length)
    : [];

  const selectedFacetData = selectedFacet && facets ? facets[selectedFacet] : null;
  
  const filteredItems = useMemo(() => {
    const items = selectedFacetData?.values || [];
    if (!searchQuery.trim()) return items;
    return items.filter(item => 
      item.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedFacetData, searchQuery]);

  const getLabel = (key: string) => {
    const i18nKey = FACET_I18N_KEYS[key];
    return i18nKey ? t(i18nKey) : key;
  };

  // Get total active filters count
  const totalActiveCount = useMemo(() => {
    return Object.values(activeFilters).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  }, [activeFilters]);

  return (
    <View style={styles.container}>
      {/* Horizontal Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={[
          styles.scrollContent,
          isRTL && { flexDirection: 'row-reverse' }
        ]}
      >
        {facetKeys.map((facetKey) => {
          const appliedCount = activeFilters[facetKey]?.length || 0;
          const isApplied = appliedCount > 0;
          return (
            <TouchableOpacity
              key={facetKey}
              style={[
                styles.facetChip,
                isApplied && styles.facetChipActive
              ]}
              onPress={() => openFacet(facetKey)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.facetChipText,
                isApplied && styles.facetChipTextActive
              ]}>
                {getLabel(facetKey)}
              </Text>
              {isApplied && (
                <View style={styles.chipBadge}>
                  <Text style={styles.chipBadgeText}>{appliedCount}</Text>
                </View>
              )}
              <ChevronDown 
                size={14} 
                color={isApplied ? '#2c7c7b' : '#9ca3af'} 
                style={{ marginStart: 4 }}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.sheetHandle}
        backgroundStyle={styles.sheetBackground}
        onDismiss={() => setSelectedFacet(null)}
        footerComponent={renderFooter}
      >
        {/* Header */}
        <View style={styles.sheetHeader}>
          <TouchableOpacity 
            onPress={handleReset}
            style={styles.resetButtonWrapper}
            activeOpacity={0.6}
          >
            <Text style={styles.resetButton}>{t('SearchFacets.reset')}</Text>
          </TouchableOpacity>
          <Text style={styles.sheetTitle}>
            {selectedFacet ? getLabel(selectedFacet) : ''}
          </Text>
          <TouchableOpacity 
            onPress={closeFacet} 
            style={styles.closeButton}
            activeOpacity={0.6}
          >
            <X size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Search Box */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={18} color="#9ca3af" />
            <TextInput
              style={[styles.searchInput, isRTL && { textAlign: 'right' }]}
              placeholder={t('SearchFacets.search')}
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.6}>
                <X size={16} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Options List */}
        <BottomSheetFlatList
          data={filteredItems}
          keyExtractor={(item: FacetValue) => item.value}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('SearchFacets.noResults')}</Text>
            </View>
          }
          renderItem={({ item }: { item: FacetValue }) => {
            const isChecked = checkedItems[selectedFacet!]?.includes(item.value);
            return (
              <TouchableOpacity
                style={[styles.optionRow, isChecked && styles.optionRowActive]}
                onPress={() => handleCheckboxChange(selectedFacet!, item.value)}
                activeOpacity={0.6}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked && <Check size={13} color="#fff" strokeWidth={3} />}
                </View>
                <Text style={[
                  styles.optionLabel,
                  isChecked && styles.optionLabelActive
                ]}>
                  {item.value}
                </Text>
                <View style={[styles.countBadge, isChecked && styles.countBadgeActive]}>
                  <Text style={[styles.countText, isChecked && styles.countTextActive]}>
                    {item.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  // -- Chip styles --
  facetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  facetChipActive: {
    backgroundColor: '#e6f4f4',
    borderColor: '#8ecfce',
  },
  facetChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563',
  },
  facetChipTextActive: {
    color: '#2c7c7b',
    fontWeight: '600',
  },
  chipBadge: {
    backgroundColor: '#2c7c7b',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 6,
    paddingHorizontal: 5,
  },
  chipBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  // -- Sheet styles --
  sheetHandle: {
    backgroundColor: '#d1d5db',
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  sheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: { elevation: 10 },
    }),
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  resetButtonWrapper: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetButton: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // -- Search --
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    padding: 0,
  },
  // -- Options --
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 10,
  },
  optionRowActive: {
    backgroundColor: '#e6f4f4',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginEnd: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2c7c7b',
    borderColor: '#2c7c7b',
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  optionLabelActive: {
    color: '#111827',
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 28,
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: '#e0f0f0',
  },
  countText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  countTextActive: {
    color: '#2c7c7b',
    fontWeight: '600',
  },
  // -- Empty --
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  // -- Footer --
  sheetFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  applyButton: {
    backgroundColor: '#2c7c7b',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#2c7c7b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
