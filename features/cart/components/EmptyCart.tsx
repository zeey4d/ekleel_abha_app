import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ShoppingBag } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { I18nManager } from "react-native";

const TEAL = "#0d9488";

export const EmptyCart = () => {
  const { t } = useTranslation("cart");

  return (
    <View className="flex-1 px-4 py-20 items-center justify-center">
      {/* Icon */}
      <View className="w-28 h-28 bg-teal-50 rounded-full items-center justify-center mb-8">
        <ShoppingBag size={48} color={TEAL} />
      </View>

      {/* Title */}
      <Text style={{ fontFamily: 'Tajawal_800ExtraBold' }} className="text-2xl text-slate-900 mb-3 text-center">
        {t("EmptyCart.title")}
      </Text>

      {/* Description */}
      <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-slate-500 text-center max-w-[320px] mb-10 leading-6">
        {t("EmptyCart.description")}
      </Text>

      {/* Start Shopping Button */}
      <TouchableOpacity
        onPress={() => router.replace("/(tabs)/(home)")}
        className="px-10 py-4 rounded-[32px] active:opacity-80 shadow-lg"
        style={{ backgroundColor: TEAL, shadowColor: TEAL, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }}
      >
        <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-white text-base">
          {t("EmptyCart.startShopping")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};