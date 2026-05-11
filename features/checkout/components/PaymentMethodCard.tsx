import React from 'react';
import { View, Pressable, StyleSheet, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { CreditCard, Banknote, Lock } from 'lucide-react-native';

const GREEN = '#10b981';
const AMBER = '#f59e0b';

type PaymentMethod = 'online' | 'cod';

interface Props {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const PAYMENT_LOGOS = [
  { label: 'Visa', color: '#1a1f71' },
  { label: 'Mada', color: '#00a651' },
  { label: 'MC', color: '#eb001b' },
  { label: 'ApplePay', color: '#000' },
];

export function PaymentMethodCard({ selected, onSelect }: Props) {
  return (
    <View style={styles.wrapper}>
      {/* ── Online Payment ── */}
      <Pressable
        onPress={() => onSelect('online')}
        style={({ pressed }) => [
          styles.card,
          selected === 'online' && styles.cardSelectedGreen,
          pressed && { opacity: 0.9 },
        ]}
      >
        <View style={[styles.accentLine, selected === 'online' && styles.accentGreen]} />

        <View style={styles.row}>
          <View style={[styles.iconWrap, selected === 'online' && styles.iconGreen]}>
            <CreditCard size={20} color={selected === 'online' ? GREEN : '#94a3b8'} />
          </View>

          <View style={styles.textBody}>
            <Text style={[styles.title, selected === 'online' && styles.titleGreen]}>
              الدفع الإلكتروني
            </Text>
            <Text style={styles.desc} numberOfLines={2}>
              ادفع بأمان عبر Visa أو Mada أو Apple Pay
            </Text>

            {/* Logo row */}
            <View style={styles.logoRow}>
              {PAYMENT_LOGOS.map((logo) => (
                <View key={logo.label} style={styles.logoBadge}>
                  <Text style={[styles.logoText, { color: logo.color }]}>
                    {logo.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.radio, selected === 'online' && styles.radioGreen]}>
            {selected === 'online' && <View style={[styles.radioDot, styles.radioDotGreen]} />}
          </View>
        </View>
      </Pressable>

      {/* ── Cash on Delivery ── */}
      <Pressable
        onPress={() => onSelect('cod')}
        style={({ pressed }) => [
          styles.card,
          selected === 'cod' && styles.cardSelectedAmber,
          pressed && { opacity: 0.9 },
        ]}
      >
        <View style={[styles.accentLine, selected === 'cod' && styles.accentAmber]} />

        <View style={styles.row}>
          <View style={[styles.iconWrap, selected === 'cod' && styles.iconAmber]}>
            <Banknote size={20} color={selected === 'cod' ? AMBER : '#94a3b8'} />
          </View>

          <View style={styles.textBody}>
            <Text style={[styles.title, selected === 'cod' && styles.titleAmber]}>
              الدفع عند الاستلام
            </Text>
            <Text style={styles.desc} numberOfLines={2}>
              ادفع نقداً عند وصول طلبك إلى باب منزلك
            </Text>
          </View>

          <View style={[styles.radio, selected === 'cod' && styles.radioAmber]}>
            {selected === 'cod' && <View style={[styles.radioDot, styles.radioDotAmber]} />}
          </View>
        </View>
      </Pressable>

      {/* Security note */}
      <View style={styles.secureRow}>
        <Lock size={12} color="#94a3b8" />
        <Text style={styles.secureText}>جميع المعاملات مشفرة وآمنة 256-bit</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
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
  accentGreen: { backgroundColor: GREEN },
  accentAmber: { backgroundColor: AMBER },
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
  iconGreen: { backgroundColor: '#d1fae5' },
  iconAmber: { backgroundColor: '#fef3c7' },
  textBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  titleGreen: { color: '#065f46' },
  titleAmber: { color: '#92400e' },
  desc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
  },
  logoRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  logoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  logoText: {
    fontSize: 10,
    fontWeight: '700',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioGreen: { borderColor: GREEN },
  radioAmber: { borderColor: AMBER },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioDotGreen: { backgroundColor: GREEN },
  radioDotAmber: { backgroundColor: AMBER },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  secureText: {
    fontSize: 11,
    color: '#94a3b8',
  },
});
