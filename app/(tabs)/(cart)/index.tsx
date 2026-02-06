import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useGetCartQuery, useGetGuestCartQuery } from "@/store/features/cart/cartSlice";
import { CartList } from "@/components/cart/CartList"; // تأكد من تحويل هذه المكونات أيضاً
import { CartSummary } from "@/components/cart/CartSummary";
import { CartRecommendations } from "@/components/cart/CartRecommendations";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { TrustBadges } from "@/components/home/TrustBadges";
import { ShieldCheck, ShoppingBag, ChevronLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next"; // البديل الشائع في RN
import { authStorage } from "@/lib/authStorage"; // بديل لـ cookieManager للموبايل (مثلاً باستخدام AsyncStorage)
import { useRouter } from "expo-router";

export default function CartScreen() {
  const { t } = useTranslation('cart');
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  useEffect(() => {
    const updateAuth = async () => {
      // في الموبايل نستخدم AsyncStorage أو SecureStore بدلاً من الكوكيز
      const authStatus = await authStorage.isAuthenticated();
      setIsAuthenticated(authStatus);

      if (!authStatus) {
        const sid = await authStorage.ensureGuestSessionId();
        setGuestSessionId(sid);
      } else {
        setGuestSessionId(null);
      }
      setIsAuthChecked(true);
    };

    updateAuth();
    // يمكنك استخدام Listener هنا إذا كان لديك نظام Global State
  }, []);

  const { data: userCart, isLoading: isLoadingUser } = useGetCartQuery(undefined, {
    skip: !isAuthenticated
  });

  const {
    data: guestCart,
    isLoading: isLoadingGuest,
    error: guestError
  } = useGetGuestCartQuery(
    { session_id: guestSessionId || '' },
    { skip: isAuthenticated || !guestSessionId }
  );

  const cart = isAuthenticated ? userCart : guestCart;
  const isLoading = !isAuthChecked || (isAuthenticated ? isLoadingUser : isLoadingGuest);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // حالة الخطأ
  if (!isAuthenticated && guestError) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-white">
        <ShieldCheck size={64} color="#ef4444" />
        <Text className="text-2xl font-bold text-slate-900 mt-4 mb-2 text-center">
          {t('Error Loading Cart')}
        </Text>
        <Text className="text-slate-600 mb-6 text-center">
          {(guestError as any)?.data?.message || "Unable to retrieve your guest cart."}
        </Text>
        <TouchableOpacity 
          onPress={() => router.push('/')}
          className="bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Return Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isEmpty = !cart || cart.ids.length === 0;

  if (isEmpty) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <EmptyCart  />
        <View className="p-4 items-center">
          <Text className="text-xs text-slate-300">
            Debug: Auth={isAuthenticated ? 'Yes' : 'No'} | Session={guestSessionId || 'None'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      
      <ScrollView className="flex-1 px-4 py-4">
        
        {/* Breadcrumbs - محاكاة بسيطة للموبايل */}
        <TouchableOpacity 
          className="flex-row items-center mb-6" 
          onPress={() => router.back()}
        >
          <ChevronLeft size={20} color="#64748b" />
          <Text className="text-slate-500 ml-1">{t('Breadcrumbs.home')}</Text>
        </TouchableOpacity>

        {/* Page Header */}
        <View className="flex-row items-center justify-between mb-8 border-b border-slate-100 pb-6">
          <Text className="text-3xl font-bold text-slate-900">{t('Header.title')}</Text>
          <View className="bg-slate-100 px-3 py-1 rounded-full">
            <Text className="text-slate-600 text-sm font-medium">
              {cart?.summary?.item_count || 0} {t('Header.items')}
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View className="space-y-8">
          {/* Cart List */}
          <CartList 
            cartItems={
              cart?.ids
                .map((id: string) => cart.entities[id])
                .filter((item): item is NonNullable<typeof item> => !!item) || []
            } 
          />

          {/* Secure Badge */}
          <View className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex-row items-start space-x-3">
            <ShieldCheck size={20} color="#1d4ed8" />
            <View className="flex-1 ml-2">
              <Text className="text-blue-700 text-sm">
                <Text className="font-bold">{t('SecureProps.title')}</Text> {t('SecureProps.description')}
              </Text>
            </View>
          </View>

          {/* Recommendations */}
          <CartRecommendations />

          {/* Summary */}
          <View className="mb-6">
            <CartSummary summary={cart?.summary || null} />
          </View>

          {/* Trust Badges */}
          <View className="mt-8 pt-8 border-t border-slate-100 mb-12">
            <TrustBadges />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}