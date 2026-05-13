import React from 'react';
import { View, Text, I18nManager } from 'react-native';
import { Truck, ShieldCheck, Headphones, RefreshCw } from "lucide-react-native";
import { useTranslation } from "react-i18next";

const TEAL = "#0d9488";

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
    <View className="space-y-4 px-4 pb-6">
      {badges.map((badge, idx) => (
        <View 
          key={idx} 
          className="flex-row items-center p-4 bg-white rounded-[32px] border border-slate-50 shadow-sm"
          style={{
            flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.03,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          {/* حاوية الأيقونة */}
          <View className="p-4 bg-teal-50 rounded-full items-center justify-center">
            <badge.icon size={22} color={TEAL} /> 
          </View>

          {/* النصوص */}
          <View className="mx-4 flex-1">
            <Text style={{ fontFamily: 'Tajawal_700Bold', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-slate-800 text-base">
              {t(`TrustBadges.${badge.titleKey}`)}
            </Text>
            <Text style={{ fontFamily: 'Tajawal_500Medium', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="text-xs text-slate-400 mt-0.5">
              {t(`TrustBadges.${badge.descKey}`)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};