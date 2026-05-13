import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { Check, Globe, ArrowLeft, ChevronLeft } from 'lucide-react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { router, Stack } from 'expo-router';
import type { SupportedLanguage } from '@/providers/LanguageProvider';
import { I18nManager } from 'react-native';
import { cn } from '@/lib/utils';

// ─── Supported Languages ───────────────────────────────────
const LANGUAGES: {
  code: SupportedLanguage;
  nativeName: string;
  englishName: string;
  flag: string;
}[] = [
  { code: 'ar', nativeName: 'العربية',  englishName: 'Arabic',  flag: '🇸🇦' },
  { code: 'en', nativeName: 'English',   englishName: 'English', flag: '🇺🇸' },
];

// ─── Screen ────────────────────────────────────────────────

export default function LanguageScreen() {
  const { language, changeLanguage, isLoading } = useLanguage();

  const handleSelect = async (lang: SupportedLanguage) => {
    if (lang === language || isLoading) return;
    await changeLanguage(lang);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      {/* <View className="flex-row items-center px-4 py-4 border-b border-slate-100 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 active:bg-slate-100"
        >
          <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-slate-900">اللغة / Language</Text>
        </View>
        <View className="w-10" />
      </View> */}
                  <Stack.Screen 
                      options={{ 
                          title: 'اللغة / Language',
                          headerShown: true,
                          headerBackTitle: "", 
                          headerTintColor: '#0f172a',
                          headerTitleStyle: { fontFamily: 'Tajawal_700Bold', fontSize: 18 },
                          headerLeft: () => (
                              <Pressable onPress={() => router.back()} className="px-2" >
                                  <ChevronLeft color="#0f172a" size={28} style={I18nManager.isRTL ? { transform: [{ rotate: '180deg' }] } : {}} />
                              </Pressable>
                          ),
                      }} 
                  />

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Description */}
        <View className={cn("flex-row items-center gap-3 mb-8 px-2 bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-200 dark:border-slate-800/80 shadow-sm", I18nManager.isRTL && "flex-row-reverse")}>
          <View className="bg-teal-50 dark:bg-teal-900/10 p-3 rounded-2xl">
            <Globe size={24} className="text-teal-600" />
          </View>
          <View className="flex-1">
            <Text className={cn("text-sm font-bold text-slate-700 dark:text-slate-300 font-tajawal mb-1", I18nManager.isRTL ? "text-right" : "text-left")}>
              اختر لغة التطبيق. سيتم إعادة تشغيل التطبيق عند تغيير اللغة.
            </Text>
            <Text className={cn("text-[11px] text-slate-400 dark:text-slate-500 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>
              Choose the app language. The app will restart when the language changes.
            </Text>
          </View>
        </View>

        {/* Language Options */}
        <View className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
          {LANGUAGES.map((lang, index) => {
            const isSelected = language === lang.code;
            const isLast = index === LANGUAGES.length - 1;

            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => handleSelect(lang.code)}
                disabled={isLoading}
                activeOpacity={0.6}
                className={cn(
                  "flex-row items-center px-6 py-5",
                  !isLast && "border-b border-slate-100 dark:border-slate-800/50",
                  isSelected && "bg-teal-50/50 dark:bg-teal-900/10",
                  I18nManager.isRTL && "flex-row-reverse"
                )}
              >
                {/* Flag */}
                <Text className={cn("text-3xl", I18nManager.isRTL ? "ml-4" : "mr-4")}>{lang.flag}</Text>

                {/* Language Names */}
                <View className="flex-1">
                  <Text
                    className={cn(
                      "text-lg font-bold font-tajawal mb-1",
                      isSelected ? "text-teal-600 dark:text-teal-400" : "text-slate-800 dark:text-slate-200",
                      I18nManager.isRTL ? "text-right" : "text-left"
                    )}
                  >
                    {lang.nativeName}
                  </Text>
                  <Text className={cn("text-xs font-tajawal text-slate-400 dark:text-slate-500", I18nManager.isRTL ? "text-right" : "text-left")}>
                    {lang.englishName}
                  </Text>
                </View>

                {/* Checkmark */}
                {isSelected && (
                  <View className="w-8 h-8 bg-teal-600 rounded-full items-center justify-center shadow-sm">
                    <Check size={18} color="#ffffff" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Current Language Info */}
        <View className="mt-8 p-6 bg-white/50 dark:bg-slate-900/50 rounded-[32px] border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <Text className="text-[13px] font-bold font-tajawal text-slate-400 dark:text-slate-500 text-center mb-1">
            اللغة الحالية: {LANGUAGES.find(l => l.code === language)?.nativeName}
          </Text>
          <Text className="text-[11px] font-tajawal text-slate-400 dark:text-slate-500 text-center">
            Current: {LANGUAGES.find(l => l.code === language)?.englishName}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
