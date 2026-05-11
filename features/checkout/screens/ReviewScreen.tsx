import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGetCartQuery } from '@/store/features/cart/cartSlice';
import { useCreateOrderMutation } from '@/store/features/orders/ordersSlice';
import { CheckoutSteps } from '@/features/checkout/components/CheckoutSteps';
import { OrderSummaryCard } from '@/features/checkout/components/OrderSummaryCard';
import { ChevronLeft, ChevronRight, CheckCircle, FileText } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

const GREEN = '#10b981';

export default function ReviewScreen() {
  const router = useRouter();
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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </SafeAreaView>
    );
  }

  const handlePlaceOrder = async () => {
    if (!termsAccepted) {
      Toast.show({ type: 'error', text1: 'يرجى الموافقة على الشروط والأحكام' });
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

      Toast.show({ type: 'success', text1: 'تم تأكيد الطلب بنجاح' });
      router.push({
        pathname: '/checkout/success',
        params: { order_id: String(orderId) },
      });
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || 'فشل إتمام الطلب، حاول مرة أخرى';
      Toast.show({ type: 'error', text1: errorMessage });
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <CheckoutSteps currentStep={3} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order review details could go here... for now just summary */}
        <OrderSummaryCard
          cart={cart}
          shippingCost={shippingCostNum}
          shippingLabel={
            shipping_method?.startsWith('Pickup') ? 'الاستلام من الفرع' : 'رسوم الشحن'
          }
        />

        {/* Terms and Conditions */}
        <Pressable
          onPress={() => setTermsAccepted(!termsAccepted)}
          style={styles.termsCard}
        >
          <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
            {termsAccepted && <CheckCircle size={14} color="#fff" />}
          </View>
          <View style={styles.termsTextBody}>
            <Text style={styles.termsText}>
              أوافق على <Text style={styles.termsLink}>الشروط والأحكام</Text> و
              <Text style={styles.termsLink}>سياسة الخصوصية</Text>
            </Text>
          </View>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        {/* Back button */}
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronRight size={18} color="#64748b" />
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
            <>
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.continueBtnText}>تأكيد الطلب</Text>
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
  termsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
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
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  termsTextBody: {
    flex: 1,
  },
  termsText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  termsLink: {
    color: GREEN,
    fontWeight: '700',
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
  continueBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
});
