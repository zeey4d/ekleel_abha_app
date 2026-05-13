import React from 'react';
import { View, ScrollView, Pressable, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, Stack } from 'expo-router';
import {
    Shield, Eye, Database, Lock, Share2, Cookie,
    UserCheck, Bell, Mail,
    ChevronLeft
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { I18nManager } from 'react-native';
import { cn } from '@/lib/utils';

interface SectionProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}

function Section({ icon, title, children }: SectionProps) {
    return (
        <View className="mb-10">
            <View className={cn("flex-row items-center gap-3 mb-5", I18nManager.isRTL && "flex-row-reverse")}>
                <View className="w-10 h-10 rounded-2xl bg-teal-50 items-center justify-center">
                    {icon}
                </View>
                <Text className={cn("text-lg font-bold text-slate-800 flex-1 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{title}</Text>
            </View>
            <View className={cn("gap-4", I18nManager.isRTL ? "pr-14" : "pl-14")}>
                {children}
            </View>
        </View>
    );
}

interface BulletPointProps {
    children: string;
}

function BulletPoint({ children }: BulletPointProps) {
    return (
        <View className={cn("flex-row items-start gap-2", I18nManager.isRTL && "flex-row-reverse")}>
            <View className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2" />
            <Text className={cn("text-slate-500 leading-relaxed flex-1 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{children}</Text>
        </View>
    );
}

export default function PrivacyPolicyPage() {
    const { t } = useTranslation('info');

    return (
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 60 }}>
            <Stack.Screen options={{ title: t('privacyPolicy.hero.title') }} />

            {/* Hero Section */}
            <View className="bg-teal-700 py-16 px-4 items-center relative overflow-hidden mb-4">
                <Image 
                  source={require("@/assets/images/aka_g.png")} 
                  className="w-24 h-24 mb-4" 
                  resizeMode="contain" 
                />
                <View className="w-16 h-16 rounded-2xl bg-teal-600/50 items-center justify-center mb-6">
                    <Shield size={32} color="#ccfbf1" />
                </View>
                <Text className="text-3xl font-bold mb-4 text-white text-center font-tajawal">
                    {t('privacyPolicy.hero.title')}
                </Text>
                <Text className="text-[15px] text-teal-100 text-center px-4 font-tajawal mb-2">
                    {t('privacyPolicy.hero.subtitle')}
                </Text>
                <Text className="text-xs text-teal-200/80 text-center font-tajawal">
                    {t('privacyPolicy.hero.lastUpdated')}
                </Text>
            </View>

            {/* Content Section */}
            <View className="py-4 px-4">
                <View className="bg-white rounded-[32px] shadow-sm border border-slate-200/80 p-6 mb-8">

                    {/* Introduction */}
                    <View className="mb-10 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <Text className={cn("text-slate-600 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>
                            {t('privacyPolicy.introduction')}
                        </Text>
                    </View>

                    {/* Section 1: Information We Collect */}
                    <Section
                        icon={<Database size={24} className="text-teal-600" />}
                        title={t('privacyPolicy.sections.collection.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('privacyPolicy.sections.collection.intro')}</Text>
                        <Text className={cn("font-bold text-slate-800 mt-2 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('privacyPolicy.sections.collection.personal.title')}</Text>
                        <BulletPoint>{t('privacyPolicy.sections.collection.personal.name')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.collection.personal.contact')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.collection.personal.address')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.collection.personal.payment')}</BulletPoint>
                        <Text className={cn("font-bold text-slate-800 mt-4 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('privacyPolicy.sections.collection.automatic.title')}</Text>
                        <BulletPoint>{t('privacyPolicy.sections.collection.automatic.device')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.collection.automatic.browsing')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.collection.automatic.ip')}</BulletPoint>
                    </Section>

                    {/* Section 2: How We Use Your Information */}
                    <Section
                        icon={<Eye size={24} className="text-teal-600" />}
                        title={t('privacyPolicy.sections.usage.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('privacyPolicy.sections.usage.intro')}</Text>
                        <BulletPoint>{t('privacyPolicy.sections.usage.points.orders')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.usage.points.communication')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.usage.points.improve')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.usage.points.personalize')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.usage.points.security')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.usage.points.legal')}</BulletPoint>
                    </Section>

                    {/* Section 3: Information Sharing */}
                    <Section
                        icon={<Share2 size={24} className="text-teal-600" />}
                        title={t('privacyPolicy.sections.sharing.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('privacyPolicy.sections.sharing.intro')}</Text>
                        <BulletPoint>{t('privacyPolicy.sections.sharing.points.service')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.sharing.points.payment')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.sharing.points.delivery')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.sharing.points.legal')}</BulletPoint>
                        <Text className={cn("text-slate-500 leading-relaxed mt-4 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('privacyPolicy.sections.sharing.noSell')}</Text>
                    </Section>

                    {/* Section 4: Data Security */}
                    <Section
                        icon={<Lock size={24} className="text-teal-600" />}
                        title={t('privacyPolicy.sections.security.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('privacyPolicy.sections.security.content')}</Text>
                        <BulletPoint>{t('privacyPolicy.sections.security.measures.ssl')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.security.measures.encryption')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.security.measures.access')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.security.measures.monitoring')}</BulletPoint>
                    </Section>

                    {/* Section 5: Cookies */}
                    <Section
                        icon={<Cookie size={24} className="text-teal-600" />}
                        title={t('privacyPolicy.sections.cookies.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('privacyPolicy.sections.cookies.intro')}</Text>
                        <BulletPoint>{t('privacyPolicy.sections.cookies.types.essential')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.cookies.types.analytics')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.cookies.types.preferences')}</BulletPoint>
                        <Text className={cn("text-slate-500 leading-relaxed mt-4 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('privacyPolicy.sections.cookies.control')}</Text>
                    </Section>

                    {/* Section 6: Your Rights */}
                    <Section
                        icon={<UserCheck size={24} className="text-teal-600" />}
                        title={t('privacyPolicy.sections.rights.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('privacyPolicy.sections.rights.intro')}</Text>
                        <BulletPoint>{t('privacyPolicy.sections.rights.points.access')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.rights.points.correction')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.rights.points.deletion')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.rights.points.optout')}</BulletPoint>
                    </Section>

                    {/* Section 7: Data Retention */}
                    <Section
                        icon={<Database size={24} className="text-teal-600" />}
                        title={t('privacyPolicy.sections.retention.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('privacyPolicy.sections.retention.content')}</Text>
                    </Section>

                    {/* Section 8: Updates to Policy */}
                    <Section
                        icon={<Bell size={24} className="text-teal-600" />}
                        title={t('privacyPolicy.sections.updates.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('privacyPolicy.sections.updates.content')}</Text>
                    </Section>

                    {/* Section 9: Children's Privacy */}
                    <Section
                        icon={<Shield size={24} className="text-teal-600" />}
                        title={t('privacyPolicy.sections.children.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('privacyPolicy.sections.children.content')}</Text>
                    </Section>

                    {/* Contact Section */}
                    <View className="mt-8 p-6 bg-teal-50 rounded-2xl border border-teal-100">
                        <View className={cn("flex-row items-start gap-4", I18nManager.isRTL && "flex-row-reverse")}>
                            <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center shadow-sm">
                                <Mail size={24} className="text-teal-600" />
                            </View>
                            <View className="flex-1">
                                <Text className={cn("text-lg font-bold text-slate-800 mb-2 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('privacyPolicy.contact.title')}</Text>
                                <Text className={cn("text-slate-600 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>
                                    {t('privacyPolicy.contact.content')}
                                </Text>
                                <Text className={cn("text-slate-600 mt-3 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>
                                    <Text className="font-bold">Email:</Text> support@ekleelabha.com
                                </Text>
                                <Text className={cn("text-slate-600 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>
                                    <Text className="font-bold">Phone:</Text> 0575637926
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
