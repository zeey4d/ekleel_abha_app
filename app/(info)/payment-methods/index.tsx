import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, Stack } from 'expo-router';
import { ChevronLeft, CreditCard, Shield, Truck } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Text } from '@/components/ui/text';
import { I18nManager } from 'react-native';
import { cn } from '@/lib/utils';

interface PaymentCardProps {
    name: string;
    logo: any;
}

function PaymentCard({ name, logo }: PaymentCardProps) {
    return (
        <View className="bg-white rounded-2xl p-4 items-center justify-center h-20 shadow-sm border border-slate-200/80">
            <Image
                source={logo}
                style={{ width: 120, height: 40 }}
                contentFit="contain"
                accessibilityLabel={name}
            />
        </View>
    );
}

interface PaymentSectionProps {
    title: string;
    children: React.ReactNode;
}

function PaymentSection({ title, children }: PaymentSectionProps) {
    return (
        <View className="mb-8">
            <Text className={cn("text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>
                {title}
            </Text>
            <View className={cn("flex-row flex-wrap gap-4", I18nManager.isRTL && "flex-row-reverse")}>
                {children}
            </View>
        </View>
    );
}

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <View className="bg-white rounded-[32px] p-6 items-center border border-slate-200/80 shadow-sm mb-4">
            <View className="w-14 h-14 rounded-2xl bg-teal-50 items-center justify-center mb-4">
                {icon}
            </View>
            <Text className="font-bold text-lg text-slate-800 mb-2 text-center font-tajawal">{title}</Text>
            <Text className="text-sm text-slate-500 text-center font-tajawal leading-relaxed">{description}</Text>
        </View>
    );
}

export default function PaymentMethodsPage() {
    const { t } = useTranslation('info');

    const cardPayments = [
        { name: 'Mada', logo: require('@/assets/images/payment/mada.svg') },
        { name: 'Visa', logo: require('@/assets/images/payment/visa.svg') },
        { name: 'Mastercard', logo: require('@/assets/images/payment/mastercard.svg') },
    ];

    const walletPayments = [
        { name: 'Apple Pay', logo: require('@/assets/images/payment/apple-pay.svg') },
        { name: 'STC Pay', logo: require('@/assets/images/payment/stc-pay.svg') },
    ];

    const otherPayments = [
        { name: 'Tabby', logo: require('@/assets/images/payment/tabby.svg') },
        { name: 'Tamara', logo: require('@/assets/images/payment/tamara.svg') },
        { name: 'Cash on Delivery', logo: require('@/assets/images/payment/cod.svg') },
    ];

    const features = [
        {
            icon: <Shield size={28} className="text-teal-600" />,
            title: t('paymentMethods.features.secure.title'),
            description: t('paymentMethods.features.secure.description'),
        },
        {
            icon: <CreditCard size={28} className="text-teal-600" />,
            title: t('paymentMethods.features.variety.title'),
            description: t('paymentMethods.features.variety.description'),
        },
        {
            icon: <Truck size={28} className="text-teal-600" />,
            title: t('paymentMethods.features.cod.title'),
            description: t('paymentMethods.features.cod.description'),
        },
    ];

    return (
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 60 }}>
            <Stack.Screen options={{ title: t('paymentMethods.hero.title') }} />

            {/* Hero Section */}
            <View className="bg-teal-700 py-16 px-4 items-center relative overflow-hidden mb-4">
                <Image 
                  source={require("@/assets/images/aka_g.png")} 
                  style={{ width: 96, height: 96, marginBottom: 16 }} 
                  contentFit="contain" 
                />
                <View className="w-16 h-16 rounded-2xl bg-teal-600/50 items-center justify-center mb-6">
                    <CreditCard size={32} color="#ccfbf1" />
                </View>
                <Text className="text-3xl font-bold mb-4 text-white text-center font-tajawal">
                    {t('paymentMethods.hero.title')}
                </Text>
                <Text className="text-[15px] text-teal-100 text-center px-4 font-tajawal">
                    {t('paymentMethods.hero.subtitle')}
                </Text>
            </View>

            {/* Payment Methods Content */}
            <View className="py-8 px-4">
                {/* Cards Section */}
                <PaymentSection title={t('paymentMethods.sections.cards')}>
                    {cardPayments.map((payment) => (
                        <View key={payment.name} className="w-[47%]">
                            <PaymentCard {...payment} />
                        </View>
                    ))}
                </PaymentSection>

                {/* Digital Wallets Section */}
                <PaymentSection title={t('paymentMethods.sections.wallets')}>
                    {walletPayments.map((payment) => (
                        <View key={payment.name} className="w-[47%]">
                            <PaymentCard {...payment} />
                        </View>
                    ))}
                </PaymentSection>

                {/* Other Payment Methods */}
                <PaymentSection title={t('paymentMethods.sections.others')}>
                    {otherPayments.map((payment) => (
                        <View key={payment.name} className="w-[47%]">
                            <PaymentCard {...payment} />
                        </View>
                    ))}
                </PaymentSection>
            </View>

            {/* Features Section */}
            <View className="py-8 px-4">
                <Text className="text-xl font-bold text-center mb-6 text-slate-800 font-tajawal">
                    {t('paymentMethods.whyChoose')}
                </Text>
                {features.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                ))}
            </View>

            {/* Info Section */}
            <View className="py-4 px-4 mb-8">
                <View className="bg-white rounded-[32px] p-8 border border-slate-200/80 shadow-sm">
                    <Text className={cn("text-xl font-bold text-slate-800 mb-6 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>
                        {t('paymentMethods.info.title')}
                    </Text>
                    <View className="gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <View key={i} className={cn("flex-row items-start gap-3", I18nManager.isRTL && "flex-row-reverse")}>
                                <View className="w-2 h-2 rounded-full bg-teal-500 mt-2" />
                                <Text className={cn("text-slate-500 flex-1 font-tajawal leading-relaxed", I18nManager.isRTL ? "text-right" : "text-left")}>
                                    {t(`paymentMethods.info.point${i}`)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
