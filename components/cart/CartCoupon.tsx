import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Tag } from "lucide-react-native";
import { useTranslation } from "react-i18next";

export const CartCoupon = () => {
  const { t } = useTranslation('cart');
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApply = () => {
    if (!code || applied) return;

    setLoading(true);

    // محاكاة طلب API (Validation)
    setTimeout(() => {
      setLoading(false);
      setApplied(true);
      
      // بديل لـ sonner toast في الموبايل هو Alert أو مكتبة react-native-toast-message
      Alert.alert(
        t('CartCoupon.success_title' || 'Success'), 
        t('CartCoupon.success', { code })
      );
    }, 1500);
  };

  return (
    <View className="space-y-3 w-full">
      {/* Label */}
      <View className="flex-row items-center space-x-2 mb-1">
        <Tag size={16} color="#334155" />
        <Text className="text-sm font-medium text-slate-700">
          {t('CartCoupon.label')}
        </Text>
      </View>

      {/* Input & Button Container */}
      <View className="flex-row space-x-2">
        <View className="flex-1">
          <TextInput
            placeholder={t('CartCoupon.placeholder')}
            value={code}
            onChangeText={(text) => setCode(text)}
            editable={!applied && !loading}
            placeholderTextColor="#94a3b8"
            className={`bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 ${
              applied ? "opacity-60" : ""
            }`}
          />
        </View>

        <TouchableOpacity
          onPress={handleApply}
          disabled={!code || applied || loading}
          className={`px-6 justify-center rounded-lg border ${
            !code || applied || loading
              ? "bg-slate-100 border-slate-200"
              : "bg-white border-blue-600"
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#2563eb" />
          ) : (
            <Text
              className={`font-semibold ${
                !code || applied || loading ? "text-slate-400" : "text-blue-600"
              }`}
            >
              {applied ? t('CartCoupon.applied') : t('CartCoupon.apply')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Message */}
      {applied && (
        <Text className="text-xs text-green-600 font-medium ml-1">
          {t('CartCoupon.discountNote')}
        </Text>
      )}
    </View>
  );
};