import React from 'react';
import { View, Text } from 'react-native';
import { Truck, ShieldCheck, Headphones, RefreshCw } from "lucide-react-native";
import { useTranslation } from "react-i18next";

export const TrustBadges = () => {
  const { t } = useTranslation('home');

  const badges = [
    {
      icon: Truck,
      titleKey: "freeShipping",
      descKey: "freeShippingDesc",
    },
    {
      icon: ShieldCheck,
      titleKey: "securePayment",
      descKey: "securePaymentDesc",
    },
    {
      icon: Headphones,
      titleKey: "support",
      descKey: "supportDesc",
    },
    {
      icon: RefreshCw,
      titleKey: "easyReturns",
      descKey: "easyReturnsDesc",
    },
  ];

  return (
    // نستخدم flex-col للموبايل بدلاً من grid
    <View className="space-y-4 px-1">
      {badges.map((badge, idx) => (
        <View 
          key={idx} 
          className="flex-row items-center p-5 bg-white rounded-2xl border border-slate-100 shadow-sm"
          style={{
            // إضافة ظل خفيف يتناسب مع أندرويد و iOS
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          {/* حاوية الأيقونة */}
          <View className="p-3 bg-blue-50 rounded-full items-center justify-center">
            <badge.icon size={24} color="#2563eb" /> 
          </View>

          {/* النصوص */}
          <View className="ml-4 flex-1">
            <Text className="font-bold text-slate-900 text-base">
              {t(`TrustBadges.${badge.titleKey}`)}
            </Text>
            <Text className="text-sm text-slate-500 mt-0.5">
              {t(`TrustBadges.${badge.descKey}`)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};