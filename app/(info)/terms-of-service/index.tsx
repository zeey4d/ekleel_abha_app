import React from 'react';
import { View, ScrollView, Pressable, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, Stack } from 'expo-router';
import {
    Scale, FileText, ShoppingCart, Truck, CreditCard,
    RotateCcw, Shield, AlertTriangle, Gavel, UserCheck,
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

export default function TermsOfServicePage() {
    const { t } = useTranslation('info');

    return (
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 60 }}>
            <Stack.Screen options={{ title: t('termsOfService.hero.title') }} />

            {/* Hero Section */}
            <View className="bg-teal-700 py-16 px-4 items-center relative overflow-hidden mb-4">
                <Image 
                  source={require("@/assets/images/aka_g.png")} 
                  className="w-24 h-24 mb-4" 
                  resizeMode="contain" 
                />
                <View className="w-16 h-16 rounded-2xl bg-teal-600/50 items-center justify-center mb-6">
                    <Scale size={32} color="#ccfbf1" />
                </View>
                <Text className="text-3xl font-bold mb-4 text-white text-center font-tajawal">
                    {t('termsOfService.hero.title')}
                </Text>
                <Text className="text-[15px] text-teal-100 text-center px-4 font-tajawal mb-2">
                    {t('termsOfService.hero.subtitle')}
                </Text>
                <Text className="text-xs text-teal-200/80 text-center font-tajawal">
                    {t('termsOfService.hero.lastUpdated')}
                </Text>
            </View>

            {/* Content Section */}
            <View className="py-4 px-4">
                <View className="bg-white rounded-[32px] shadow-sm border border-slate-200/80 p-6 mb-8">

                    {/* Introduction */}
                    <View className="mb-10 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <Text className={cn("text-slate-600 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>
                            {t('termsOfService.introduction')}
                        </Text>
                    </View>

                    {/* Section 1: Acceptance of Terms */}
                    <Section
                        icon={<FileText size={24} className="text-teal-600" />}
                        title={t('termsOfService.sections.acceptance.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('termsOfService.sections.acceptance.content')}</Text>
                    </Section>

                    {/* Section 2: Account Registration */}
                    <Section
                        icon={<UserCheck size={24} className="text-teal-600" />}
                        title={t('termsOfService.sections.account.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('termsOfService.sections.account.intro')}</Text>
                        <BulletPoint>{t('termsOfService.sections.account.points.accurate')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.account.points.confidential')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.account.points.responsible')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.account.points.age')}</BulletPoint>
                    </Section>

                    {/* Section 3: Products & Orders */}
                    <Section
                        icon={<ShoppingCart size={24} className="text-teal-600" />}
                        title={t('termsOfService.sections.orders.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('termsOfService.sections.orders.content')}</Text>
                        <BulletPoint>{t('termsOfService.sections.orders.points.prices')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.orders.points.availability')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.orders.points.cancel')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.orders.points.quality')}</BulletPoint>
                    </Section>

                    {/* Section 4: Payment */}
                    <Section
                        icon={<CreditCard size={24} className="text-teal-600" />}
                        title={t('termsOfService.sections.payment.title')}
                    >
                        <BulletPoint>{t('termsOfService.sections.payment.points.methods')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.payment.points.currency')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.payment.points.refunds')}</BulletPoint>
                    </Section>

                    {/* Section 5: Delivery */}
                    <Section
                        icon={<Truck size={24} className="text-teal-600" />}
                        title={t('termsOfService.sections.delivery.title')}
                    >
                        <BulletPoint>{t('termsOfService.sections.delivery.points.fees')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.delivery.points.freeShipping')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.delivery.points.times')}</BulletPoint>
                    </Section>

                    {/* Section 6: Returns & Refunds */}
                    <Section
                        icon={<RotateCcw size={24} className="text-teal-600" />}
                        title={t('termsOfService.sections.returns.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('termsOfService.sections.returns.intro')}</Text>
                        <BulletPoint>{t('termsOfService.sections.returns.points.period')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.returns.points.condition')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.returns.points.receipt')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.returns.points.refundTime')}</BulletPoint>
                        <Text className={cn("font-bold text-slate-800 mt-4 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('termsOfService.sections.returns.exceptions.title')}</Text>
                        <BulletPoint>{t('termsOfService.sections.returns.exceptions.opened')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.returns.exceptions.damaged')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.returns.exceptions.special')}</BulletPoint>
                    </Section>

                    {/* Section 7: Disclaimer */}
                    <Section
                        icon={<AlertTriangle size={24} className="text-teal-600" />}
                        title={t('termsOfService.sections.disclaimer.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('termsOfService.sections.disclaimer.content')}</Text>
                    </Section>

                    {/* Section 8: Intellectual Property */}
                    <Section
                        icon={<Shield size={24} className="text-teal-600" />}
                        title={t('termsOfService.sections.intellectual.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('termsOfService.sections.intellectual.content')}</Text>
                    </Section>

                    {/* Section 9: Governing Law */}
                    <Section
                        icon={<Gavel size={24} className="text-teal-600" />}
                        title={t('termsOfService.sections.governing.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('termsOfService.sections.governing.content')}</Text>
                    </Section>

                    {/* Section 10: Modifications */}
                    <Section
                        icon={<FileText size={24} className="text-teal-600" />}
                        title={t('termsOfService.sections.modifications.title')}
                    >
                        <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('termsOfService.sections.modifications.content')}</Text>
                    </Section>

                    {/* Contact Section */}
                    <View className="mt-8 p-6 bg-teal-50 rounded-2xl border border-teal-100">
                        <Text className={cn("text-lg font-bold text-slate-800 mb-2 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t('termsOfService.contact.title')}</Text>
                        <Text className={cn("text-slate-600 font-tajawal leading-relaxed", I18nManager.isRTL ? "text-right" : "text-left")}>
                            {t('termsOfService.contact.content')}
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
