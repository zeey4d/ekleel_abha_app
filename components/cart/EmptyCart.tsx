import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ShoppingBag } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

export const EmptyCart = () => {
  const { t } = useTranslation("cart");
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center px-6 py-20 bg-white">
      {/* Icon Container */}
      <View className="w-32 h-32 bg-slate-50 rounded-full items-center justify-center mb-8">
        <ShoppingBag size={48} color="#cbd5e1" />
      </View>

      {/* Text Content */}
      <Text className="text-2xl font-bold text-slate-900 mb-3 text-center">
        {t("EmptyCart.title")}
      </Text>

      <Text className="text-base text-slate-500 text-center mb-10 leading-6">
        {t("EmptyCart.description")}
      </Text>

      {/* Action Button */}
      <TouchableOpacity
        onPress={() => router.push("/home")}
        className="bg-blue-600 px-10 py-4 rounded-2xl shadow-sm active:bg-blue-700"
      >
        <Text className="text-white text-lg font-bold">
          {t("EmptyCart.startShopping")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
