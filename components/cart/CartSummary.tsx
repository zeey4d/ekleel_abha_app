import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Lock, Truck, Gift, PartyPopper } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { CartCoupon } from "./CartCoupon";
import { useRouter } from "expo-router";
import { CartSummary as CartSummaryType } from "@/store/types";

interface CartSummaryProps {
  summary: CartSummaryType | null;
}

export const CartSummary = ({ summary }: CartSummaryProps) => {
  const { t } = useTranslation('cart');
  const router = useRouter();

  if (!summary) return null;

  // Safe number conversions
  const freeShippingThreshold = Number(summary.free_shipping_threshold) || 250;
  const subtotal = Number(summary.subtotal) || 0;
  const shippingCost = Number(summary.shipping_cost || summary.shipping || 0);
  const tax = Number(summary.tax) || 0;
  const total = Number(summary.total || summary.grand_total || 0); // Logic: if total has free shipping subtracted

  const amountRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const hasFreeShipping = subtotal >= freeShippingThreshold;

  // Final display total calculation if needed, but usually 'total' from backend is final.
  // However, the original code had a manual calculation for free shipping adjustment:
  // (hasFreeShipping ? (summary.total - (summary.shipping_cost || 0)) : summary.total)
  // We should respect that if backend total includes shipping even when free.
  // Ideally backend handles this. We will stick to the logic provided but using safe numbers.
  const displayTotal = hasFreeShipping ? (total - shippingCost) : total;

  return (
    <View className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-10">
      <Text className="text-lg font-bold text-slate-900 mb-4">
        {t('CartSummary.title')}
      </Text>

      {/* Free Shipping Progress Card */}
      <View className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        {hasFreeShipping ? (
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center">
              <PartyPopper size={20} color="#16a34a" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-bold text-green-700">
                {t('CartSummary.freeShippingUnlocked')}
              </Text>
              <Text className="text-xs text-green-600">
                {t('CartSummary.freeShippingMessage')}
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                <Truck size={16} color="#2563eb" />
                <Text className="text-xs font-semibold text-slate-700 ml-2">
                  {t('CartSummary.freeShippingProgress')}
                </Text>
              </View>
              <Text className="text-[10px] text-slate-500 font-bold">
                {progressPercent.toFixed(0)}%
              </Text>
            </View>

            {/* Progress Bar Container */}
            <View className="h-2.5 bg-slate-200 rounded-full overflow-hidden mb-2">
              {/* Actual Progress Filling */}
              <View 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${progressPercent}%` }} 
              />
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-slate-600">
                <Text className="font-bold text-blue-600">${amountRemaining.toFixed(2)}</Text>
                {' '}{t('CartSummary.awayFromFreeShipping')}
              </Text>
              <View className="flex-row items-center">
                <Gift size={12} color="#94a3b8" />
                <Text className="text-[10px] text-slate-400 ml-1">${freeShippingThreshold}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Breakdown Rows */}
      <View className="space-y-3 mb-6">
        <View className="flex-row justify-between">
          <Text className="text-slate-500">{t('CartSummary.subtotal')}</Text>
          <Text className="text-slate-900 font-medium">${subtotal.toFixed(2)}</Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-slate-500">{t('CartSummary.taxEstimated')}</Text>
          <Text className="text-slate-900 font-medium">${tax.toFixed(2)}</Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-slate-500">{t('CartSummary.shipping')}</Text>
          {hasFreeShipping ? (
            <View className="flex-row">
              <Text className="line-through text-slate-300 mr-2">
                ${shippingCost.toFixed(2)}
              </Text>
              <Text className="text-green-600 font-bold">{t('CartSummary.free')}</Text>
            </View>
          ) : (
            <Text className="text-slate-900 font-medium">
              ${shippingCost.toFixed(2)}
            </Text>
          )}
        </View>

        {/* Total Row */}
        <View className="border-t border-slate-100 my-2 pt-4 flex-row justify-between">
          <Text className="text-lg font-bold text-slate-900">{t('CartSummary.total')}</Text>
          <Text className="text-lg font-black text-blue-600">
            ${displayTotal.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Coupon Component */}
      <View className="mb-6">
        <CartCoupon />
      </View>

      {/* Checkout Button */}
      <TouchableOpacity 
        onPress={() => router.push('/checkout')} // Fallback if invalid
        className="w-full bg-blue-600 h-14 rounded-2xl items-center justify-center shadow-md active:bg-blue-700"
      >
        <Text className="text-white text-lg font-bold">
          {t('CartSummary.checkoutNow')}
        </Text>
      </TouchableOpacity>

      {/* Security Note */}
      <View className="flex-row justify-center items-center mt-4">
        <Lock size={12} color="#94a3b8" />
        <Text className="text-[10px] text-slate-400 ml-1 uppercase tracking-widest">
          {t('CartSummary.secureCheckout')}
        </Text>
      </View>
    </View>
  );
};