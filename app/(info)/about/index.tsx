import React from 'react';
import { View, ScrollView, Image, useWindowDimensions, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, Stack } from 'expo-router';
import { Heart, Award, Users, Target, Sparkles, Shield, ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';

import { I18nManager } from 'react-native';
import { cn } from '@/lib/utils';

interface ValueCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function ValueCard({ icon, title, description }: ValueCardProps) {
    return (
        <View className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200/80 mb-4">
            <View className={cn("flex-row items-center mb-4", I18nManager.isRTL && "flex-row-reverse")}>
                 <View className={cn("w-14 h-14 rounded-2xl bg-teal-50 items-center justify-center", I18nManager.isRTL ? "ml-4" : "mr-4")}>
                    {icon}
                </View>
                <Text className={cn("flex-1 text-lg font-bold text-slate-800 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{title}</Text>
            </View>
            <Text className={cn("text-slate-500 leading-relaxed font-tajawal text-sm", I18nManager.isRTL ? "text-right" : "text-left")}>{description}</Text>
        </View>
    );
}

export default function AboutPage() {
    const { t, i18n } = useTranslation('info');
    const isRtl = i18n.language === 'ar';
    const { width } = useWindowDimensions();

    const values = [
        {
            icon: <Shield size={28} color="#d4af37" />,
            title: t('about.values.authenticity.title'),
            description: t('about.values.authenticity.description'),
        },
        {
            icon: <Award size={28} color="#d4af37" />,
            title: t('about.values.excellence.title'),
            description: t('about.values.excellence.description'),
        },
        {
            icon: <Heart size={28} color="#d4af37" />,
            title: t('about.values.passion.title'),
            description: t('about.values.passion.description'),
        },
        {
            icon: <Users size={28} color="#d4af37" />,
            title: t('about.values.community.title'),
            description: t('about.values.community.description'),
        },
        {
            icon: <Target size={28} color="#d4af37" />,
            title: t('about.values.innovation.title'),
            description: t('about.values.innovation.description'),
        },
        {
            icon: <Sparkles size={28} color="#d4af37" />,
            title: t('about.values.trust.title'),
            description: t('about.values.trust.description'),
        },
    ];

    return (
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 60 }}>
            <Stack.Screen options={{ title: t('about.meta.title') }} />
            
            {/* Hero Section */}
            <View className="bg-teal-700 py-16 overflow-hidden relative mb-4">
                 <View className="absolute inset-0 opacity-10">
                    {/* Abstract background pattern placeholder */}
                </View>
                <View className="px-4 z-10 items-center">
                    <Text className="text-3xl md:text-5xl font-bold mb-4 text-white text-center leading-tight font-tajawal">
                        {t('about.hero.title')}
                    </Text>
                    <Text className="text-sm text-teal-100 text-center leading-relaxed px-4 font-tajawal">
                        {t('about.hero.subtitle')}
                    </Text>
                </View>
            </View>

            {/* Story Section */}
            <View className="py-8 px-4 bg-white mx-4 rounded-[32px] border border-slate-200/80 shadow-sm mb-6 mt-[-30px] z-20">
                <Text className={cn("text-xl font-bold text-slate-800 mb-4 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>
                    {t('about.story.title')}
                </Text>
                <View className="gap-3 text-slate-500 mb-6">
                    <Text className={cn("leading-6 text-slate-500 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('about.story.paragraph1')}</Text>
                    <Text className={cn("leading-6 text-slate-500 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('about.story.paragraph2')}</Text>
                    <Text className={cn("leading-6 text-slate-500 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('about.story.paragraph3')}</Text>
                </View>

                {/* Site Logo */}
                <View style={{ aspectRatio: 1 }} className="items-center justify-center bg-teal-50/50 rounded-[32px] p-8 border border-teal-100">
                    <Image
                        source={require('@/assets/images/aka_g.png')} 
                        className="w-32 h-32"
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* Mission Section */}
            <View className="py-8 px-4 bg-white mx-4 rounded-[32px] border border-slate-200/80 shadow-sm mb-6">
                <View className="items-center">
                    <Text className="text-xl font-bold text-slate-800 mb-4 text-center font-tajawal">
                        {t('about.mission.title')}
                    </Text>
                    <Text className="text-[15px] text-slate-500 leading-relaxed mb-8 text-center font-tajawal">
                        {t('about.mission.description')}
                    </Text>
                    
                    <View className={cn("flex-row flex-wrap justify-center gap-3 w-full", I18nManager.isRTL && "flex-row-reverse")}>
                        <View className="bg-slate-50 rounded-2xl p-5 shadow-sm w-[47%] items-center border border-slate-100">
                            <Text className="text-2xl font-bold text-teal-600 mb-1 font-tajawal">500+</Text>
                            <Text className="text-slate-500 font-tajawal text-xs text-center">{t('about.stats.products')}</Text>
                        </View>
                        <View className="bg-slate-50 rounded-2xl p-5 shadow-sm w-[47%] items-center border border-slate-100">
                            <Text className="text-2xl font-bold text-teal-600 mb-1 font-tajawal">50K+</Text>
                            <Text className="text-slate-500 font-tajawal text-xs text-center">{t('about.stats.customers')}</Text>
                        </View>
                        <View className="bg-slate-50 rounded-2xl p-5 shadow-sm w-full mt-1 items-center border border-slate-100">
                            <Text className="text-2xl font-bold text-teal-600 mb-1 font-tajawal">100%</Text>
                            <Text className="text-slate-500 font-tajawal text-xs text-center">{t('about.stats.authentic')}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Values Section */}
            <View className="py-4 px-4">
                <View className="mb-6">
                    <Text className="text-xl font-bold text-slate-800 mb-2 text-center font-tajawal">
                        {t('about.values.title')}
                    </Text>
                    <Text className="text-sm text-slate-500 text-center font-tajawal">
                        {t('about.values.subtitle')}
                    </Text>
                </View>
                <View>
                    {values.map((value, index) => (
                        <ValueCard key={index} {...value} />
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}
