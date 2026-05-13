import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  I18nManager,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGetCartQuery } from '@/store/features/cart/cartSlice';
import { useCreateOrderMutation } from '@/store/features/orders/ordersSlice';
import { CheckoutSteps } from '@/features/checkout/components/CheckoutSteps';
import { OrderSummaryCard } from '@/features/checkout/components/OrderSummaryCard';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TEAL = '#0d9488';

export default function ReviewScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation('checkout');
  const insets = useSafeAreaInsets();
  const isRtl = i18n.language === 'ar' || I18nManager.isRTL;

  const params = useLocalSearchParams<{
    address_id: string;
    shipping_method: string;
    shipping_cost: string;
    payment_method: string;
  }>();

  const { address_id, shipping_method, shipping_cost, payment_method } = params;
  const shippingCostNum = parseFloat(shipping_cost || '0') || 0;

  const [termsAccepted, setTermsAccepted] = useState(false);
  const { data: cart, isLoading: isCartLoading } = useGetCartQuery();
  const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();

  if (isCartLoading || !cart) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={TEAL} />
        <Text style={styles.loadingText}>{t('Payment.processing', 'جاري التحميل...')}</Text>
      </View>
    );
  }

  const handlePlaceOrder = async () => {
    if (!termsAccepted) {
      Toast.show({ 
        type: 'error', 
        text1: t('Payment.selectPlanFirst', 'يرجى الموافقة على الشروط والأحكام للمتابعة') 
      });
      return;
    }

    try {
      const isPickup = shipping_method?.startsWith('Pickup from Branch');
      
      const payload = {
        shipping_address_id: Number(address_id),
        payment_method: payment_method || 'cod',
        shipping_method: isPickup ? 'pickup' : (shipping_method || undefined),
        comment: shipping_method ? `Shipping Method: ${shipping_method}` : undefined,
      };

      const order = await createOrder(payload).unwrap();
      const orderId = order.order_id ?? order.id;

      Toast.show({ 
        type: 'success', 
        text1: t('AddNewAddress.success', 'تم تأكيد الطلب بنجاح') 
      });
      router.push({
        pathname: '/checkout/success',
        params: { order_id: String(orderId) },
      });
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || t('Payment.orderCreationFailed', 'فشل إتمام الطلب، حاول مرة أخرى');
      Toast.show({ type: 'error', text1: errorMessage });
    }
  };

  return (
    <View style={styles.root}>
      <CheckoutSteps currentStep={3} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <OrderSummaryCard
          cart={cart}
          shippingCost={shippingCostNum}
          shippingLabel={
            shipping_method?.startsWith('Pickup') 
              ? t('Review.delivery', 'الاستلام من الفرع') 
              : t('OrderSummary.shipping', 'رسوم الشحن')
          }
        />

        {/* Terms and Conditions */}
        <Pressable
          onPress={() => setTermsAccepted(!termsAccepted)}
          style={[styles.termsCard, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}
        >
          <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
            {termsAccepted && <CheckCircle size={14} color="#fff" />}
          </View>
          <View style={styles.termsTextBody}>
            <Text style={[styles.termsText, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Terms.text', 'أوافق على')}{' '}
              <Text style={styles.termsLink}>{t('Terms.termsLink', 'الشروط والأحكام')}</Text> {t('Terms.and', 'و')}
              <Text style={styles.termsLink}>{t('Terms.privacyLink', 'سياسة الخصوصية')}</Text>
            </Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 24), flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
        {/* Back button */}
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          {isRtl ? <ChevronRight size={20} color="#64748b" /> : <ChevronLeft size={20} color="#64748b" />}
        </Pressable>

        {/* Place Order button */}
        <Pressable
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder || !termsAccepted}
          style={({ pressed }) => [
            styles.continueBtn,
            pressed && { opacity: 0.85 },
            (isPlacingOrder || !termsAccepted) && { opacity: 0.5 },
          ]}
        >
          {isPlacingOrder ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={{ flexDirection: isRtl ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.continueBtnText}>{t('Payment.proceedToPayment', 'تأكيد الطلب')}</Text>
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
  loadingText: { 
    color: '#94a3b8', 
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium'
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  termsCard: {
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  termsTextBody: {
    flex: 1,
  },
  termsText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    fontFamily: 'Tajawal_500Medium',
  },
  termsLink: {
    color: TEAL,
    fontFamily: 'Tajawal_700Bold',
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
  continueBtnText: {
    fontSize: 16,
    fontFamily: 'Tajawal_700Bold',
    color: '#fff',
  },
});
