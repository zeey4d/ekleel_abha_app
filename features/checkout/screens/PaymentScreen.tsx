import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Linking,
  I18nManager,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGetCartQuery } from '@/store/features/cart/cartSlice';
import { useInitiatePaytabsCheckoutMutation } from '@/store/features/payments/paymentsPaytabsSlice';
import { CheckoutSteps } from '@/features/checkout/components/CheckoutSteps';
import { PaymentMethodCard } from '@/features/checkout/components/PaymentMethodCard';
import { OrderSummaryCard } from '@/features/checkout/components/OrderSummaryCard';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';

const TEAL = '#0d9488';
const AMBER = '#f59e0b';

type PaymentMethod = 'online' | 'cod';

export default function PaymentScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation('checkout');
  const insets = useSafeAreaInsets();
  const isRtl = i18n.language === 'ar' || I18nManager.isRTL;

  const params = useLocalSearchParams<{
    address_id: string;
    shipping_method: string;
    shipping_cost: string;
  }>();

  const { address_id, shipping_method, shipping_cost } = params;
  const shippingCostNum = parseFloat(shipping_cost || '0') || 0;

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('online');
  const { data: cart, isLoading: isCartLoading } = useGetCartQuery();
  const [initiatePaytabs, { isLoading: isRequestingPayment }] = useInitiatePaytabsCheckoutMutation();

  if (isCartLoading || !cart) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={TEAL} />
        <Text style={styles.loadingText}>{t('Payment.processing', 'جاري التحميل...')}</Text>
      </View>
    );
  }

  // ── COD → go to review ──────────────────────────────────────────
  const handleCOD = () => {
    router.push({
      pathname: '/checkout/review',
      params: {
        address_id,
        shipping_method: shipping_method || '',
        shipping_cost: shipping_cost || '0',
        payment_method: 'cod',
      },
    });
  };

  // ── PayTabs online payment ──────────────────────────────────────
  const handleOnlinePayment = async () => {
    if (!address_id) {
      Toast.show({ 
        type: 'error', 
        text1: t('Review.addressMissing', 'بيانات الطلب ناقصة، عد للخطوة السابقة') 
      });
      return;
    }

    try {
      const returnUrl = 'ekleel://checkout/callback';
      const isPickup = shipping_method?.startsWith('Pickup from Branch');

      const payload = {
        shipping_address_id: Number(address_id),
        payment_method: 'all',
        shipping_method: isPickup ? 'pickup' : (shipping_method || undefined),
        comment: shipping_method ? `Shipping Method: ${shipping_method}` : undefined,
        return_url: returnUrl,
      };

      const response = await initiatePaytabs(payload).unwrap();

      if (response.redirect_url) {
        await AsyncStorage.setItem('paytabs_tran_ref', response.tran_ref);
        await AsyncStorage.setItem('paytabs_order_id', String(response.order_id));

        const canOpen = await Linking.canOpenURL(response.redirect_url);
        if (canOpen) {
          await Linking.openURL(response.redirect_url);
        } else {
          Toast.show({ 
            type: 'error', 
            text1: t('Payment.paymentFailed', 'تعذر فتح صفحة الدفع') 
          });
        }
      } else {
        throw new Error('No redirect URL from PayTabs');
      }
    } catch (error: any) {
      const rawMsg: string = error?.data?.error || error?.data?.message || error?.message || '';
      const isNetwork = rawMsg.toLowerCase().includes('curl') || rawMsg.toLowerCase().includes('timed out') || rawMsg.toLowerCase().includes('connection') || rawMsg.toLowerCase().includes('network');
      const userMsg = isNetwork ? t('Callback.verificationError', 'خدمة الدفع غير متاحة حالياً، يرجى المحاولة لاحقاً') : rawMsg || t('Payment.paymentFailed', 'فشل إتمام الدفع');
      Toast.show({ type: 'error', text1: userMsg });
    }
  };

  const handleContinue = () => {
    if (selectedPayment === 'cod') {
      handleCOD();
    } else {
      handleOnlinePayment();
    }
  };

  return (
    <View style={styles.root}>
      <CheckoutSteps currentStep={2} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment method selection */}
        <View style={styles.card}>
          <View style={[styles.cardHeader, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={styles.headerIcon}>
              <CreditCard size={16} color={TEAL} />
            </View>
            <Text style={[styles.cardTitle, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Payment.selectPaymentMethod', 'طريقة الدفع')}
            </Text>
          </View>

          <PaymentMethodCard
            selected={selectedPayment}
            onSelect={setSelectedPayment}
          />
        </View>

        {/* COD confirmation box */}
        {selectedPayment === 'cod' && (
          <View style={styles.codBox}>
            <CheckCircle2 size={28} color={AMBER} />
            <Text style={styles.codTitle}>{t('Payment.cod', 'الدفع عند الاستلام')}</Text>
            <Text style={styles.codDesc}>
              {t('Payment.codNoteDesc', 'ستقوم بدفع المبلغ نقداً عند استلام طلبك. يرجى التأكد من وجود المبلغ الكافي.')}
            </Text>
          </View>
        )}

        {/* Order summary */}
        <OrderSummaryCard
          cart={cart}
          shippingCost={shippingCostNum}
          shippingLabel={
            shipping_method?.startsWith('Pickup') 
              ? t('Review.delivery', 'الاستلام من الفرع') 
              : t('OrderSummary.shipping', 'رسوم الشحن')
          }
        />

        {/* Trust badge */}
        <View style={[styles.trustRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
          <ShieldCheck size={14} color="#94a3b8" />
          <Text style={[styles.trustText, { textAlign: isRtl ? 'right' : 'left' }]}>
            {t('Payment.encryptionNote', 'طلبك محمي بضمان 100% – نضمن حقك في الاسترجاع')}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24), flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        {/* Back button */}
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          {isRtl ? <ChevronRight size={20} color="#64748b" /> : <ChevronLeft size={20} color="#64748b" />}
        </Pressable>

        {/* Continue button */}
        <Pressable
          onPress={handleContinue}
          disabled={isRequestingPayment}
          style={({ pressed }) => [
            styles.continueBtn,
            selectedPayment === 'cod' && styles.continueBtnAmber,
            pressed && { opacity: 0.85 },
            isRequestingPayment && { opacity: 0.6 },
          ]}
        >
          {isRequestingPayment ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
              {isRtl ? <ChevronLeft size={20} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} /> : <ChevronRight size={20} color="#fff" />}
              <Text style={styles.continueBtnText}>
                {selectedPayment === 'cod' 
                  ? t('Payment.continueToReview', 'متابعة للمراجعة') 
                  : t('Payment.payWith', { defaultValue: 'ادفع الآن عبر PayTabs' })}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
  },
  loadingText: { color: '#94a3b8', fontSize: 14, fontFamily: 'Tajawal_500Medium' },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 14,
  },
  cardHeader: {
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ccfbf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
    color: '#1e293b',
    flex: 1,
  },
  codBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#fde68a',
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  codTitle: {
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
    color: '#92400e',
  },
  codDesc: {
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium',
    color: '#b45309',
    textAlign: 'center',
    lineHeight: 20,
  },
  trustRow: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  trustText: {
    fontSize: 12,
    fontFamily: 'Tajawal_500Medium',
    color: '#94a3b8',
    flex: 1,
  },
  bottomBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  backBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  continueBtn: {
    flex: 1,
    backgroundColor: TEAL,
    borderRadius: 32,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  continueBtnAmber: {
    backgroundColor: AMBER,
    shadowColor: AMBER,
  },
  continueBtnText: {
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
    color: '#fff',
  },
});
