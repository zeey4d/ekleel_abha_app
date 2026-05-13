import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { ShoppingBag } from 'lucide-react-native';
import type { CartState } from '@/store/types';
import { I18nManager } from 'react-native';

const TEAL = '#0d9488';

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
      <View style={[styles.header, { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }]}>
        <View style={styles.headerIcon}>
          <ShoppingBag size={16} color={TEAL} />
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
    <View style={[styles.row, { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }]}>
      <Text style={[styles.rowLabel, { textAlign: I18nManager.isRTL ? 'right' : 'left' }]}>{label}</Text>
      <Text style={[styles.rowValue, valueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: 'Tajawal_700Bold',
    color: '#1e293b',
    flex: 1,
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Tajawal_700Bold',
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
  },
  rows: {
    gap: 10,
  },
  row: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium',
    color: '#64748b',
  },
  rowValue: {
    fontSize: 14,
    fontFamily: 'Tajawal_700Bold',
    color: '#374151',
  },
  discountValue: {
    color: '#ef4444',
  },
  freeValue: {
    color: TEAL,
    fontFamily: 'Tajawal_700Bold',
  },
  totalRow: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
    color: '#1e293b',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
    color: TEAL,
  },
});
