import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function CheckoutLayout() {
  const router = useRouter();
  const { t } = useTranslation('checkout');

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: 'cairo',
          fontSize: 18,
          fontWeight: '700',
          color: '#1e293b',
        },
        headerTitleAlign: 'center',
        headerLeft: () => (
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/cart');
              }
            }}
            style={styles.backBtn}
          >
            <ChevronRight size={24} color="#64748b" />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen
        name="shipping"
        options={{
          title: t('Header.title', 'إتمام الطلب'),
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          title: 'طريقة الدفع',
        }}
      />
      <Stack.Screen
        name="review"
        options={{
          title: 'مراجعة الطلب',
        }}
      />
      <Stack.Screen
        name="success"
        options={{
          title: 'تأكيد الطلب',
          headerLeft: () => null, // Hide back button on success
          gestureEnabled: false, // Prevent swiping back
        }}
      />
      <Stack.Screen
        name="callback"
        options={{
          title: 'جاري التحقق...',
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
});
