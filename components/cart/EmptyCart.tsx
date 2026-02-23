import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ShoppingBag } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

export const EmptyCart = () => {
  const { t } = useTranslation("cart");

  return (
    <View className="flex-1 px-4 py-20 items-center justify-center">
      {/* Icon */}
      <View className="w-24 h-24 bg-slate-50 rounded-full items-center justify-center mb-6">
        <ShoppingBag size={40} color="#cbd5e1" />
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold text-slate-900 mb-2 text-center">
        {t("EmptyCart.title")}
      </Text>

      {/* Description */}
      <Text className="text-slate-500 text-center max-w-[320px] mb-8 leading-6">
        {t("EmptyCart.description")}
      </Text>

      {/* Start Shopping Button */}
      <TouchableOpacity
        onPress={() => router.replace("/(tabs)/(home)")}
        className="bg-primary px-8 py-3.5 rounded-xl active:opacity-80"
      >
        <Text className="text-white text-base font-semibold">
          {t("EmptyCart.startShopping")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};