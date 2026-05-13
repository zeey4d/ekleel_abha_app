import React from 'react';
import { View, Pressable, StyleSheet, I18nManager } from 'react-native';
import { Text } from '@/components/ui/text';
import { CreditCard, Banknote, Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

const TEAL = '#0d9488';
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
  const { t, i18n } = useTranslation('checkout');
  const isRtl = i18n.language === 'ar' || I18nManager.isRTL;

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

        <View style={[styles.row, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.iconWrap, selected === 'online' && styles.iconGreen]}>
            <CreditCard size={20} color={selected === 'online' ? TEAL : '#94a3b8'} />
          </View>

          <View style={[styles.textBody, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
            <Text style={[styles.title, selected === 'online' && styles.titleGreen, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Payment.creditCard', 'الدفع الإلكتروني')}
            </Text>
            <Text style={[styles.desc, { textAlign: isRtl ? 'right' : 'left' }]} numberOfLines={2}>
              {t('Payment.creditCardDesc', 'ادفع بأمان عبر Visa أو Mada أو Apple Pay')}
            </Text>

            {/* Logo row */}
            <View style={[styles.logoRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
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

        <View style={[styles.row, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.iconWrap, selected === 'cod' && styles.iconAmber]}>
            <Banknote size={20} color={selected === 'cod' ? AMBER : '#94a3b8'} />
          </View>

          <View style={[styles.textBody, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
            <Text style={[styles.title, selected === 'cod' && styles.titleAmber, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Payment.cod', 'الدفع عند الاستلام')}
            </Text>
            <Text style={[styles.desc, { textAlign: isRtl ? 'right' : 'left' }]} numberOfLines={2}>
              {t('Payment.codDesc', 'ادفع نقداً عند وصول طلبك إلى باب منزلك')}
            </Text>
          </View>

          <View style={[styles.radio, selected === 'cod' && styles.radioAmber]}>
            {selected === 'cod' && <View style={[styles.radioDot, styles.radioDotAmber]} />}
          </View>
        </View>
      </Pressable>

      {/* Security note */}
      <View style={[styles.secureRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        <Lock size={12} color="#94a3b8" />
        <Text style={[styles.secureText, { textAlign: isRtl ? 'right' : 'left' }]}>{t('Payment.encryptionNote', 'جميع المعاملات مشفرة وآمنة 256-bit')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
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
  accentGreen: { backgroundColor: TEAL },
  accentAmber: { backgroundColor: AMBER },
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
  iconGreen: { backgroundColor: '#ccfbf1' },
  iconAmber: { backgroundColor: '#fef3c7' },
  textBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Tajawal_700Bold',
    color: '#374151',
  },
  titleGreen: { color: '#0f766e' },
  titleAmber: { color: '#92400e' },
  desc: {
    fontSize: 13,
    fontFamily: 'Tajawal_500Medium',
    color: '#64748b',
    lineHeight: 18,
  },
  logoRow: {
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
    fontSize: 11,
    fontFamily: 'Tajawal_700Bold',
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
  radioGreen: { borderColor: TEAL },
  radioAmber: { borderColor: AMBER },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioDotGreen: { backgroundColor: TEAL },
  radioDotAmber: { backgroundColor: AMBER },
  secureRow: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  secureText: {
    fontSize: 12,
    fontFamily: 'Tajawal_500Medium',
    color: '#94a3b8',
  },
});
