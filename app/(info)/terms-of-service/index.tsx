import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, Stack } from 'expo-router';
import {
    Scale, FileText, ShoppingCart, Truck, CreditCard,
    RotateCcw, Shield, AlertTriangle, Gavel, UserCheck,
    ChevronLeft
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';

interface SectionProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}

function Section({ icon, title, children }: SectionProps) {
    return (
        <View className="mb-10">
            <View className="flex-row items-center gap-3 mb-4">
                <View className="w-10 h-10 rounded-full bg-yellow-500/10 items-center justify-center">
                    {icon}
                </View>
                <Text className="text-xl font-bold text-slate-900 flex-1 text-start">{title}</Text>
            </View>
            <View className="ps-[52px] gap-4">
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
        <View className="flex-row items-start gap-2 ps-4">
            <Text className="text-slate-600 mt-1">•</Text>
            <Text className="text-slate-600 leading-relaxed flex-1 text-start">{children}</Text>
        </View>
    );
}

export default function TermsOfServicePage() {
    const { t } = useTranslation('info');

    return (
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 40 }}>
            <Stack.Screen options={{ title: t('termsOfService.hero.title'),
                            headerLeft: () => (
                                              <Pressable onPress={() => router.back()} >
                                                  <ChevronLeft color="#000000ff" size={28} />
                                              </Pressable>
                                          ),
             }} />

            {/* Hero Section */}
            <View className="bg-foreground py-16 px-4 items-center">
                <View className="w-16 h-16 rounded-full bg-yellow-500/20 items-center justify-center mb-6">
                    <Scale size={32} color="#d4af37" />
                </View>
                <Text className="text-3xl font-bold mb-4 text-white text-center">
                    {t('termsOfService.hero.title')}
                </Text>
                <Text className="text-lg text-white/80 text-center px-4">
                    {t('termsOfService.hero.subtitle')}
                </Text>
                <Text className="text-sm text-white/60 mt-4 text-center">
                    {t('termsOfService.hero.lastUpdated')}
                </Text>
            </View>

            {/* Content Section */}
            <View className="py-8 px-4">
                <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

                    {/* Introduction */}
                    <View className="mb-10 p-5 bg-slate-50 rounded-xl border border-slate-100">
                        <Text className="text-slate-700 leading-relaxed text-start">
                            {t('termsOfService.introduction')}
                        </Text>
                    </View>

                    {/* Section 1: Acceptance of Terms */}
                    <Section
                        icon={<FileText size={20} color="#d4af37" />}
                        title={t('termsOfService.sections.acceptance.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('termsOfService.sections.acceptance.content')}</Text>
                    </Section>

                    {/* Section 2: Account Registration */}
                    <Section
                        icon={<UserCheck size={20} color="#d4af37" />}
                        title={t('termsOfService.sections.account.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('termsOfService.sections.account.intro')}</Text>
                        <BulletPoint>{t('termsOfService.sections.account.points.accurate')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.account.points.confidential')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.account.points.responsible')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.account.points.age')}</BulletPoint>
                    </Section>

                    {/* Section 3: Products & Orders */}
                    <Section
                        icon={<ShoppingCart size={20} color="#d4af37" />}
                        title={t('termsOfService.sections.orders.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('termsOfService.sections.orders.content')}</Text>
                        <BulletPoint>{t('termsOfService.sections.orders.points.prices')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.orders.points.availability')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.orders.points.cancel')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.orders.points.quality')}</BulletPoint>
                    </Section>

                    {/* Section 4: Payment */}
                    <Section
                        icon={<CreditCard size={20} color="#d4af37" />}
                        title={t('termsOfService.sections.payment.title')}
                    >
                        <BulletPoint>{t('termsOfService.sections.payment.points.methods')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.payment.points.currency')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.payment.points.refunds')}</BulletPoint>
                    </Section>

                    {/* Section 5: Delivery */}
                    <Section
                        icon={<Truck size={20} color="#d4af37" />}
                        title={t('termsOfService.sections.delivery.title')}
                    >
                        <BulletPoint>{t('termsOfService.sections.delivery.points.fees')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.delivery.points.freeShipping')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.delivery.points.times')}</BulletPoint>
                    </Section>

                    {/* Section 6: Returns & Refunds */}
                    <Section
                        icon={<RotateCcw size={20} color="#d4af37" />}
                        title={t('termsOfService.sections.returns.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('termsOfService.sections.returns.intro')}</Text>
                        <BulletPoint>{t('termsOfService.sections.returns.points.period')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.returns.points.condition')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.returns.points.receipt')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.returns.points.refundTime')}</BulletPoint>
                        <Text className="font-medium text-slate-800 mt-2 text-start">{t('termsOfService.sections.returns.exceptions.title')}</Text>
                        <BulletPoint>{t('termsOfService.sections.returns.exceptions.opened')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.returns.exceptions.damaged')}</BulletPoint>
                        <BulletPoint>{t('termsOfService.sections.returns.exceptions.special')}</BulletPoint>
                    </Section>

                    {/* Section 7: Disclaimer */}
                    <Section
                        icon={<AlertTriangle size={20} color="#d4af37" />}
                        title={t('termsOfService.sections.disclaimer.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('termsOfService.sections.disclaimer.content')}</Text>
                    </Section>

                    {/* Section 8: Intellectual Property */}
                    <Section
                        icon={<Shield size={20} color="#d4af37" />}
                        title={t('termsOfService.sections.intellectual.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('termsOfService.sections.intellectual.content')}</Text>
                    </Section>

                    {/* Section 9: Governing Law */}
                    <Section
                        icon={<Gavel size={20} color="#d4af37" />}
                        title={t('termsOfService.sections.governing.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('termsOfService.sections.governing.content')}</Text>
                    </Section>

                    {/* Section 10: Modifications */}
                    <Section
                        icon={<FileText size={20} color="#d4af37" />}
                        title={t('termsOfService.sections.modifications.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('termsOfService.sections.modifications.content')}</Text>
                    </Section>

                    {/* Contact Section */}
                    <View className="mt-8 p-5 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
                        <Text className="text-lg font-bold text-slate-900 mb-2 text-start">{t('termsOfService.contact.title')}</Text>
                        <Text className="text-slate-600 text-start">
                            {t('termsOfService.contact.content')}
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
