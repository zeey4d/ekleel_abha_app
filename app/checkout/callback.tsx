import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVerifyPaytabsCallbackMutation } from '@/store/features/payments/paymentsPaytabsSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const GREEN = '#10b981';

export default function CallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [verifyCallback] = useVerifyPaytabsCallbackMutation();
  const hasVerified = useRef(false);

  useEffect(() => {
    const handleVerification = async () => {
      if (hasVerified.current) return;
      hasVerified.current = true;

      try {
        const storedTranRef = await AsyncStorage.getItem('paytabs_tran_ref');
        const storedOrderId = await AsyncStorage.getItem('paytabs_order_id');

        const payload = {
          ...params,
          tran_ref: storedTranRef || undefined,
        };

        const result = await verifyCallback(payload).unwrap();

        if (result.status === 'success') {
          router.replace({
            pathname: '/checkout/success',
            params: { order_id: result.order_id || storedOrderId || '' },
          });
        } else {
          Toast.show({ type: 'error', text1: result.message || 'فشلت عملية الدفع' });
          router.replace('/checkout/payment');
        }
      } catch (error: any) {
        Toast.show({ type: 'error', text1: 'حدث خطأ أثناء التحقق من الدفع' });
        router.replace('/checkout/payment');
      }
    };

    handleVerification();
  }, [params, verifyCallback, router]);

  return (
    <SafeAreaView style={styles.root}>
      <ActivityIndicator size="large" color={GREEN} />
      <Text style={styles.text}>جاري التحقق من عملية الدفع...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 16,
  },
  text: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '600',
  },
});
