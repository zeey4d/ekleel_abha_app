import React from 'react';
import { View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Truck, Store, Check } from 'lucide-react-native';
import type { Branch } from '@/store/types';

const GREEN = '#10b981';
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
  const isFree = subtotal >= freeShippingThreshold;

  const methods: Method[] = [
    {
      id: 'home_delivery',
      label: 'توصيل للمنزل',
      description: `توصيل مجاني عند الطلب فوق ${freeShippingThreshold} ريال`,
      costLabel: isFree ? 'مجاناً 🎉' : `${homeDeliveryCost} ريال`,
    },
    {
      id: 'pickup',
      label: 'استلام من الفرع',
      description: 'استلم طلبك من أقرب فرع',
      costLabel: 'مجاناً',
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
              {/* Top accent line */}
              <View
                style={[
                  styles.accentLine,
                  isSelected && (isDelivery ? styles.accentGreen : styles.accentAmber),
                ]}
              />

              <View style={styles.row}>
                {/* Icon */}
                <View
                  style={[
                    styles.iconWrap,
                    isSelected && (isDelivery ? styles.iconWrapGreen : styles.iconWrapAmber),
                  ]}
                >
                  {isDelivery ? (
                    <Truck size={20} color={isSelected ? (isDelivery ? GREEN : AMBER) : '#94a3b8'} />
                  ) : (
                    <Store size={20} color={isSelected ? AMBER : '#94a3b8'} />
                  )}
                </View>

                {/* Label + description */}
                <View style={styles.textBody}>
                  <Text style={[styles.label, isSelected && styles.labelSelected]}>
                    {method.label}
                  </Text>
                  <Text style={styles.desc} numberOfLines={2}>
                    {method.description}
                  </Text>
                </View>

                {/* Cost + radio */}
                <View style={styles.right}>
                  <Text style={[styles.cost, isSelected && isDelivery && styles.costGreen]}>
                    {method.costLabel}
                  </Text>
                  <View style={[styles.radio, isSelected && (isDelivery ? styles.radioGreen : styles.radioAmber)]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </View>
              </View>
            </Pressable>

            {/* Branch picker for pickup */}
            {method.id === 'pickup' && isSelected && branches.length > 0 && (
              <View style={styles.branchSection}>
                <Text style={styles.branchTitle}>اختر الفرع</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.branchScroll}>
                  {branches.map((branch) => {
                    const isBranchSelected = selectedBranchId === branch.id;
                    return (
                      <Pressable
                        key={branch.id}
                        onPress={() => onBranchSelect(branch.id)}
                        style={[styles.branchChip, isBranchSelected && styles.branchChipSelected]}
                      >
                        {isBranchSelected && (
                          <Check size={12} color={GREEN} strokeWidth={3} />
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
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  cardSelectedGreen: {
    borderColor: GREEN,
    backgroundColor: '#f0fdf4',
    shadowColor: GREEN,
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
    backgroundColor: GREEN,
  },
  accentAmber: {
    backgroundColor: AMBER,
  },
  row: {
    flexDirection: 'row',
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
  iconWrapGreen: { backgroundColor: '#d1fae5' },
  iconWrapAmber: { backgroundColor: '#fef3c7' },
  textBody: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  labelSelected: {
    color: '#065f46',
  },
  desc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  cost: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  costGreen: {
    color: GREEN,
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
  radioGreen: { borderColor: GREEN },
  radioAmber: { borderColor: AMBER },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GREEN,
  },
  branchSection: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
  },
  branchTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  branchScroll: {
    flexDirection: 'row',
  },
  branchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    marginEnd: 8,
  },
  branchChipSelected: {
    borderColor: GREEN,
    backgroundColor: '#d1fae5',
  },
  branchChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  branchChipTextSelected: {
    color: '#065f46',
    fontWeight: '700',
  },
});
