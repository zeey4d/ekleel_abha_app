import React from 'react';
import { View, ScrollView, Pressable, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, Stack } from 'expo-router';
import {
    Truck, Package, Clock, MapPin, CreditCard, Shield,
    CheckCircle, AlertCircle, Phone, Mail,
    ChevronLeft
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';

interface ShippingOptionProps {
    icon: React.ReactNode;
    title: string;
    time: string;
    price: string;
    description: string;
    highlight?: boolean;
}

function ShippingOption({ icon, title, time, price, description, highlight = false }: ShippingOptionProps) {
    return (
        <View className={`rounded-2xl p-6 border mb-4 ${
            highlight
                ? 'bg-yellow-500/5 border-yellow-500/30'
                : 'bg-white border-slate-200'
        }`}>
            <View className="flex-row items-start gap-4">
                <View className={`w-14 h-14 rounded-full items-center justify-center ${
                    highlight ? 'bg-yellow-500/20' : 'bg-yellow-500/10'
                }`}>
                    {icon}
                </View>
                <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="font-bold text-lg text-slate-900 text-start">{title}</Text>
                        <Text className="text-yellow-600 font-bold">{price}</Text>
                    </View>
                    <View className="flex-row items-center gap-2 mb-2">
                        <Clock size={16} color="#64748b" />
                        <Text className="text-sm text-slate-500">{time}</Text>
                    </View>
                    <Text className="text-slate-600 text-sm text-start">{description}</Text>
                </View>
            </View>
        </View>
    );
}

interface InfoCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function InfoCard({ icon, title, description }: InfoCardProps) {
    return (
        <View className="bg-white rounded-2xl p-6 items-center border border-slate-200 mb-4">
            <View className="w-14 h-14 rounded-full bg-yellow-500/10 items-center justify-center mb-4">
                {icon}
            </View>
            <Text className="font-bold text-lg text-slate-900 mb-2 text-center">{title}</Text>
            <Text className="text-sm text-slate-600 text-center">{description}</Text>
        </View>
    );
}

export default function ShippingPage() {
    const { t } = useTranslation('info');

    const cities = [
        t('shipping.coverage.cities.riyadh'),
        t('shipping.coverage.cities.jeddah'),
        t('shipping.coverage.cities.dammam'),
        t('shipping.coverage.cities.makkah'),
        t('shipping.coverage.cities.madinah'),
        t('shipping.coverage.cities.abha'),
        t('shipping.coverage.cities.taif'),
        t('shipping.coverage.cities.tabuk'),
    ];

    return (
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 40 }}>
            <Stack.Screen options={{ title: t('shipping.hero.title'),
                            headerLeft: () => (
                                              <Pressable onPress={() => router.back()} >
                                                  <ChevronLeft color="#000000ff" size={28} />
                                              </Pressable>
                                          ),
             }} />

            {/* Hero Section */}
            <View className="bg-foreground py-16 px-4 items-center">
                <View className="w-16 h-16 rounded-full bg-yellow-500/20 items-center justify-center mb-6">
                    <Truck size={32} color="#d4af37" />
                </View>
                <Text className="text-3xl font-bold mb-4 text-white text-center">
                    {t('shipping.hero.title')}
                </Text>
                <Text className="text-lg text-white/80 text-center px-4">
                    {t('shipping.hero.subtitle')}
                </Text>
            </View>

            {/* Shipping Options */}
            <View className="py-8 px-4">
                <Text className="text-2xl font-bold text-center mb-6 text-slate-900">
                    {t('shipping.options.title')}
                </Text>
                <ShippingOption
                    icon={<Truck size={28} color="#d4af37" />}
                    title={t('shipping.options.homeDelivery.title')}
                    time={t('shipping.options.homeDelivery.time')}
                    price={t('shipping.options.homeDelivery.price')}
                    description={t('shipping.options.homeDelivery.description')}
                    highlight={true}
                />
                <ShippingOption
                    icon={<MapPin size={28} color="#d4af37" />}
                    title={t('shipping.options.branchPickup.title')}
                    time={t('shipping.options.branchPickup.time')}
                    price={t('shipping.options.branchPickup.price')}
                    description={t('shipping.options.branchPickup.description')}
                />
            </View>

            {/* Free Shipping Banner */}
            <View className="px-4 pb-4">
                <View className="bg-yellow-500/10 rounded-2xl p-6 border border-yellow-500/20 items-center">
                    <View className="flex-row items-center gap-3 mb-3">
                        <CheckCircle size={28} color="#d4af37" />
                        <Text className="text-xl font-bold text-slate-900">
                            {t('shipping.freeShipping.title')}
                        </Text>
                    </View>
                    <Text className="text-slate-600 text-lg text-center">
                        {t('shipping.freeShipping.description')}
                    </Text>
                </View>
            </View>

            {/* Coverage Area */}
            <View className="py-8 px-4 bg-white">
                <Text className="text-2xl font-bold text-center mb-4 text-slate-900">
                    {t('shipping.coverage.title')}
                </Text>
                <Text className="text-slate-600 text-center mb-6">
                    {t('shipping.coverage.description')}
                </Text>
                <View className="flex-row flex-wrap gap-3">
                    {cities.map((city, index) => (
                        <View
                            key={index}
                            className="bg-slate-50 rounded-xl p-4 items-center border border-slate-200 w-[47%]"
                        >
                            <MapPin size={20} color="#d4af37" />
                            <Text className="text-slate-700 font-medium mt-2">{city}</Text>
                        </View>
                    ))}
                </View>
                <Text className="text-center text-slate-500 text-sm mt-6">
                    {t('shipping.coverage.note')}
                </Text>
            </View>

            {/* Features */}
            <View className="py-8 px-4">
                <Text className="text-2xl font-bold text-center mb-6 text-slate-900">
                    {t('shipping.features.title')}
                </Text>
                <InfoCard
                    icon={<Shield size={28} color="#d4af37" />}
                    title={t('shipping.features.secure.title')}
                    description={t('shipping.features.secure.description')}
                />
                <InfoCard
                    icon={<Package size={28} color="#d4af37" />}
                    title={t('shipping.features.tracking.title')}
                    description={t('shipping.features.tracking.description')}
                />
                <InfoCard
                    icon={<CreditCard size={28} color="#d4af37" />}
                    title={t('shipping.features.cod.title')}
                    description={t('shipping.features.cod.description')}
                />
            </View>

            {/* Important Information */}
            <View className="py-4 px-4">
                <View className="bg-white rounded-2xl p-6 border border-slate-200">
                    <View className="flex-row items-center gap-3 mb-4">
                        <AlertCircle size={24} color="#d4af37" />
                        <Text className="text-xl font-bold text-slate-900 flex-1 text-start">
                            {t('shipping.info.title')}
                        </Text>
                    </View>
                    <View className="gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <View key={i} className="flex-row items-start gap-2">
                                <View className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-2" />
                                <Text className="text-slate-600 flex-1 text-start">
                                    {t(`shipping.info.point${i}`)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Contact Section */}
            <View className="py-12 px-4 bg-white items-center">
                <View className="w-16 h-16 rounded-full bg-yellow-500/10 items-center justify-center mb-6">
                    <Truck size={32} color="#d4af37" />
                </View>
                <Text className="text-2xl font-bold text-slate-900 mb-4 text-center">
                    {t('shipping.contact.title')}
                </Text>
                <Text className="text-slate-600 mb-6 text-center px-4">
                    {t('shipping.contact.description')}
                </Text>
                <View className="gap-3 w-full">
                    <Pressable
                        onPress={() => Linking.openURL('mailto:support@ekleelabha.com')}
                        className="bg-yellow-600 rounded-full py-3 px-6 items-center flex-row justify-center gap-2"
                    >
                        <Mail size={18} color="white" />
                        <Text className="text-white font-bold">{t('shipping.contact.emailButton')}</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => Linking.openURL('tel:0575637926')}
                        className="bg-white border border-border rounded-full py-3 px-6 items-center flex-row justify-center gap-2"
                    >
                        <Phone size={18} color="black" />
                        <Text className="text-foreground font-bold">{t('shipping.contact.callButton')}</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}
