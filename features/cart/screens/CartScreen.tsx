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
import { ShoppingBag, ShieldCheck, ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";

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
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="mt-4 text-slate-500 font-medium">{t("Common.loading")}</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-4 py-4 flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900">{t("Header.title")}</Text>
        </View>
        <EmptyCart />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
      {/* Header */}
      {/* <View className="bg-white px-4 py-4 flex-row items-center justify-between border-b border-slate-100 shadow-sm z-10">

        
        <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center">
          <ShoppingBag size={20} color="#10b981" />
          {itemCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1 border-2 border-white">
              <Text className="text-white text-[10px] font-bold">{itemCount}</Text>
            </View>
          )}
        </View>
      </View> */}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor="#10b981" />
        }
      >
        <View className="p-4 gap-4">
                    <Text className="text-xs text-slate-400 px-2">
              {itemCount} {t("Header.items")}
            </Text> 
          {/* Cart Items List */}
          <View className="gap-3">
            {cartItems.map((item: any) => (
              <CartItem key={item.id} item={item} />
            ))}
          </View>

          {/* Secure Shopping Info */}
          <View className="flex-row items-start gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <ShieldCheck size={20} color="#3b82f6" />
            <View className="flex-1">
              <Text className="text-sm font-bold text-blue-900 mb-0.5">
                {t("SecureProps.title")}
              </Text>
              <Text className="text-xs text-blue-700 leading-4">
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