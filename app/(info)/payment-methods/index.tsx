import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, Stack } from 'expo-router';
import { ChevronLeft, CreditCard, Shield, Truck } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Text } from '@/components/ui/text';

interface PaymentCardProps {
    name: string;
    logo: any;
}

function PaymentCard({ name, logo }: PaymentCardProps) {
    return (
        <View className="bg-white rounded-xl p-4 items-center justify-center h-20 shadow-sm border border-slate-100">
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
        <View className="mb-10">
            <Text className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 text-start">
                {title}
            </Text>
            <View className="flex-row flex-wrap gap-4">
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
        <View className="bg-white rounded-2xl p-6 items-center border border-slate-100 mb-4">
            <View className="w-14 h-14 rounded-full bg-yellow-500/10 items-center justify-center mb-4">
                {icon}
            </View>
            <Text className="font-bold text-lg text-slate-900 mb-2 text-center">{title}</Text>
            <Text className="text-sm text-slate-600 text-center">{description}</Text>
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
            icon: <Shield size={28} color="#d4af37" />,
            title: t('paymentMethods.features.secure.title'),
            description: t('paymentMethods.features.secure.description'),
        },
        {
            icon: <CreditCard size={28} color="#d4af37" />,
            title: t('paymentMethods.features.variety.title'),
            description: t('paymentMethods.features.variety.description'),
        },
        {
            icon: <Truck size={28} color="#d4af37" />,
            title: t('paymentMethods.features.cod.title'),
            description: t('paymentMethods.features.cod.description'),
        },
    ];

    return (
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 40 }}>
            <Stack.Screen options={{ title: t('paymentMethods.hero.title') ,            headerLeft: () => (
                                          <Pressable onPress={() => router.back()} >
                                              <ChevronLeft color="#000000ff" size={28} />
                                          </Pressable>
                                      ),}} />

            {/* Hero Section */}
            <View className="bg-foreground py-16 px-4 items-center">
                <View className="w-16 h-16 rounded-full bg-yellow-500/20 items-center justify-center mb-6">
                    <CreditCard size={32} color="#d4af37" />
                </View>
                <Text className="text-3xl font-bold mb-4 text-white text-center">
                    {t('paymentMethods.hero.title')}
                </Text>
                <Text className="text-lg text-white/80 text-center px-4">
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
            <View className="py-8 px-4 bg-white">
                <Text className="text-2xl font-bold text-center mb-8 text-slate-900">
                    {t('paymentMethods.whyChoose')}
                </Text>
                {features.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                ))}
            </View>

            {/* Info Section */}
            <View className="py-8 px-4">
                <View className="bg-yellow-500/5 rounded-2xl p-6 border border-yellow-500/20">
                    <Text className="text-xl font-bold text-slate-900 mb-4 text-start">
                        {t('paymentMethods.info.title')}
                    </Text>
                    <View className="gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <View key={i} className="flex-row items-start gap-2">
                                <View className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-2" />
                                <Text className="text-slate-600 flex-1 text-start">
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
