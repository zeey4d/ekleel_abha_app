import React from 'react';
import { View, ScrollView, Pressable, Linking, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, Stack } from 'expo-router';
import {
    Truck, Package, Clock, MapPin, CreditCard, Shield,
    CheckCircle, AlertCircle, Phone, Mail,
    ChevronLeft
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { I18nManager } from 'react-native';
import { cn } from '@/lib/utils';

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
        <View className={cn(`rounded-[32px] p-6 border mb-4 shadow-sm`,
            highlight
                ? 'bg-teal-50 border-teal-200'
                : 'bg-white border-slate-200/80'
        )}>
            <View className={cn("flex-row items-start gap-4", I18nManager.isRTL && "flex-row-reverse")}>
                <View className={cn(`w-14 h-14 rounded-2xl items-center justify-center`,
                    highlight ? 'bg-white shadow-sm' : 'bg-teal-50'
                )}>
                    {icon}
                </View>
                <View className="flex-1 mt-1">
                    <View className={cn("flex-row items-center justify-between mb-2", I18nManager.isRTL && "flex-row-reverse")}>
                        <Text className={cn("font-bold text-lg text-slate-800 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{title}</Text>
                        <Text className="text-teal-600 font-bold font-tajawal">{price}</Text>
                    </View>
                    <View className={cn("flex-row items-center gap-2 mb-2", I18nManager.isRTL && "flex-row-reverse")}>
                        <Clock size={16} className="text-slate-500" />
                        <Text className="text-sm text-slate-500 font-tajawal">{time}</Text>
                    </View>
                    <Text className={cn("text-slate-500 text-sm font-tajawal leading-relaxed", I18nManager.isRTL ? "text-right" : "text-left")}>{description}</Text>
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
        <View className="bg-white rounded-[32px] p-6 items-center border border-slate-200/80 mb-4 shadow-sm">
            <View className="w-14 h-14 rounded-2xl bg-teal-50 items-center justify-center mb-4">
                {icon}
            </View>
            <Text className="font-bold text-lg text-slate-800 mb-2 text-center font-tajawal">{title}</Text>
            <Text className="text-sm text-slate-500 text-center font-tajawal leading-relaxed">{description}</Text>
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
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 60 }}>
            <Stack.Screen options={{ title: t('shipping.hero.title') }} />

            {/* Hero Section */}
            <View className="bg-teal-700 py-16 px-4 items-center relative overflow-hidden mb-4">
                <Image 
                  source={require("@/assets/images/aka_g.png")} 
                  className="w-24 h-24 mb-4" 
                  resizeMode="contain" 
                />
                <View className="w-16 h-16 rounded-2xl bg-teal-600/50 items-center justify-center mb-6">
                    <Truck size={32} color="#ccfbf1" />
                </View>
                <Text className="text-3xl font-bold mb-4 text-white text-center font-tajawal">
                    {t('shipping.hero.title')}
                </Text>
                <Text className="text-[15px] text-teal-100 text-center px-4 font-tajawal">
                    {t('shipping.hero.subtitle')}
                </Text>
            </View>

            {/* Shipping Options */}
            <View className="py-8 px-4">
                <Text className="text-xl font-bold text-center mb-6 text-slate-800 font-tajawal">
                    {t('shipping.options.title')}
                </Text>
                <ShippingOption
                    icon={<Truck size={28} className="text-teal-600" />}
                    title={t('shipping.options.homeDelivery.title')}
                    time={t('shipping.options.homeDelivery.time')}
                    price={t('shipping.options.homeDelivery.price')}
                    description={t('shipping.options.homeDelivery.description')}
                    highlight={true}
                />
                <ShippingOption
                    icon={<MapPin size={28} className="text-teal-600" />}
                    title={t('shipping.options.branchPickup.title')}
                    time={t('shipping.options.branchPickup.time')}
                    price={t('shipping.options.branchPickup.price')}
                    description={t('shipping.options.branchPickup.description')}
                />
            </View>

            {/* Free Shipping Banner */}
            <View className="px-4 pb-4">
                <View className="bg-teal-700 rounded-[32px] p-8 border border-teal-800 items-center shadow-sm">
                    <View className={cn("flex-row items-center gap-3 mb-4", I18nManager.isRTL && "flex-row-reverse")}>
                        <CheckCircle size={28} color="#ccfbf1" />
                        <Text className="text-xl font-bold text-white font-tajawal">
                            {t('shipping.freeShipping.title')}
                        </Text>
                    </View>
                    <Text className="text-teal-100 text-sm text-center font-tajawal leading-relaxed">
                        {t('shipping.freeShipping.description')}
                    </Text>
                </View>
            </View>

            {/* Coverage Area */}
            <View className="py-8 px-4 bg-white mx-4 rounded-[32px] border border-slate-200/80 shadow-sm mt-4">
                <Text className="text-xl font-bold text-center mb-4 text-slate-800 font-tajawal">
                    {t('shipping.coverage.title')}
                </Text>
                <Text className="text-slate-500 text-center mb-6 font-tajawal px-2">
                    {t('shipping.coverage.description')}
                </Text>
                <View className={cn("flex-row flex-wrap gap-3", I18nManager.isRTL && "flex-row-reverse")}>
                    {cities.map((city, index) => (
                        <View
                            key={index}
                            className="bg-slate-50 rounded-2xl p-4 items-center border border-slate-100 w-[47%]"
                        >
                            <MapPin size={20} className="text-teal-600" />
                            <Text className="text-slate-700 font-bold mt-2 font-tajawal text-sm">{city}</Text>
                        </View>
                    ))}
                </View>
                <Text className="text-center text-slate-400 text-xs mt-6 font-tajawal">
                    {t('shipping.coverage.note')}
                </Text>
            </View>

            {/* Features */}
            <View className="py-8 px-4 mt-4">
                <Text className="text-xl font-bold text-center mb-6 text-slate-800 font-tajawal">
                    {t('shipping.features.title')}
                </Text>
                <InfoCard
                    icon={<Shield size={28} className="text-teal-600" />}
                    title={t('shipping.features.secure.title')}
                    description={t('shipping.features.secure.description')}
                />
                <InfoCard
                    icon={<Package size={28} className="text-teal-600" />}
                    title={t('shipping.features.tracking.title')}
                    description={t('shipping.features.tracking.description')}
                />
                <InfoCard
                    icon={<CreditCard size={28} className="text-teal-600" />}
                    title={t('shipping.features.cod.title')}
                    description={t('shipping.features.cod.description')}
                />
            </View>

            {/* Important Information */}
            <View className="py-4 px-4">
                <View className="bg-white rounded-[32px] p-6 border border-slate-200/80 shadow-sm">
                    <View className={cn("flex-row items-center gap-3 mb-5", I18nManager.isRTL && "flex-row-reverse")}>
                        <AlertCircle size={24} className="text-teal-600" />
                        <Text className={cn("text-xl font-bold text-slate-800 flex-1 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>
                            {t('shipping.info.title')}
                        </Text>
                    </View>
                    <View className="gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <View key={i} className={cn("flex-row items-start gap-3", I18nManager.isRTL && "flex-row-reverse")}>
                                <View className="w-2 h-2 rounded-full bg-teal-500 mt-2" />
                                <Text className={cn("text-slate-500 flex-1 font-tajawal leading-relaxed", I18nManager.isRTL ? "text-right" : "text-left")}>
                                    {t(`shipping.info.point${i}`)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* Contact Section */}
            <View className="py-8 px-4 bg-white items-center mx-4 rounded-[32px] border border-slate-200/80 shadow-sm mt-4 mb-8">
                <View className="w-16 h-16 rounded-2xl bg-teal-50 items-center justify-center mb-5">
                    <Truck size={32} className="text-teal-600" />
                </View>
                <Text className="text-xl font-bold text-slate-800 mb-2 text-center font-tajawal">
                    {t('shipping.contact.title')}
                </Text>
                <Text className="text-sm text-slate-500 mb-6 text-center px-4 font-tajawal">
                    {t('shipping.contact.description')}
                </Text>
                <View className="gap-3 w-full">
                    <Pressable
                        onPress={() => Linking.openURL('mailto:support@ekleelabha.com')}
                        className={cn("bg-teal-600 rounded-full py-4 px-6 items-center flex-row justify-center gap-2 shadow-sm active:bg-teal-700 active:scale-[0.98] transition-all", I18nManager.isRTL && "flex-row-reverse")}
                    >
                        <Mail size={18} color="white" />
                        <Text className="text-white font-bold font-tajawal text-[15px]">{t('shipping.contact.emailButton')}</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => Linking.openURL('tel:0575637926')}
                        className={cn("bg-white border border-slate-200 rounded-full py-4 px-6 items-center flex-row justify-center gap-2 active:bg-slate-50", I18nManager.isRTL && "flex-row-reverse")}
                    >
                        <Phone size={18} className="text-slate-700" />
                        <Text className="text-slate-700 font-bold font-tajawal text-[15px]">{t('shipping.contact.callButton')}</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}
