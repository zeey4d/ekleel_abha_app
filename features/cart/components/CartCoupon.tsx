import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Tag } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { I18nManager } from "react-native";

const TEAL = "#0d9488";

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
      <View className="flex-row items-center gap-2" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
        <Tag size={16} color={TEAL} />
        <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-sm text-slate-700">
          {t("CartCoupon.label")}
        </Text>
      </View>

      {/* Input & Button Row */}
      <View className="flex-row gap-2" style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
        <TextInput
          placeholder={t("CartCoupon.placeholder")}
          value={code}
          onChangeText={setCode}
          editable={!applied}
          style={{ fontFamily: 'Tajawal_500Medium', textAlign: I18nManager.isRTL ? 'right' : 'left' }}
          className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 shadow-sm"
          placeholderTextColor="#94a3b8"
          autoCapitalize="characters"
        />
        <TouchableOpacity
          onPress={handleApply}
          disabled={!code || applied || isValidating}
          className={`px-6 py-3 rounded-2xl border shadow-sm ${
            applied
              ? "bg-teal-50 border-teal-200"
              : !code || isValidating
              ? "bg-slate-50 border-slate-100"
              : "bg-white border-slate-200"
          }`}
          activeOpacity={0.7}
        >
          {isValidating ? (
            <ActivityIndicator size="small" color={TEAL} />
          ) : (
            <Text
              style={{ fontFamily: 'Tajawal_700Bold' }}
              className={`text-sm ${
                applied ? "text-teal-600" : !code ? "text-slate-400" : "text-slate-700"
              }`}
            >
              {applied ? t("CartCoupon.applied") : t("CartCoupon.apply")}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Discount Note */}
      {applied && (
        <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-xs text-teal-600 px-1">
          {t("CartCoupon.discountNote")}
        </Text>
      )}
    </View>
  );
};