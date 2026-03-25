import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CartCoupon } from "./CartCoupon";
import { Lock, Truck, Gift, PartyPopper } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

interface CartSummaryProps {
  summary: any;
}

export const CartSummary = ({ summary }: CartSummaryProps) => {
  const { t } = useTranslation("cart");

  if (!summary) return null;

  // Calculate free shipping progress
  const freeShippingThreshold = summary.free_shipping_threshold || 250;
  const subtotal = summary.subtotal || 0;
  const amountRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const hasFreeShipping = subtotal >= freeShippingThreshold;

  return (
    <View className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      {/* Title */}
      <Text className="text-lg font-bold text-slate-900 mb-4">
        {t("CartSummary.title")}
      </Text>

      {/* Free Shipping Progress */}
      <View className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
        {hasFreeShipping ? (
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
              <PartyPopper size={20} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-green-700">
                {t("CartSummary.freeShippingUnlocked")}
              </Text>
              <Text className="text-sm text-green-600">
                {t("CartSummary.freeShippingMessage")}
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <Truck size={16} color="#2563eb" />
                <Text className="text-sm font-medium text-slate-700">
                  {t("CartSummary.freeShippingProgress")}
                </Text>
              </View>
              <Text className="text-xs text-slate-500">
                {progressPercent.toFixed(0)}%
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="h-2.5 bg-slate-200 rounded-full overflow-hidden mb-2">
              <View
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${progressPercent}%` }}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-600">
                <Text className="font-semibold text-blue-600">
                  ${amountRemaining.toFixed(2)}
                </Text>
                {" "}{t("CartSummary.awayFromFreeShipping")}
              </Text>
              <View className="flex-row items-center gap-1">
                <Gift size={12} color="#94a3b8" />
                <Text className="text-xs text-slate-400">${freeShippingThreshold}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Price Breakdown */}
      <View className="gap-3 mb-5">
        {/* Subtotal */}
        <View className="flex-row justify-between">
          <Text className="text-slate-600">{t("CartSummary.subtotal")}</Text>
          <Text className="text-slate-600">${Number(subtotal).toFixed(2)}</Text>
        </View>

        {/* Tax */}
        <View className="flex-row justify-between">
          <Text className="text-slate-600">{t("CartSummary.taxEstimated")}</Text>
          <Text className="text-slate-600">${Number(summary.tax || 0).toFixed(2)}</Text>
        </View>

        {/* Shipping */}
        <View className="flex-row justify-between">
          <Text className="text-slate-600">{t("CartSummary.shipping")}</Text>
          {hasFreeShipping ? (
            <View className="flex-row items-center gap-2">
              <Text className="text-slate-400 line-through text-sm">
                ${Number(summary.shipping_cost || 0).toFixed(2)}
              </Text>
              <Text className="text-green-600 font-medium">
                {t("CartSummary.free")}
              </Text>
            </View>
          ) : (
            <Text className="text-slate-600">
              ${Number(summary.shipping_cost || summary.shipping || 0).toFixed(2)}
            </Text>
          )}
        </View>

        {/* Divider + Total */}
        <View className="border-t border-slate-100 pt-3 flex-row justify-between">
          <Text className="text-lg font-bold text-slate-900">
            {t("CartSummary.total")}
          </Text>
          <Text className="text-lg font-bold text-slate-900">
            ${(hasFreeShipping
              ? (summary.total - (summary.shipping_cost || summary.shipping || 0))
              : summary.total
            ).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Coupon */}
      <View className="mb-5">
        <CartCoupon />
      </View>

      {/* Checkout Button */}
      <TouchableOpacity
        onPress={() => router.push("/checkout" as any)}
        className="bg-primary w-full py-3.5 rounded-xl items-center mb-3 active:opacity-80"
        activeOpacity={0.8}
      >
        <Text className="text-white text-lg font-semibold">
          {t("CartSummary.checkoutNow")}
        </Text>
      </TouchableOpacity>

      {/* Secure Checkout Badge */}
      <View className="flex-row items-center justify-center gap-2">
        <Lock size={12} color="#94a3b8" />
        <Text className="text-xs text-slate-400">
          {t("CartSummary.secureCheckout")}
        </Text>
      </View>
    </View>
  );
};