import React from "react";
import { View, Text, ScrollView, SafeAreaView, Pressable, Image, Dimensions, TouchableOpacity, Alert, Platform } from "react-native";
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
import { I18nManager } from "react-native";
import { cn } from "@/lib/utils";

export default function AccountScreen() {
  const TEAL = "#0d9488";
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
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-[#f8fafc]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        className="flex-1 px-4 bg-[#f8fafc]"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120, paddingTop: 10, minHeight: Platform.OS === 'web' ? '100vh' : '100%' }}
      >
        <View className="items-center justify-center mt-2 mb-4">
          {!isAuthenticated && (
            <View className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-50 mb-2 mt-4 items-center w-full">
                <Image
                source={require("@/assets/images/aka_g.png")}
                style={{ width: imageSize, height: imageSize }}
                resizeMode="contain"
                />
                <Text style={{ fontFamily: 'Tajawal_500Medium' }} className="text-slate-400 text-center mt-6">
                    {t('account:welcomeMessage', { defaultValue: 'أهلاً بك في إكليل أبها' })}
                </Text>
            </View>
          )}

          {isAuthenticated && user && (
            <View 
                className="items-center mb-6 w-full mt-6 p-8 "
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 12,
                    elevation: 2
                }}
            >
              <View className="w-24 h-24 bg-teal-50 rounded-full items-center justify-center mb-5 shadow-sm border-4 border-white overflow-hidden">
                 {(user as any).avatar ? (
                     <Image source={{ uri: (user as any).avatar }} style={{ width: '100%', height: '100%' }} />
                 ) : (
                     <Text style={{ fontFamily: 'Tajawal_800ExtraBold', color: TEAL }} className="text-4xl">
                        {user.full_name?.[0]?.toUpperCase() || user.firstname?.[0]?.toUpperCase() || (user as any).name?.[0]?.toUpperCase() || 'U'}
                     </Text>
                 )}
              </View>
              <Text style={{ fontFamily: 'Tajawal_800ExtraBold' }} className="text-xl text-slate-800 mb-1">
                {user.full_name || `${user.firstname} ${user.lastname}` || (user as any).name}
              </Text>
              <View className="bg-slate-50 px-5 py-1.5 rounded-full mt-3 border border-slate-100">
                <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-xs text-slate-400">
                  {user.email}
                </Text>
              </View>
            </View>
          )}

        </View>

        {/* Auth Section */}
        {isAuthenticated ? (
             <>
             <Text style={{ fontFamily: 'Tajawal_800ExtraBold', textAlign: isRtl ? 'right' : 'left' }} className="text-lg text-slate-800 mb-4 px-2">
               {t('account:title')}
             </Text>
             <View className="bg-white rounded-[32px] overflow-hidden mb-8 border border-slate-50 shadow-sm">
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
             <View className="items-center mb-10 mt-2 w-full">
            <TouchableOpacity
                onPress={() => router.push("/(auth)/login")}
                className={cn("bg-teal-600 w-full py-4.5 rounded-[32px] items-center flex-row justify-center active:bg-teal-700 active:scale-[0.98] transition-all shadow-lg", I18nManager.isRTL && "flex-row-reverse")}
                style={{ shadowColor: TEAL, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }}
            >
                <User color="white" size={20} className={I18nManager.isRTL ? "ml-3" : "mr-3"} />
                <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-white text-[16px]">
                  {t('account:login') || "تسجيل الدخول / إنشاء حساب"}
                </Text>
            </TouchableOpacity>
            </View>
        )}

        {/* Company Section */}
        <Text style={{ fontFamily: 'Tajawal_800ExtraBold', textAlign: isRtl ? 'right' : 'left' }} className="text-lg text-slate-800 mb-4 px-2">
          {t('account:companySection')}
        </Text>
        <View className="bg-white rounded-[32px] overflow-hidden mb-8 border border-slate-50 shadow-sm">
          {companyServices.map((item, index) => (
            <ServiceRow
              key={item.title}
              {...item}
              isLast={index === companyServices.length - 1}
            />
          ))}
        </View>

        {/* Help Section */}
        <Text style={{ fontFamily: 'Tajawal_800ExtraBold', textAlign: isRtl ? 'right' : 'left' }} className="text-lg text-slate-800 mb-4 px-2">
          {t('account:helpSection')}
        </Text>
        <View className="bg-white rounded-[32px] overflow-hidden mb-8 border border-slate-50 shadow-sm">
          {helpServices.map((item, index) => (
            <ServiceRow
              key={item.title}
              {...item}
              isLast={index === helpServices.length - 1}
            />
          ))}
        </View>

        {/* Preferences */}
        <Text style={{ fontFamily: 'Tajawal_800ExtraBold', textAlign: isRtl ? 'right' : 'left' }} className="text-lg text-slate-800 mb-4 px-2">
          {t('account:preferences')}
        </Text>
        <View className="bg-white rounded-[32px] overflow-hidden mb-8 border border-slate-50 shadow-sm">
          <ServiceRow
            Icon={Globe}
            title="اللغة / Language"
            value={languageNames[language] || language}
            href="/(tabs)/(account)/language"
            isLast
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
