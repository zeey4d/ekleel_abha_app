import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CartCoupon } from "./CartCoupon";
import { Lock, Truck, Gift, PartyPopper, SaudiRiyal } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { I18nManager } from "react-native";

const TEAL = "#0d9488";

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
      className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm mb-6"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3
      }}
    >
      {/* Title */}
      <Text style={{ fontFamily: 'Tajawal_800ExtraBold', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-xl text-slate-900 mb-5">
        {t("CartSummary.title")}
      </Text>

      {/* Free Shipping Progress */}
      <View className="mb-6 p-4 bg-teal-50/50 rounded-[24px] border border-teal-100/50">
        {hasFreeShipping ? (
          <View className="flex-row items-center gap-3" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
            <View className="w-12 h-12 bg-teal-100 rounded-full items-center justify-center">
              <PartyPopper size={24} color={TEAL} />
            </View>
            <View className="flex-1">
              <Text style={{ fontFamily: 'Tajawal_700Bold', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-teal-900 text-sm">
                {t("CartSummary.freeShippingUnlocked")}
              </Text>
              <Text style={{ fontFamily: 'Tajawal_500Medium', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-xs text-teal-600 mt-0.5">
                {t("CartSummary.freeShippingMessage")}
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <View className="flex-row items-center justify-between mb-2.5" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
              <View className="flex-row items-center gap-2" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
                <Truck size={18} color={TEAL} />
                <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-xs text-slate-700 uppercase tracking-tight">
                  {t("CartSummary.freeShippingProgress")}
                </Text>
              </View>
              <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-xs text-teal-600">
                {progressPercent.toFixed(0)}%
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="h-2.5 bg-slate-200/60 rounded-full overflow-hidden mb-3">
              <View
                className="h-full rounded-full bg-teal-500"
                style={{ width: `${progressPercent}%` }}
              />
            </View>

            <View className="flex-row items-center justify-between" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
              <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-[13px] text-slate-600">
                <View className="flex-row items-center" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
                  <Text style={{ fontFamily: 'Tajawal_700Bold', color: TEAL }}>
                    {amountRemaining.toFixed(0)}
                  </Text>
                  <SaudiRiyal size={12} color={TEAL} style={{ marginHorizontal: 1 }} />
                </View>
                {" "}{t("CartSummary.awayFromFreeShipping")}
              </Text>
              <View className="flex-row items-center gap-1" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
                <Gift size={12} color="#94a3b8" />
                <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-[10px] text-slate-400">{freeShippingThreshold}</Text>
                <SaudiRiyal size={10} color="#94a3b8" />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Price Breakdown */}
      <View className="gap-3.5 mb-6">
        <View className="flex-row justify-between" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
          <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-slate-500">{t("CartSummary.subtotal")}</Text>
          <View className="flex-row items-center" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
            <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-slate-900">{Number(subtotal).toFixed(0)}</Text>
            <SaudiRiyal size={12} color="#475569" style={{ marginHorizontal: 2 }} />
          </View>
        </View>

        <View className="flex-row justify-between" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
          <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-slate-500">{t("CartSummary.taxEstimated")}</Text>
          <View className="flex-row items-center" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
            <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-slate-900">{Number(summary.tax || 0).toFixed(0)}</Text>
            <SaudiRiyal size={12} color="#475569" style={{ marginHorizontal: 2 }} />
          </View>
        </View>

        <View className="flex-row justify-between" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
          <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-slate-500">{t("CartSummary.shipping")}</Text>
          <View className="flex-row items-center gap-2" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
            {hasFreeShipping ? (
              <>
                <View className="flex-row items-center" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
                  <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-slate-300 line-through text-xs">
                    {Number(summary.shipping_cost || 0).toFixed(0)}
                  </Text>
                  <SaudiRiyal size={10} color="#cbd5e1" style={{ marginHorizontal: 1 }} />
                </View>
                <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-teal-600 text-sm">
                  {t("CartSummary.free")}
                </Text>
              </>
            ) : (
              <View className="flex-row items-center" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
                <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-slate-900">
                  {Number(summary.shipping_cost || summary.shipping || 0).toFixed(0)}
                </Text>
                <SaudiRiyal size={12} color="#475569" style={{ marginHorizontal: 2 }} />
              </View>
            )}
          </View>
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-slate-100 my-1" />

        {/* Grand Total */}
        <View className="flex-row justify-between items-center" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
          <Text style={{ fontFamily: 'Tajawal_800ExtraBold' }} className="text-xl text-slate-900">
            {t("CartSummary.total")}
          </Text>
          <View className="items-end" style={{ alignItems: I18nManager.isRTL ? 'flex-start' : 'flex-end' }}>
            <View className="flex-row items-center" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
              <Text style={{ fontFamily: 'Tajawal_800ExtraBold', color: TEAL }} className="text-2xl">
                {Number(summary.total || 0).toFixed(0)}
              </Text>
              <SaudiRiyal size={20} color={TEAL} style={{ marginHorizontal: 3 }} />
            </View>
            <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-[10px] text-slate-400">{t("CartSummary.taxIncluded")}</Text>
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
        className="w-full py-4 rounded-[24px] items-center mb-4 active:opacity-90 shadow-lg"
        style={{ backgroundColor: TEAL, shadowColor: TEAL, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }}
        activeOpacity={0.8}
      >
        <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-white text-lg">
          {t("CartSummary.checkoutNow")}
        </Text>
      </TouchableOpacity>

      {/* Secure Checkout Badge */}
      <View className="flex-row items-center justify-center gap-2 bg-slate-50 py-3 rounded-2xl" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
        <Lock size={14} color="#64748b" />
        <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-[11px] text-slate-500 uppercase tracking-wide">
          {t("CartSummary.secureCheckout")}
        </Text>
      </View>
    </View>
  );
};