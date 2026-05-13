import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  I18nManager,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGetOrderDetailsQuery } from '@/store/features/orders/ordersSlice';
import { useClearCartMutation, useClearGuestCartMutation } from '@/store/features/cart/cartSlice';
import { useCalculateLoyaltyPointsQuery, useGetLoyaltyBalanceQuery } from '@/store/features/loyaltyPoint/loyaltyPointSlice';
import { authStorage } from '@/lib/authStorage';
import {
  CheckCircle2,
  ShoppingBag,
  Package,
  Coins,
  TrendingUp,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TEAL = '#0d9488';

export default function SuccessScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation('checkout');
  const insets = useSafeAreaInsets();
  const isRtl = i18n.language === 'ar' || I18nManager.isRTL;

  const params = useLocalSearchParams<{ order_id: string }>();
  const orderId = params.order_id;

  const [clearCart] = useClearCartMutation();
  const [clearGuestCart] = useClearGuestCartMutation();

  const { data: order, isLoading, error } = useGetOrderDetailsQuery(orderId || '', {
    skip: !orderId,
  });

  const orderTotal = parseFloat(String(order?.total ?? 0)) || 0;

  const { data: pointsData } = useCalculateLoyaltyPointsQuery(orderTotal, {
    skip: !orderTotal || orderTotal <= 0,
  });
  const { data: balance } = useGetLoyaltyBalanceQuery();

  // Clear cart
  useEffect(() => {
    const doClear = async () => {
      if (orderId) {
        const isAuth = await authStorage.isAuthenticated();
        if (isAuth) {
          clearCart().catch(() => {});
        } else {
          const sid = await authStorage.ensureGuestSessionId();
          clearGuestCart({ session_id: sid }).catch(() => {});
        }
      }
    };
    doClear();
  }, [orderId, clearCart, clearGuestCart]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={TEAL} />
      </View>
    );
  }

  if (!orderId || error) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Package size={60} color="#cbd5e1" />
        <Text style={styles.errorTitle}>{t('Review.addressMissing', 'لم يتم العثور على الطلب')}</Text>
        <Pressable onPress={() => router.push('/')} style={styles.homeBtn}>
          <Text style={styles.homeBtnText}>{t('Failed.returnToCart', 'العودة للرئيسية')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <View style={styles.iconCircleInner}>
              <CheckCircle2 size={44} color={TEAL} />
            </View>
          </View>
          <Text style={styles.title}>{t('Success.title', 'شكرًا لتسوقك!')}</Text>
          <Text style={styles.subtitle}>{t('Callback.pleaseWait', 'تم استلام طلبك بنجاح وهو قيد التجهيز الآن.')}</Text>

          <View style={[styles.orderBadge, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <Package size={14} color="#64748b" />
            <Text style={[styles.orderBadgeText, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Success.orderNumber', 'رقم الطلب')}: <Text style={styles.orderNumber}>#{order?.order_id ?? orderId}</Text>
            </Text>
          </View>
        </View>

        {/* Loyalty Points */}
        {pointsData && pointsData.points_earned > 0 && (
          <View style={styles.loyaltyCard}>
            <View style={[styles.loyaltyHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View style={styles.loyaltyIcon}>
                <Coins size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.loyaltyTitle, { textAlign: isRtl ? 'right' : 'left' }]}>
                  {t('Payment.installment', 'نقاط الولاء المكتسبة!')}
                </Text>
                <Text style={[styles.loyaltySubtitle, { textAlign: isRtl ? 'right' : 'left' }]}>
                  {t('Payment.tamaraDesc', 'لقد كسبت نقاطاً مع هذا الطلب')}
                </Text>
              </View>
            </View>

            <View style={[styles.loyaltyRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <View>
                <Text style={[styles.loyaltyLabel, { textAlign: isRtl ? 'right' : 'left' }]}>
                  {t('Review.items', { count: 0, defaultValue: 'النقاط من الطلب' })}
                </Text>
                <Text style={[styles.loyaltyPoints, { textAlign: isRtl ? 'right' : 'left' }]}>+{pointsData.points_earned}</Text>
              </View>
              {balance && (
                <View style={{ alignItems: isRtl ? 'flex-start' : 'flex-end' }}>
                  <Text style={styles.loyaltyLabel}>{t('Success.total', 'الرصيد الإجمالي')}</Text>
                  <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 4 }}>
                    <TrendingUp size={14} color="#fef3c7" />
                    <Text style={styles.loyaltyTotal}>{balance.balance}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Pressable
          onPress={() => router.push('/(tabs)')}
          style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.85 }]}
        >
          <ShoppingBag size={20} color="#fff" />
          <Text style={styles.continueBtnText}>{t('Failed.returnToCart', 'مواصلة التسوق')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
    color: '#1e293b',
  },
  homeBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  homeBtnText: {
    fontSize: 15,
    fontFamily: 'Tajawal_700Bold',
    color: '#475569',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
    gap: 24,
  },
  header: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconCircleInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#99f6e4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Tajawal_800ExtraBold',
    color: '#134e4a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Tajawal_500Medium',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  orderBadge: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
  },
  orderBadgeText: {
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium',
    color: '#64748b',
  },
  orderNumber: {
    fontFamily: 'Tajawal_700Bold',
    color: TEAL,
  },
  loyaltyCard: {
    backgroundColor: '#f59e0b',
    borderRadius: 32,
    padding: 24,
    gap: 20,
  },
  loyaltyHeader: {
    alignItems: 'center',
    gap: 12,
  },
  loyaltyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loyaltyTitle: {
    fontSize: 18,
    fontFamily: 'Tajawal_700Bold',
    color: '#fff',
  },
  loyaltySubtitle: {
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium',
    color: '#fef3c7',
    marginTop: 2,
  },
  loyaltyRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  loyaltyLabel: {
    fontSize: 12,
    fontFamily: 'Tajawal_700Bold',
    color: '#fef3c7',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  loyaltyPoints: {
    fontSize: 36,
    fontFamily: 'Tajawal_800ExtraBold',
    color: '#fff',
  },
  loyaltyTotal: {
    fontSize: 22,
    fontFamily: 'Tajawal_700Bold',
    color: '#fff',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  continueBtn: {
    backgroundColor: TEAL,
    borderRadius: 32,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  continueBtnText: {
    fontSize: 17,
    fontFamily: 'Tajawal_700Bold',
    color: '#fff',
  },
});
