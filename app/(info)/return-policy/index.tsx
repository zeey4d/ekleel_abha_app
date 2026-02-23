import React from 'react';
import { View, ScrollView, Pressable, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, Stack } from 'expo-router';
import {
    RotateCcw, Package, Clock, CheckCircle, XCircle,
    AlertTriangle, CreditCard, Truck, Mail, Phone,
    ChevronLeft
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';

interface PolicyCardProps {
    icon: React.ReactNode;
    title: string;
    items: string[];
    variant?: 'default' | 'success' | 'warning';
}

function PolicyCard({ icon, title, items, variant = 'default' }: PolicyCardProps) {
    const variantStyles = {
        default: 'bg-white border-slate-200',
        success: 'bg-green-50 border-green-200',
        warning: 'bg-amber-50 border-amber-200',
    };

    return (
        <View className={`rounded-2xl p-6 border ${variantStyles[variant]} mb-4`}>
            <View className="flex-row items-center gap-3 mb-4">
                {icon}
                <Text className="font-bold text-lg text-slate-900 flex-1 text-start">{title}</Text>
            </View>
            <View className="gap-2">
                {items.map((item, index) => (
                    <View key={index} className="flex-row items-start gap-2">
                        <View className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-2" />
                        <Text className="text-slate-600 flex-1 text-start">{item}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

interface StepProps {
    number: number;
    title: string;
    description: string;
}

function Step({ number, title, description }: StepProps) {
    return (
        <View className="flex-row gap-4 mb-6">
            <View className="w-10 h-10 rounded-full bg-yellow-600 items-center justify-center">
                <Text className="text-foreground font-bold text-white">{number}</Text>
            </View>
            <View className="flex-1">
                <Text className="font-bold text-slate-900 mb-1 text-start">{title}</Text>
                <Text className="text-slate-600 text-start">{description}</Text>
            </View>
        </View>
    );
}

export default function ReturnPolicyPage() {
    const { t } = useTranslation('info');

    return (
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 40 }}>
            <Stack.Screen options={{ title: t('returnPolicy.hero.title'),
                            headerLeft: () => (
                                              <Pressable onPress={() => router.back()} >
                                                  <ChevronLeft color="#000000ff" size={28} />
                                              </Pressable>
                                          ),
             }} />

            {/* Hero Section */}
            <View className="bg-foreground py-16 px-4 items-center">
                <View className="w-16 h-16 rounded-full bg-yellow-500/20 items-center justify-center mb-6">
                    <RotateCcw size={32} color="#d4af37" />
                </View>
                <Text className="text-3xl font-bold mb-4 text-white text-center">
                    {t('returnPolicy.hero.title')}
                </Text>
                <Text className="text-lg text-white/80 text-center px-4">
                    {t('returnPolicy.hero.subtitle')}
                </Text>
                <Text className="text-sm text-white/60 mt-4 text-center">
                    {t('returnPolicy.hero.lastUpdated')}
                </Text>
            </View>

            {/* Introduction */}
            <View className="py-8 px-4">
                <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <Text className="text-slate-600 leading-relaxed text-lg text-start">
                        {t('returnPolicy.introduction')}
                    </Text>
                </View>
            </View>

            {/* Return Eligibility */}
            <View className="py-4 px-4">
                <Text className="text-2xl font-bold text-center mb-6 text-slate-900">
                    {t('returnPolicy.eligibility.title')}
                </Text>
                <PolicyCard
                    icon={<CheckCircle size={24} color="#16a34a" />}
                    title={t('returnPolicy.eligibility.eligible.title')}
                    variant="success"
                    items={[
                        t('returnPolicy.eligibility.eligible.item1'),
                        t('returnPolicy.eligibility.eligible.item2'),
                        t('returnPolicy.eligibility.eligible.item3'),
                        t('returnPolicy.eligibility.eligible.item4'),
                    ]}
                />
                <PolicyCard
                    icon={<XCircle size={24} color="#d97706" />}
                    title={t('returnPolicy.eligibility.notEligible.title')}
                    variant="warning"
                    items={[
                        t('returnPolicy.eligibility.notEligible.item1'),
                        t('returnPolicy.eligibility.notEligible.item2'),
                        t('returnPolicy.eligibility.notEligible.item3'),
                        t('returnPolicy.eligibility.notEligible.item4'),
                    ]}
                />
            </View>

            {/* Return Process Steps */}
            <View className="py-8 px-4 bg-white">
                <Text className="text-2xl font-bold text-center mb-8 text-slate-900">
                    {t('returnPolicy.process.title')}
                </Text>
                <Step
                    number={1}
                    title={t('returnPolicy.process.step1.title')}
                    description={t('returnPolicy.process.step1.description')}
                />
                <Step
                    number={2}
                    title={t('returnPolicy.process.step2.title')}
                    description={t('returnPolicy.process.step2.description')}
                />
                <Step
                    number={3}
                    title={t('returnPolicy.process.step3.title')}
                    description={t('returnPolicy.process.step3.description')}
                />
                <Step
                    number={4}
                    title={t('returnPolicy.process.step4.title')}
                    description={t('returnPolicy.process.step4.description')}
                />
            </View>

            {/* Refund Information */}
            <View className="py-8 px-4">
                <Text className="text-2xl font-bold text-center mb-6 text-slate-900">
                    {t('returnPolicy.refund.title')}
                </Text>
                {[
                    { icon: <CreditCard size={28} color="#d4af37" />, titleKey: 'card', descKey: 'card' },
                    { icon: <Clock size={28} color="#d4af37" />, titleKey: 'time', descKey: 'time' },
                    { icon: <Truck size={28} color="#d4af37" />, titleKey: 'shipping', descKey: 'shipping' },
                ].map((item, index) => (
                    <View key={index} className="bg-white rounded-2xl p-6 items-center border border-slate-200 mb-4">
                        <View className="w-14 h-14 rounded-full bg-yellow-500/10 items-center justify-center mb-4">
                            {item.icon}
                        </View>
                        <Text className="font-bold text-lg text-slate-900 mb-2 text-center">
                            {t(`returnPolicy.refund.${item.titleKey}.title`)}
                        </Text>
                        <Text className="text-sm text-slate-600 text-center">
                            {t(`returnPolicy.refund.${item.descKey}.description`)}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Important Notes */}
            <View className="py-4 px-4">
                <View className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                    <View className="flex-row items-center gap-3 mb-4">
                        <AlertTriangle size={24} color="#d97706" />
                        <Text className="text-xl font-bold text-slate-900 flex-1 text-start">
                            {t('returnPolicy.notes.title')}
                        </Text>
                    </View>
                    <View className="gap-3">
                        {[1, 2, 3].map((i) => (
                            <View key={i} className="flex-row items-start gap-2">
                                <View className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2" />
                                <Text className="text-slate-700 flex-1 text-start">
                                    {t(`returnPolicy.notes.note${i}`)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Contact Section */}
            <View className="py-12 px-4 bg-white items-center">
                <View className="w-16 h-16 rounded-full bg-yellow-500/10 items-center justify-center mb-6">
                    <Package size={32} color="#d4af37" />
                </View>
                <Text className="text-2xl font-bold text-slate-900 mb-4 text-center">
                    {t('returnPolicy.contact.title')}
                </Text>
                <Text className="text-slate-600 mb-6 text-center px-4">
                    {t('returnPolicy.contact.description')}
                </Text>
                <View className="gap-3 w-full">
                    <Pressable
                        onPress={() => Linking.openURL('mailto:support@ekleelabha.com')}
                        className="bg-yellow-600 rounded-full py-3 px-6 items-center flex-row justify-center gap-2"
                    >
                        <Mail size={18} color="white" />
                        <Text className="text-white font-bold">{t('returnPolicy.contact.emailButton')}</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => Linking.openURL('tel:0575637926')}
                        className="bg-white border border-border rounded-full py-3 px-6 items-center flex-row justify-center gap-2"
                    >
                        <Phone size={18} color="black" />
                        <Text className="text-foreground font-bold">{t('returnPolicy.contact.callButton')}</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}
