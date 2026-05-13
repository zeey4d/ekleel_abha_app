import React from 'react';
import { View, ScrollView, Pressable, Linking, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, Stack } from 'expo-router';
import {
    RotateCcw, Package, Clock, CheckCircle, XCircle,
    AlertTriangle, CreditCard, Truck, Mail, Phone,
    ChevronLeft
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { I18nManager } from 'react-native';
import { cn } from '@/lib/utils';

interface PolicyCardProps {
    icon: React.ReactNode;
    title: string;
    items: string[];
    variant?: 'default' | 'success' | 'warning';
}

function PolicyCard({ icon, title, items, variant = 'default' }: PolicyCardProps) {
    const variantStyles = {
        default: 'bg-white border-slate-200/80',
        success: 'bg-green-50 border-green-200',
        warning: 'bg-amber-50 border-amber-200',
    };

    return (
        <View className={cn(`rounded-[32px] p-6 border mb-4 shadow-sm`, variantStyles[variant])}>
            <View className={cn("flex-row items-center gap-3 mb-4", I18nManager.isRTL && "flex-row-reverse")}>
                {icon}
                <Text className={cn("font-bold text-lg text-slate-800 flex-1 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{title}</Text>
            </View>
            <View className="gap-3">
                {items.map((item, index) => (
                    <View key={index} className={cn("flex-row items-start gap-2", I18nManager.isRTL && "flex-row-reverse")}>
                        <View className={cn("w-1.5 h-1.5 rounded-full mt-2", variant === 'success' ? 'bg-green-500' : variant === 'warning' ? 'bg-amber-500' : 'bg-teal-500')} />
                        <Text className={cn("text-slate-600 flex-1 font-tajawal leading-relaxed", I18nManager.isRTL ? "text-right" : "text-left")}>{item}</Text>
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
        <View className={cn("flex-row gap-4 mb-6", I18nManager.isRTL && "flex-row-reverse")}>
            <View className="w-10 h-10 rounded-2xl bg-teal-600 items-center justify-center shadow-sm">
                <Text className="font-bold text-white font-tajawal">{number}</Text>
            </View>
            <View className="flex-1 mt-1">
                <Text className={cn("font-bold text-slate-800 mb-1 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{title}</Text>
                <Text className={cn("text-slate-500 font-tajawal leading-relaxed", I18nManager.isRTL ? "text-right" : "text-left")}>{description}</Text>
            </View>
        </View>
    );
}

export default function ReturnPolicyPage() {
    const { t } = useTranslation('info');

    return (
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 60 }}>
            <Stack.Screen options={{ title: t('returnPolicy.hero.title') }} />

            {/* Hero Section */}
            <View className="bg-teal-700 py-16 px-4 items-center relative overflow-hidden mb-4">
                <Image 
                  source={require("@/assets/images/aka_g.png")} 
                  className="w-24 h-24 mb-4" 
                  resizeMode="contain" 
                />
                <View className="w-16 h-16 rounded-2xl bg-teal-600/50 items-center justify-center mb-6">
                    <RotateCcw size={32} color="#ccfbf1" />
                </View>
                <Text className="text-3xl font-bold mb-4 text-white text-center font-tajawal">
                    {t('returnPolicy.hero.title')}
                </Text>
                <Text className="text-[15px] text-teal-100 text-center px-4 font-tajawal mb-2">
                    {t('returnPolicy.hero.subtitle')}
                </Text>
                <Text className="text-xs text-teal-200/80 text-center font-tajawal">
                    {t('returnPolicy.hero.lastUpdated')}
                </Text>
            </View>

            {/* Introduction */}
            <View className="py-4 px-4 mb-4">
                <View className="bg-white rounded-[32px] shadow-sm border border-slate-200/80 p-6">
                    <Text className={cn("text-slate-600 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>
                        {t('returnPolicy.introduction')}
                    </Text>
                </View>
            </View>

            {/* Return Eligibility */}
            <View className="py-4 px-4">
                <Text className="text-xl font-bold text-center mb-6 text-slate-800 font-tajawal">
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
            <View className="py-8 px-4 bg-white mt-4 mx-4 rounded-[32px] border border-slate-200/80 shadow-sm">
                <Text className="text-xl font-bold text-center mb-8 text-slate-800 font-tajawal">
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
            <View className="py-8 px-4 mt-4">
                <Text className="text-xl font-bold text-center mb-6 text-slate-800 font-tajawal">
                    {t('returnPolicy.refund.title')}
                </Text>
                {[
                    { icon: <CreditCard size={28} className="text-teal-600" />, titleKey: 'card', descKey: 'card' },
                    { icon: <Clock size={28} className="text-teal-600" />, titleKey: 'time', descKey: 'time' },
                    { icon: <Truck size={28} className="text-teal-600" />, titleKey: 'shipping', descKey: 'shipping' },
                ].map((item, index) => (
                    <View key={index} className="bg-white rounded-[32px] p-6 items-center border border-slate-200/80 mb-4 shadow-sm">
                        <View className="w-14 h-14 rounded-2xl bg-teal-50 items-center justify-center mb-4">
                            {item.icon}
                        </View>
                        <Text className="font-bold text-lg text-slate-800 mb-2 text-center font-tajawal">
                            {t(`returnPolicy.refund.${item.titleKey}.title`)}
                        </Text>
                        <Text className="text-sm text-slate-500 text-center font-tajawal leading-relaxed">
                            {t(`returnPolicy.refund.${item.descKey}.description`)}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Important Notes */}
            <View className="py-4 px-4">
                <View className="bg-amber-50 rounded-[32px] p-6 border border-amber-200 shadow-sm">
                    <View className={cn("flex-row items-center gap-3 mb-4", I18nManager.isRTL && "flex-row-reverse")}>
                        <AlertTriangle size={24} color="#d97706" />
                        <Text className={cn("text-xl font-bold text-amber-900 flex-1 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>
                            {t('returnPolicy.notes.title')}
                        </Text>
                    </View>
                    <View className="gap-4">
                        {[1, 2, 3].map((i) => (
                            <View key={i} className={cn("flex-row items-start gap-3", I18nManager.isRTL && "flex-row-reverse")}>
                                <View className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
                                <Text className={cn("text-amber-800/80 flex-1 font-tajawal leading-relaxed", I18nManager.isRTL ? "text-right" : "text-left")}>
                                    {t(`returnPolicy.notes.note${i}`)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Contact Section */}
            <View className="py-8 px-4 bg-white items-center mx-4 rounded-[32px] border border-slate-200/80 shadow-sm mt-4 mb-8">
                <View className="w-16 h-16 rounded-2xl bg-teal-50 items-center justify-center mb-5">
                    <Package size={32} className="text-teal-600" />
                </View>
                <Text className="text-xl font-bold text-slate-800 mb-2 text-center font-tajawal">
                    {t('returnPolicy.contact.title')}
                </Text>
                <Text className="text-sm text-slate-500 mb-6 text-center px-4 font-tajawal">
                    {t('returnPolicy.contact.description')}
                </Text>
                <View className="gap-3 w-full">
                    <Pressable
                        onPress={() => Linking.openURL('mailto:support@ekleelabha.com')}
                        className={cn("bg-teal-600 rounded-full py-4 px-6 items-center flex-row justify-center gap-2 shadow-sm active:bg-teal-700 active:scale-[0.98] transition-all", I18nManager.isRTL && "flex-row-reverse")}
                    >
                        <Mail size={18} color="white" />
                        <Text className="text-white font-bold font-tajawal text-[15px]">{t('returnPolicy.contact.emailButton')}</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => Linking.openURL('tel:0575637926')}
                        className={cn("bg-white border border-slate-200 rounded-full py-4 px-6 items-center flex-row justify-center gap-2 active:bg-slate-50", I18nManager.isRTL && "flex-row-reverse")}
                    >
                        <Phone size={18} className="text-slate-700" />
                        <Text className="text-slate-700 font-bold font-tajawal text-[15px]">{t('returnPolicy.contact.callButton')}</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}
