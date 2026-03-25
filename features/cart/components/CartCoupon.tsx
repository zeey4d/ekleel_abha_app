import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Tag } from "lucide-react-native";
import { useTranslation } from "react-i18next";

export const CartCoupon = () => {
  const { t } = useTranslation("cart");
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleApply = () => {
    if (!code || applied) return;

    setIsValidating(true);
    // Simulate API call
    setTimeout(() => {
      setIsValidating(false);
      setApplied(true);
      Alert.alert("✅", t("CartCoupon.success", { code }));
    }, 1000);
  };

  return (
    <View className="gap-2">
      {/* Label */}
      <View className="flex-row items-center gap-2">
        <Tag size={16} color="#334155" />
        <Text className="text-sm font-medium text-slate-700">
          {t("CartCoupon.label")}
        </Text>
      </View>

      {/* Input & Button Row */}
      <View className="flex-row gap-2">
        <TextInput
          placeholder={t("CartCoupon.placeholder")}
          value={code}
          onChangeText={setCode}
          editable={!applied}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900"
          placeholderTextColor="#94a3b8"
          autoCapitalize="characters"
        />
        <TouchableOpacity
          onPress={handleApply}
          disabled={!code || applied || isValidating}
          className={`px-4 py-2.5 rounded-lg border ${
            applied
              ? "bg-green-50 border-green-200"
              : !code || isValidating
              ? "bg-slate-50 border-slate-200"
              : "bg-white border-slate-300"
          }`}
          activeOpacity={0.7}
        >
          {isValidating ? (
            <ActivityIndicator size="small" color="#64748b" />
          ) : (
            <Text
              className={`text-sm font-medium ${
                applied ? "text-green-600" : !code ? "text-slate-400" : "text-slate-700"
              }`}
            >
              {applied ? t("CartCoupon.applied") : t("CartCoupon.apply")}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Discount Note */}
      {applied && (
        <Text className="text-xs text-green-600 font-medium">
          {t("CartCoupon.discountNote")}
        </Text>
      )}
    </View>
  );
};