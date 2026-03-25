import React from "react";
import { View, Text, ScrollView, SafeAreaView, Pressable, Image, Dimensions, TouchableOpacity, Alert } from "react-native";
import {
  Bell,
  ChevronLeft,
  MessageSquare,
  QrCode,
  MapPin,
  Globe,
  Heart,
  Shield,
  FileText,
  Headphones,
  HelpCircle,
  Truck,
  RotateCcw,
  CreditCard,
  ListOrdered,
  User,
  LogOut
} from "lucide-react-native";

import ServiceRow from "@/components/info/ServiceRow";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { useGetMeQuery, useLogoutMutation } from "@/store/features/auth/authSlice";
import Toast from 'react-native-toast-message';

export default function AccountScreen() {
  const { t } = useTranslation(['account', 'info']);
  const { language } = useLanguage();
  const { width } = Dimensions.get("window");
  const isRtl = language === 'ar';
  const imageSize = width / 1.75;
  
  const { data: user, isLoading, error } = useGetMeQuery();
  const [logout] = useLogoutMutation();

  const isAuthenticated = !!user && !error;

  const handleLogout = async () => {
    try {
        await logout().unwrap();
        
        Toast.show({
            type: 'success',
            text1: t('account:logout'),
            text2: t('account:logoutSuccess', 'تم تسجيل الخروج بنجاح'),
        });
        
        router.replace("/(tabs)/(home)");
    } catch (error) {
        console.error("Logout failed", error);
        
        Toast.show({
            type: 'error',
            text1: t('account:error', 'خطأ'),
            text2: t('account:logoutFailed', 'فشل تسجيل الخروج'),
        });
    }
  };

  const languageNames: Record<string, string> = {
    ar: 'العربية',
    en: 'English',
  };

  const accountServices = [
    { Icon: ListOrdered, title: t('account:orders'), href: "/(tabs)/(account)/orders" },
    { Icon: MapPin, title: t('account:addresses'), href: "/(tabs)/(account)/addresses" },
    { Icon: User, title: t('account:profile'), href: "/(tabs)/(account)/profile" },
    { Icon: Heart, title: t('account:wishlist'), href: "/(tabs)/(wishlist)" }, // Assuming wishlist route
    { Icon: LogOut, title: t('account:logout'), onPress: handleLogout },
  ];

  const companyServices = [
    { Icon: MessageSquare, title: t('info:about.title'), href: "/(info)/about" },
    { Icon: Shield, title: t('info:privacyPolicy.title'), href: "/(info)/privacy-policy" },
    { Icon: FileText, title: t('info:termsOfService.title'), href: "/(info)/terms-of-service" },
  ];

  const helpServices = [
    { Icon: Headphones, title: t('info:contact.contact'), href: "/(info)/contact" },
    { Icon: HelpCircle, title: t('info:faq.title'), href: "/(info)/faq" },
    { Icon: Truck, title: t('info:shipping.title'), href: "/(info)/shipping" },
    { Icon: RotateCcw, title: t('info:returnPolicy.title'), href: "/(info)/return-policy" },
    { Icon: CreditCard, title: t('info:paymentMethods.title'), href: "/(info)/payment-methods" },
    // { Icon: MapPin, title: "تحديد موقع الصيدلية", href: "/locations" }, // Assuming this is kept as is or needs localization later
  ];

  return (
    <SafeAreaView className="flex-1 bg-black/2">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-4 pt-0"
      >
        <View className="flex-1 items-center justify-center mt-4">
          {!isAuthenticated && (
            <Image
              source={require("@/assets/images/aka_g.png")}
              style={{ width: imageSize, height: imageSize }}
              resizeMode="contain"
              className="mb-2"
            />
          )}

          {isAuthenticated && user && (
            <View className="items-center mb-8 w-full mt-6">
              <View className="w-28 h-28 bg-white rounded-full items-center justify-center mb-4 shadow-sm border-2 border-slate-50 overflow-hidden">
                 {(user as any).avatar ? (
                     <Image source={{ uri: (user as any).avatar }} style={{ width: '100%', height: '100%' }} />
                 ) : (
                     <Text className="text-4xl font-bold text-yellow-600">
                        {user.full_name?.[0]?.toUpperCase() || user.firstname?.[0]?.toUpperCase() || (user as any).name?.[0]?.toUpperCase() || 'U'}
                     </Text>
                 )}
              </View>
              <Text className="text-2xl font-bold text-slate-800 mb-1 font-cairo">
                {user.full_name || `${user.firstname} ${user.lastname}` || (user as any).name}
              </Text>
              <View className="bg-slate-100 px-4 py-1.5 rounded-full mt-1">
                <Text className="text-sm text-slate-600 font-medium">
                  {user.email}
                </Text>
              </View>
            </View>
          )}

        </View>

        {/* Auth Section */}
        {isAuthenticated ? (
             <>
             <Text className="text-lg font-bold text-slate-800 mb-3 px-1 text-right font-cairo">
               {t('account:title')}
             </Text>
             <View className="bg-white rounded-2xl overflow-hidden mb-8 border border-gray-50">
               {accountServices.map((item, index) => (
                 <ServiceRow
                   key={item.title}
                   {...item}
                   isLast={index === accountServices.length - 1}
                 />
               ))}
             </View>
           </>
        ) : (
             <View className="items-center mb-10 mt-2">
            <TouchableOpacity
                onPress={() => router.push("/(auth)/login")}
                className="bg-primary w-full py-3 rounded-full items-center flex-row justify-center active:opacity-80 shadow-sm"
            >
                <User color="white" size={24} style={{ marginRight: 8, marginLeft: isRtl ? 8 : 0 }} />
                <Text className="text-white text-lg font-bold font-cairo">
                  {t('account:login') || "تسجيل الدخول / إنشاء حساب"}
                </Text>
            </TouchableOpacity>
            </View>
        )}

        {/* Company Section */}
        <Text className="text-lg font-bold text-slate-800 mb-3 px-1 text-right font-cairo">
          {t('account:companySection')}
        </Text>
        <View className="bg-white rounded-2xl overflow-hidden mb-8 border border-gray-300">
          {companyServices.map((item, index) => (
            <ServiceRow
              key={item.title}
              {...item}
              isLast={index === companyServices.length - 1}
            />
          ))}
        </View>

        {/* Help Section */}
        <Text className="text-lg font-bold text-slate-800 mb-3 px-1 text-right font-cairo">
          {t('account:helpSection')}
        </Text>
        <View className="bg-white rounded-2xl overflow-hidden mb-8 border border-gray-300">
          {helpServices.map((item, index) => (
            <ServiceRow
              key={item.title}
              {...item}
              isLast={index === helpServices.length - 1}
            />
          ))}
        </View>

        {/* Preferences */}
        <Text className="text-lg font-bold text-slate-800 mb-3 px-1 text-right font-cairo">
          {t('account:preferences')}
        </Text>

        <View className="bg-white rounded-2xl  overflow-hidden border border-gray-300">
          <ServiceRow
            Icon={Globe}
            title="اللغة / Language"
            value={languageNames[language] || language}
            href="/(tabs)/(account)/language"
            isLast
          />
        </View>

        <View className="h-32" />
      </ScrollView>
    </SafeAreaView>
  );
}
