import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl,
  SafeAreaView,
  TouchableOpacity
} from "react-native";
import { useGetCartQuery, useGetGuestCartQuery } from "@/store/features/cart/cartSlice";
import { CartItem } from "../components/CartItem";
import { CartSummary } from "../components/CartSummary";
import { EmptyCart } from "../components/EmptyCart";
import { CartRecommendations } from "../components/CartRecommendations";
import { authStorage } from "@/lib/authStorage";
import { useTranslation } from "react-i18next";
import { ShoppingBag, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { I18nManager } from "react-native";

const TEAL = "#0d9488";

export default function CartScreen() {
  const { t } = useTranslation("cart");
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  // Check auth and session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const auth = await authStorage.isAuthenticated();
      setIsAuthenticated(auth);
      
      if (!auth) {
        const sid = await authStorage.ensureGuestSessionId();
        setGuestSessionId(sid);
      }
      setIsAuthChecked(true);
    };
    checkAuth();
  }, []);

  const { 
    data: userCart, 
    isLoading: isLoadingUser, 
    refetch: refetchUser 
  } = useGetCartQuery(undefined, {
    skip: !isAuthenticated || !isAuthChecked
  });

  const {
    data: guestCart,
    isLoading: isLoadingGuest,
    refetch: refetchGuest,
    error: guestError
  } = useGetGuestCartQuery(
    { session_id: guestSessionId || "" },
    { skip: isAuthenticated || !guestSessionId || !isAuthChecked }
  );

  const cart = isAuthenticated ? userCart : guestCart;
  const isLoading = !isAuthChecked || (isAuthenticated ? isLoadingUser : isLoadingGuest);
  const cartItems = cart?.ids?.map((id: any) => cart.entities[id]) || [];
  const itemCount = cart?.summary?.item_count || 0;

  const onRefresh = useCallback(() => {
    if (isAuthenticated) {
      refetchUser();
    } else if (guestSessionId) {
      refetchGuest();
    }
  }, [isAuthenticated, guestSessionId]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center">
        <ActivityIndicator size="large" color={TEAL} />
        <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="mt-4 text-slate-500">{t("Common.loading")}</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#f8fafc]">
        <View className="px-4 py-4 flex-row items-center gap-3" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm border border-slate-50">
            {I18nManager.isRTL ? <ChevronRight size={20} color="#1e293b" /> : <ChevronLeft size={20} color="#1e293b" />}
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-xl text-slate-900">{t("Header.title")}</Text>
        </View>
        <EmptyCart />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#f8fafc]">
      {/* <View className="px-4 py-4 flex-row items-center justify-between" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
        <View className="flex-row items-center gap-3" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm border border-slate-50">
            {I18nManager.isRTL ? <ChevronRight size={20} color="#1e293b" /> : <ChevronLeft size={20} color="#1e293b" />}
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-xl text-slate-900">{t("Header.title")}</Text>
        </View>
        
        <View className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-slate-50">
          <ShoppingBag size={20} color={TEAL} />
          {itemCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1 border-2 border-white">
              <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-white text-[10px]">{itemCount}</Text>
            </View>
          )}
        </View>
      </View> */}

      <ScrollView
        style={{ flex: 1 }}
        className="bg-[#f8fafc]"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={TEAL} />
        }
      >
        <View className="p-4 gap-4">
            <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-sm text-slate-500 px-2">
              {itemCount} {t("Header.items")}
            </Text> 
          {/* Cart Items List */}
          <View className="gap-3">
            {cartItems.map((item: any) => (
              <CartItem key={item.id} item={item} />
            ))}
          </View>

          {/* Secure Shopping Info */}
          <View className="flex-row items-start gap-3 bg-teal-50/50 p-4 rounded-[24px] border border-teal-100" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
            <ShieldCheck size={20} color={TEAL} />
            <View className="flex-1">
              <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-sm text-teal-900 mb-0.5" >
                {t("SecureProps.title")}
              </Text>
              <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-xs text-teal-700 leading-4" >
                {t("SecureProps.description")}
              </Text>
            </View>
          </View>

          {/* Summary Section */}
          <CartSummary summary={cart?.summary} />

          {/* Recommendations */}
          <CartRecommendations />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}