import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
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

const GREEN = '#10b981';

export default function SuccessScreen() {
  const router = useRouter();
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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GREEN} />
      </SafeAreaView>
    );
  }

  if (!orderId || error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Package size={48} color="#94a3b8" />
        <Text style={styles.errorTitle}>لم يتم العثور على الطلب</Text>
        <Pressable onPress={() => router.push('/')} style={styles.homeBtn}>
          <Text style={styles.homeBtnText}>العودة للرئيسية</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <View style={styles.iconCircleInner}>
              <CheckCircle2 size={40} color={GREEN} />
            </View>
          </View>
          <Text style={styles.title}>شكرًا لتسوقك!</Text>
          <Text style={styles.subtitle}>تم استلام طلبك بنجاح وهو قيد التجهيز الآن.</Text>

          <View style={styles.orderBadge}>
            <Package size={14} color="#64748b" />
            <Text style={styles.orderBadgeText}>
              رقم الطلب: <Text style={styles.orderNumber}>#{order?.order_id ?? orderId}</Text>
            </Text>
          </View>
        </View>

        {/* Loyalty Points */}
        {pointsData && pointsData.points_earned > 0 && (
          <View style={styles.loyaltyCard}>
            <View style={styles.loyaltyHeader}>
              <View style={styles.loyaltyIcon}>
                <Coins size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.loyaltyTitle}>نقاط الولاء المكتسبة!</Text>
                <Text style={styles.loyaltySubtitle}>لقد كسبت نقاطاً مع هذا الطلب</Text>
              </View>
            </View>

            <View style={styles.loyaltyRow}>
              <View>
                <Text style={styles.loyaltyLabel}>النقاط من الطلب</Text>
                <Text style={styles.loyaltyPoints}>+{pointsData.points_earned}</Text>
              </View>
              {balance && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.loyaltyLabel}>الرصيد الإجمالي</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <TrendingUp size={14} color="#fef3c7" />
                    <Text style={styles.loyaltyTotal}>{balance.balance}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={() => router.push('/(tabs)')}
          style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.85 }]}
        >
          <ShoppingBag size={20} color="#fff" />
          <Text style={styles.continueBtnText}>مواصلة التسوق</Text>
        </Pressable>
      </View>
    </SafeAreaView>
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
    fontWeight: '700',
    color: '#1e293b',
  },
  homeBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  homeBtnText: {
    fontSize: 15,
    fontWeight: '600',
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
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconCircleInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#a7f3d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#064e3b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  orderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
  },
  orderBadgeText: {
    fontSize: 13,
    color: '#64748b',
  },
  orderNumber: {
    fontWeight: '700',
    color: '#0f172a',
  },
  loyaltyCard: {
    backgroundColor: '#f59e0b',
    borderRadius: 24,
    padding: 24,
    gap: 20,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loyaltyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loyaltyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  loyaltySubtitle: {
    fontSize: 13,
    color: '#fef3c7',
    marginTop: 2,
  },
  loyaltyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  loyaltyLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fef3c7',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  loyaltyPoints: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  loyaltyTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  bottomBar: {
    padding: 20,
    paddingBottom: 30,
  },
  continueBtn: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
