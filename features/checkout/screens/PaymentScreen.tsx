import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Linking,
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
  Loader2,
  CheckCircle2,
  CreditCard,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GREEN = '#10b981';
const AMBER = '#f59e0b';

type PaymentMethod = 'online' | 'cod';

export default function PaymentScreen() {
  const router = useRouter();
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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </SafeAreaView>
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
      Toast.show({ type: 'error', text1: 'بيانات الطلب ناقصة، عد للخطوة السابقة' });
      return;
    }

    try {
      // We use a deep-link as the return URL so the app can handle callback
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
        // Persist tran_ref + order_id so callback screen can verify
        await AsyncStorage.setItem('paytabs_tran_ref', response.tran_ref);
        await AsyncStorage.setItem('paytabs_order_id', String(response.order_id));

        // Open PayTabs payment page in browser
        const canOpen = await Linking.canOpenURL(response.redirect_url);
        if (canOpen) {
          await Linking.openURL(response.redirect_url);
        } else {
          Toast.show({ type: 'error', text1: 'تعذر فتح صفحة الدفع' });
        }
      } else {
        throw new Error('No redirect URL from PayTabs');
      }
    } catch (error: any) {
      const rawMsg: string =
        error?.data?.error || error?.data?.message || error?.message || '';

      const isNetwork =
        rawMsg.toLowerCase().includes('curl') ||
        rawMsg.toLowerCase().includes('timed out') ||
        rawMsg.toLowerCase().includes('connection') ||
        rawMsg.toLowerCase().includes('network');

      const userMsg = isNetwork
        ? 'خدمة الدفع غير متاحة حالياً، يرجى المحاولة لاحقاً'
        : rawMsg || 'فشل إتمام الدفع';

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
    <SafeAreaView style={styles.root}>
      <CheckoutSteps currentStep={2} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment method selection */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIcon}>
              <CreditCard size={16} color={GREEN} />
            </View>
            <Text style={styles.cardTitle}>طريقة الدفع</Text>
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
            <Text style={styles.codTitle}>الدفع عند الاستلام</Text>
            <Text style={styles.codDesc}>
              ستقوم بدفع المبلغ نقداً عند استلام طلبك. يرجى التأكد من وجود المبلغ الكافي.
            </Text>
          </View>
        )}

        {/* Order summary */}
        <OrderSummaryCard
          cart={cart}
          shippingCost={shippingCostNum}
          shippingLabel={
            shipping_method?.startsWith('Pickup') ? 'الاستلام من الفرع' : 'رسوم الشحن'
          }
        />

        {/* Trust badge */}
        <View style={styles.trustRow}>
          <ShieldCheck size={14} color="#94a3b8" />
          <Text style={styles.trustText}>طلبك محمي بضمان 100% – نضمن حقك في الاسترجاع</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        {/* Back button */}
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronRight size={18} color="#64748b" />
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
            <>
              <ChevronLeft size={20} color="#fff" />
              <Text style={styles.continueBtnText}>
                {selectedPayment === 'cod' ? 'متابعة للمراجعة' : 'ادفع الآن عبر PayTabs'}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
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
  loadingText: { color: '#94a3b8', fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
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
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
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
    fontSize: 15,
    fontWeight: '700',
    color: '#92400e',
  },
  codDesc: {
    fontSize: 13,
    color: '#b45309',
    textAlign: 'center',
    lineHeight: 20,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    gap: 10,
  },
  backBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  continueBtn: {
    flex: 1,
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: GREEN,
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
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
});
