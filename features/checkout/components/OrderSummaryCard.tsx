import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { ShoppingBag } from 'lucide-react-native';
import type { CartState } from '@/store/types';

const GREEN = '#10b981';

interface Props {
  cart: CartState;
  shippingCost?: number;
  shippingLabel?: string;
}

export function OrderSummaryCard({ cart, shippingCost, shippingLabel }: Props) {
  const summary = cart.summary;
  const subtotal = summary?.subtotal ?? summary?.total ?? 0;
  const total = summary?.total ?? 0;
  const itemCount = summary?.item_count ?? cart.ids.length;

  const shipping = shippingCost !== undefined ? shippingCost : (summary?.shipping_cost ?? 0);
  const discount = summary?.discount ?? 0;

  const displayTotal = shippingCost !== undefined
    ? (subtotal - discount + shippingCost)
    : total;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <ShoppingBag size={16} color={GREEN} />
        </View>
        <Text style={styles.headerTitle}>ملخص الطلب</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount} منتج</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Rows */}
      <View style={styles.rows}>
        <SummaryRow label="المجموع الفرعي" value={`${subtotal} ريال`} />

        {discount > 0 && (
          <SummaryRow
            label="الخصم"
            value={`-${discount} ريال`}
            valueStyle={styles.discountValue}
          />
        )}

        <SummaryRow
          label={shippingLabel || 'الشحن'}
          value={shipping === 0 ? 'مجاناً 🎉' : `${shipping} ريال`}
          valueStyle={shipping === 0 ? styles.freeValue : undefined}
        />
      </View>

      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>الإجمالي</Text>
        <Text style={styles.totalValue}>{displayTotal} ريال</Text>
      </View>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: object;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
  },
  rows: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  discountValue: {
    color: '#ef4444',
  },
  freeValue: {
    color: GREEN,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: GREEN,
  },
});
