import React from 'react';
import { View, Pressable, StyleSheet, ScrollView, I18nManager } from 'react-native';
import { Text } from '@/components/ui/text';
import { Truck, Store, Check } from 'lucide-react-native';
import type { Branch } from '@/store/types';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

const TEAL = '#0d9488';
const AMBER = '#f59e0b';

interface Method {
  id: string;
  label: string;
  description: string;
  costLabel: string;
}

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
  subtotal: number;
  homeDeliveryCost: number;
  freeShippingThreshold?: number;
  branches?: Branch[];
  selectedBranchId: number | null;
  onBranchSelect: (id: number) => void;
}

export function ShippingMethodCard({
  selectedId,
  onSelect,
  subtotal,
  homeDeliveryCost,
  freeShippingThreshold = 250,
  branches = [],
  selectedBranchId,
  onBranchSelect,
}: Props) {
  const { t, i18n } = useTranslation('checkout');
  const isRtl = i18n.language === 'ar' || I18nManager.isRTL;
  const isFree = subtotal >= freeShippingThreshold;

  const methods: Method[] = [
    {
      id: 'home_delivery',
      label: t('ShippingMethods.homeDelivery', 'توصيل للمنزل'),
      description: t('ShippingMethods.homeDeliveryDesc', { 
        defaultValue: `توصيل مجاني عند الطلب فوق ${freeShippingThreshold} ريال`,
        threshold: freeShippingThreshold 
      }),
      costLabel: isFree 
        ? t('ShippingMethods.free', 'مجاناً 🎉') 
        : `${homeDeliveryCost} ${t('common.currency', 'ريال')}`,
    },
    {
      id: 'pickup',
      label: t('ShippingMethods.pickup', 'استلام من الفرع'),
      description: t('ShippingMethods.pickupDesc', 'استلم طلبك من أقرب فرع'),
      costLabel: t('ShippingMethods.free', 'مجاناً'),
    },
  ];

  return (
    <View style={styles.wrapper}>
      {methods.map((method) => {
        const isSelected = selectedId === method.id;
        const isDelivery = method.id === 'home_delivery';

        return (
          <View key={method.id}>
            <Pressable
              onPress={() => onSelect(method.id)}
              style={({ pressed }) => [
                styles.card,
                isSelected && (isDelivery ? styles.cardSelectedGreen : styles.cardSelectedAmber),
                pressed && { opacity: 0.85 },
              ]}
            >
              <View
                style={[
                  styles.accentLine,
                  isSelected && (isDelivery ? styles.accentGreen : styles.accentAmber),
                ]}
              />

              <View style={[styles.row, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                {/* Icon */}
                <View
                  style={[
                    styles.iconWrap,
                    isSelected && (isDelivery ? styles.iconWrapGreen : styles.iconWrapAmber),
                  ]}
                >
                  {isDelivery ? (
                    <Truck size={20} color={isSelected ? (isDelivery ? TEAL : AMBER) : '#94a3b8'} />
                  ) : (
                    <Store size={20} color={isSelected ? AMBER : '#94a3b8'} />
                  )}
                </View>

                {/* Label + description */}
                <View style={[styles.textBody, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                  <Text style={[styles.label, isSelected && styles.labelSelected, { textAlign: isRtl ? 'right' : 'left' }]}>
                    {method.label}
                  </Text>
                  <Text style={[styles.desc, { textAlign: isRtl ? 'right' : 'left' }]} numberOfLines={2}>
                    {method.description}
                  </Text>
                </View>

                {/* Cost + radio */}
                <View style={[styles.right, { alignItems: isRtl ? 'flex-start' : 'flex-end' }]}>
                  <Text style={[styles.cost, isSelected && isDelivery && styles.costGreen]}>
                    {method.costLabel}
                  </Text>
                  <View style={[styles.radio, isSelected && (isDelivery ? styles.radioGreen : styles.radioAmber)]}>
                    {isSelected && <View style={[styles.radioDot, { backgroundColor: isDelivery ? TEAL : AMBER }]} />}
                  </View>
                </View>
              </View>
            </Pressable>

            {/* Branch picker for pickup */}
            {method.id === 'pickup' && isSelected && branches.length > 0 && (
              <View style={[styles.branchSection, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                <Text style={styles.branchTitle}>{t('ShippingMethods.selectBranch', 'اختر الفرع')}</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.branchScroll}
                  contentContainerStyle={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
                >
                  {branches.map((branch) => {
                    const isBranchSelected = selectedBranchId === branch.id;
                    return (
                      <Pressable
                        key={branch.id}
                        onPress={() => onBranchSelect(branch.id)}
                        style={[
                          styles.branchChip, 
                          isBranchSelected && styles.branchChipSelected,
                          { marginEnd: isRtl ? 0 : 8, marginStart: isRtl ? 8 : 0 }
                        ]}
                      >
                        {isBranchSelected && (
                          <Check size={12} color={TEAL} strokeWidth={3} />
                        )}
                        <Text style={[styles.branchChipText, isBranchSelected && styles.branchChipTextSelected]}>
                          {branch.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  cardSelectedGreen: {
    borderColor: TEAL,
    backgroundColor: '#f0fdfa',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  cardSelectedAmber: {
    borderColor: AMBER,
    backgroundColor: '#fffbeb',
    shadowColor: AMBER,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  accentLine: {
    height: 3,
    backgroundColor: '#e2e8f0',
  },
  accentGreen: {
    backgroundColor: TEAL,
  },
  accentAmber: {
    backgroundColor: AMBER,
  },
  row: {
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconWrapGreen: { backgroundColor: '#ccfbf1' },
  iconWrapAmber: { backgroundColor: '#fef3c7' },
  textBody: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Tajawal_700Bold',
    color: '#374151',
  },
  labelSelected: {
    color: '#0f766e',
  },
  desc: {
    fontSize: 13,
    fontFamily: 'Tajawal_500Medium',
    color: '#64748b',
    lineHeight: 18,
  },
  right: {
    gap: 6,
    flexShrink: 0,
  },
  cost: {
    fontSize: 14,
    fontFamily: 'Tajawal_700Bold',
    color: '#374151',
  },
  costGreen: {
    color: TEAL,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioGreen: { borderColor: TEAL },
  radioAmber: { borderColor: AMBER },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  branchSection: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
  },
  branchTitle: {
    fontSize: 13,
    fontFamily: 'Tajawal_700Bold',
    color: '#64748b',
  },
  branchScroll: {
    width: '100%',
  },
  branchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  branchChipSelected: {
    borderColor: TEAL,
    backgroundColor: '#ccfbf1',
  },
  branchChipText: {
    fontSize: 13,
    fontFamily: 'Tajawal_500Medium',
    color: '#64748b',
  },
  branchChipTextSelected: {
    color: '#0f766e',
    fontFamily: 'Tajawal_700Bold',
  },
});
