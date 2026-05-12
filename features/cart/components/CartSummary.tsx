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
    <View 
      className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-6"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3
      }}
    >
      {/* Title */}
      <Text className="text-xl font-extrabold text-slate-900 mb-5">
        {t("CartSummary.title")}
      </Text>

      {/* Free Shipping Progress */}
      <View className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
        {hasFreeShipping ? (
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
              <PartyPopper size={24} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-green-700 text-sm">
                {t("CartSummary.freeShippingUnlocked")}
              </Text>
              <Text className="text-xs text-green-600 mt-0.5">
                {t("CartSummary.freeShippingMessage")}
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <View className="flex-row items-center justify-between mb-2.5">
              <View className="flex-row items-center gap-2">
                <Truck size={18} color="#2563eb" />
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                  {t("CartSummary.freeShippingProgress")}
                </Text>
              </View>
              <Text className="text-xs font-bold text-blue-600">
                {progressPercent.toFixed(0)}%
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="h-2.5 bg-slate-200/60 rounded-full overflow-hidden mb-3">
              <View
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${progressPercent}%` }}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-[13px] text-slate-600">
                <Text className="font-bold text-blue-600">
                  {amountRemaining.toFixed(0)} SAR
                </Text>
                {" "}{t("CartSummary.awayFromFreeShipping")}
              </Text>
              <View className="flex-row items-center gap-1">
                <Gift size={12} color="#94a3b8" />
                <Text className="text-[10px] font-bold text-slate-400">{freeShippingThreshold} SAR</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Price Breakdown */}
      <View className="gap-3.5 mb-6">
        <View className="flex-row justify-between">
          <Text className="text-slate-500 font-medium">{t("CartSummary.subtotal")}</Text>
          <Text className="text-slate-900 font-bold">{Number(subtotal).toFixed(0)} SAR</Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-slate-500 font-medium">{t("CartSummary.taxEstimated")}</Text>
          <Text className="text-slate-900 font-bold">{Number(summary.tax || 0).toFixed(0)} SAR</Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-slate-500 font-medium">{t("CartSummary.shipping")}</Text>
          {hasFreeShipping ? (
            <View className="flex-row items-center gap-2">
              <Text className="text-slate-300 line-through text-xs font-medium">
                {Number(summary.shipping_cost || 0).toFixed(0)} SAR
              </Text>
              <Text className="text-green-600 font-bold text-sm">
                {t("CartSummary.free")}
              </Text>
            </View>
          ) : (
            <Text className="text-slate-900 font-bold">
              {Number(summary.shipping_cost || summary.shipping || 0).toFixed(0)} SAR
            </Text>
          )}
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-slate-100 my-1" />

        {/* Grand Total */}
        <View className="flex-row justify-between items-center">
          <Text className="text-xl font-extrabold text-slate-900">
            {t("CartSummary.total")}
          </Text>
          <View className="items-end">
            <Text className="text-xl font-extrabold text-primary">
              {Number(summary.total || 0).toFixed(0)} SAR
            </Text>
            <Text className="text-[10px] text-slate-400 font-medium">{t("CartSummary.taxIncluded")}</Text>
          </View>
        </View>
      </View>

      {/* Coupon */}
      <View className="mb-6">
        <CartCoupon />
      </View>

      {/* Checkout Button */}
      <TouchableOpacity
        onPress={() => router.push("/checkout" as any)}
        className="bg-primary w-full py-4 rounded-2xl items-center mb-4 active:opacity-90 shadow-md shadow-primary/20"
        activeOpacity={0.8}
      >
        <Text className="text-white text-lg font-extrabold">
          {t("CartSummary.checkoutNow")}
        </Text>
      </TouchableOpacity>

      {/* Secure Checkout Badge */}
      <View className="flex-row items-center justify-center gap-2 bg-slate-50 py-2 rounded-xl">
        <Lock size={14} color="#64748b" />
        <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
          {t("CartSummary.secureCheckout")}
        </Text>
      </View>
    </View>
  );
};