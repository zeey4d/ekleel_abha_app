import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useGetCartQuery, useGetGuestCartQuery } from "@/store/features/cart/cartSlice";
import { CartList } from "@/components/cart/CartList";
import { CartSummary } from "@/components/cart/CartSummary";
import { CartRecommendations } from "@/components/cart/CartRecommendations";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { ShieldCheck } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { authStorage } from "@/lib/authStorage";

export default function CartPage() {
  const { t } = useTranslation("cart");
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await authStorage.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (!authenticated) {
          const sid = await authStorage.ensureGuestSessionId();
          setGuestSessionId(sid);
        } else {
          setGuestSessionId(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Fallback to guest mode
        const sid = await authStorage.ensureGuestSessionId();
        setGuestSessionId(sid);
      } finally {
        setIsAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  // Fetch cart data based on auth state
  const { data: userCart, isLoading: isLoadingUser } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });

  const {
    data: guestCart,
    isLoading: isLoadingGuest,
    error: guestError,
  } = useGetGuestCartQuery(
    { session_id: guestSessionId || "" },
    { skip: isAuthenticated || !guestSessionId }
  );

  const cart = isAuthenticated ? userCart : guestCart;
  const isLoading = !isAuthChecked || (isAuthenticated ? isLoadingUser : isLoadingGuest);

  // Loading State
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-slate-400 mt-3 text-sm">{t("Header.title")}...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State (guest cart)
  if (!isAuthenticated && guestError) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 px-4 py-16 items-center justify-center">
          <ShieldCheck size={48} color="#ef4444" />
          <Text className="text-xl font-bold text-slate-900 mt-4 mb-2">
            Error Loading Cart
          </Text>
          <Text className="text-slate-500 text-center mb-4">
            {(guestError as any)?.data?.message || "Unable to retrieve your guest cart."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty Cart State
  const isEmpty = !cart || cart.ids.length === 0;
  if (isEmpty) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <EmptyCart />
      </SafeAreaView>
    );
  }

  // Cart with Items
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="px-2"
      >
        {/* Page Header */}
        <View className="flex-row items-center gap-3 py-5 border-b border-slate-100 mb-4">
          <Text className="text-2xl font-bold text-slate-900">
            {t("Header.title")}
          </Text>
          <View className="bg-slate-100 px-3 py-1 rounded-full">
            <Text className="text-slate-600 text-sm font-medium">
              {cart.summary?.item_count || 0} {t("Header.items")}
            </Text>
          </View>
        </View>

        {/* Cart Items List */}
        <CartList cartItems={cart.ids.map((id) => cart.entities[id])} />

        {/* Secure Shopping Badge */}
        <View className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex-row items-start gap-3 mt-4">
          <ShieldCheck size={20} color="#2563eb" />
          <Text className="text-blue-700 text-sm flex-1 leading-5">
            <Text className="font-bold">{t("SecureProps.title")}</Text>{" "}
            {t("SecureProps.description")}
          </Text>
        </View>

        {/* Recommendations */}
        <View className="mt-6">
          <CartRecommendations />
        </View>

        {/* Order Summary */}
        <View className="mt-6">
          <CartSummary summary={cart.summary} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}