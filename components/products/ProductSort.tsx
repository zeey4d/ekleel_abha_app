import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, I18nManager, Platform } from 'react-native';
import { 
  BottomSheetModal, 
  BottomSheetFlatList, 
  BottomSheetBackdrop,
  BottomSheetFooter
} from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { ChevronDown, Check, ArrowUpDown, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface SortOption {
  value: string;
  i18nKey: string;
}

// Sort options mapped to i18n keys in 'products' namespace
const SORT_OPTIONS: SortOption[] = [
  { value: 'date_added_desc', i18nKey: 'ProductSort.newest' },
  { value: 'date_added_asc', i18nKey: 'ProductSort.oldest' },
  { value: 'price_asc', i18nKey: 'ProductSort.priceLowHigh' },
  { value: 'price_desc', i18nKey: 'ProductSort.priceHighLow' },
  { value: 'name_asc', i18nKey: 'ProductSort.nameAZ' },
  { value: 'name_desc', i18nKey: 'ProductSort.nameZA' },
];

interface Props {
  currentSort?: string;
  onSortChange?: (sortValue: string) => void;
}

export function ProductSort({ currentSort = 'date_added_desc', onSortChange }: Props) {
  const { t, i18n } = useTranslation('products');
  const isRTL = I18nManager.isRTL || i18n.language === 'ar';

  const [selectedSort, setSelectedSort] = useState<string>(currentSort);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['50%'], []);

  const openSheet = useCallback(() => {
    setSelectedSort(currentSort);
    bottomSheetModalRef.current?.present();
  }, [currentSort]);

  const closeSheet = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const handleSelectSort = useCallback((value: string) => {
    setSelectedSort(value);
  }, []);

  const handleApply = useCallback(() => {
    closeSheet();
    if (onSortChange) {
      onSortChange(selectedSort);
    }
  }, [selectedSort, closeSheet, onSortChange]);

  const handleReset = useCallback(() => {
    setSelectedSort('date_added_desc');
  }, []);

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
              {t('ProductSort.apply')}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetFooter>
    ),
    [handleApply, t]
  );

  const getLabel = useCallback((option: SortOption) => {
    return t(option.i18nKey);
  }, [t]);

  const getCurrentSortLabel = useCallback(() => {
    const option = SORT_OPTIONS.find(o => o.value === currentSort);
    return option ? getLabel(option) : t('ProductSort.sortBy');
  }, [currentSort, getLabel, t]);

  const isDefault = currentSort === 'date_added_desc';

  return (
    <View style={styles.container}>
      {/* Sort Chip Button */}
      <TouchableOpacity
        style={[styles.sortChip, !isDefault && styles.sortChipActive]}
        onPress={openSheet}
        activeOpacity={0.7}
      >
        <ArrowUpDown 
          size={14} 
          color={isDefault ? '#6b7280' : '#2c7c7b'} 
          style={{ marginEnd: 6 }} 
        />
        <Text style={[styles.sortChipText, !isDefault && styles.sortChipTextActive]}>
          {getCurrentSortLabel()}
        </Text>
        <ChevronDown 
          size={14} 
          color={isDefault ? '#9ca3af' : '#2c7c7b'} 
          style={{ marginStart: 4 }} 
        />
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.sheetHandle}
        backgroundStyle={styles.sheetBackground}
        footerComponent={renderFooter}
      >
        {/* Header */}
        <View style={styles.sheetHeader}>
          <TouchableOpacity 
            onPress={handleReset}
            style={styles.resetButtonWrapper}
            activeOpacity={0.6}
          >
            <Text style={styles.resetButton}>{t('ProductSort.reset')}</Text>
          </TouchableOpacity>
          <Text style={styles.sheetTitle}>
            {t('ProductSort.sortBy')}
          </Text>
          <TouchableOpacity 
            onPress={closeSheet} 
            style={styles.closeButton}
            activeOpacity={0.6}
          >
            <X size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Sort Options List */}
        <BottomSheetFlatList
          data={SORT_OPTIONS}
          keyExtractor={(item: SortOption) => item.value}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }: { item: SortOption }) => {
            const isSelected = selectedSort === item.value;
            return (
              <TouchableOpacity
                style={[styles.optionRow, isSelected && styles.optionRowActive]}
                onPress={() => handleSelectSort(item.value)}
                activeOpacity={0.6}
              >
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {getLabel(item)}
                </Text>
                {isSelected && <Check size={18} color="#2c7c7b" style={{ marginStart: 'auto' }} />}
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
  // -- Chip --
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sortChipActive: {
    backgroundColor: '#e6f4f4',
    borderColor: '#8ecfce',
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563',
  },
  sortChipTextActive: {
    color: '#2c7c7b',
    fontWeight: '600',
  },
  // -- Sheet --
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
  // -- Options --
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginVertical: 2,
    borderRadius: 10,
  },
  optionRowActive: {
    backgroundColor: '#e6f4f4',
  },
  radio: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 11,
    marginEnd: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#2c7c7b',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2c7c7b',
  },
  optionLabel: {
    fontSize: 15,
    color: '#4b5563',
  },
  optionLabelSelected: {
    fontWeight: '700',
    color: '#111827',
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