import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { Check, Globe, ArrowLeft, ChevronLeft } from 'lucide-react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { router, Stack } from 'expo-router';
import type { SupportedLanguage } from '@/providers/LanguageProvider';

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
    <SafeAreaView className="flex-1 bg-slate-50">
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
                          headerTintColor: '#000',
                          headerLeft: () => (
                              <Pressable onPress={() => router.back()} >
                                  <ChevronLeft color="#000000ff" size={28} />
                              </Pressable>
                          ),
                      }} 
                  />

      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View className="flex-row items-center gap-3 mb-6 px-1">
          <Globe size={22} color="#6366f1" />
          <View className="flex-1">
            <Text className="text-sm text-slate-600 leading-5">
              اختر لغة التطبيق. سيتم إعادة تشغيل التطبيق عند تغيير اتجاه النص.
            </Text>
            <Text className="text-sm text-slate-400 leading-5 mt-1">
              Choose the app language. The app will restart when the text direction changes.
            </Text>
          </View>
        </View>

        {/* Language Options */}
        <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {LANGUAGES.map((lang, index) => {
            const isSelected = language === lang.code;
            const isLast = index === LANGUAGES.length - 1;

            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => handleSelect(lang.code)}
                disabled={isLoading}
                activeOpacity={0.6}
                className={`flex-row items-center px-5 py-4 ${
                  !isLast ? 'border-b border-slate-50' : ''
                } ${isSelected ? 'bg-primary/5' : ''}`}
              >
                {/* Flag */}
                <Text className="text-2xl mr-4">{lang.flag}</Text>

                {/* Language Names */}
                <View className="flex-1">
                  <Text
                    className={`text-base font-semibold ${
                      isSelected ? 'text-primary' : 'text-slate-900'
                    }`}
                  >
                    {lang.nativeName}
                  </Text>
                  <Text className="text-sm text-slate-400 mt-0.5">
                    {lang.englishName}
                  </Text>
                </View>

                {/* Checkmark */}
                {isSelected && (
                  <View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
                    <Check size={18} color="#ffffff" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Current Language Info */}
        <View className="mt-6 p-4 bg-slate-100/60 rounded-xl">
          <Text className="text-xs text-slate-400 text-center">
            اللغة الحالية: {LANGUAGES.find(l => l.code === language)?.nativeName}
          </Text>
          <Text className="text-xs text-slate-400 text-center mt-1">
            Current: {LANGUAGES.find(l => l.code === language)?.englishName}
          </Text>
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
