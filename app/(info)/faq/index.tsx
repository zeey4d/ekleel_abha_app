import React, { useState } from 'react';
import { View, ScrollView, Pressable, LayoutAnimation, Platform, UIManager, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HelpCircle, ChevronDown, ShoppingCart, Truck, CreditCard, RotateCcw, Mail, Phone, ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { router, Stack } from 'expo-router';
import { cn } from '@/lib/utils';
import { I18nManager } from 'react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
    return (
        <View className="border border-slate-200/80 rounded-2xl mb-3 overflow-hidden bg-white shadow-sm">
            <Pressable
                onPress={onToggle}
                className={cn("flex-row items-center justify-between p-4 bg-white active:bg-slate-50", I18nManager.isRTL && "flex-row-reverse")}
            >
                <Text className={cn("font-bold text-slate-800 flex-1 font-tajawal", I18nManager.isRTL ? "text-right pl-4" : "text-left pr-4")}>{question}</Text>
                <ChevronDown
                    size={20}
                    className={cn(
                        "text-teal-600 transition-transform",
                        isOpen && "transform rotate-180"
                    )}
                />
            </Pressable>
            {isOpen && (
                <View className="px-4 pb-4 pt-0 bg-slate-50 border-t border-slate-100">
                    <View className="h-3 w-full" />
                    <Text className={cn("text-slate-500 leading-relaxed font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>
                        {answer}
                    </Text>
                </View>
            )}
        </View>
    );
}

interface FAQCategoryProps {
    icon: React.ReactNode;
    title: string;
    items: { question: string; answer: string }[];
    openIndex: number | null;
    onToggle: (index: number) => void;
}

function FAQCategory({ icon, title, items, openIndex, onToggle }: FAQCategoryProps) {
    return (
        <View className="mb-6 bg-white p-5 rounded-[32px] border border-slate-200/80 shadow-sm">
            <View className={cn("flex-row items-center gap-3 mb-5", I18nManager.isRTL && "flex-row-reverse")}>
                <View className="w-10 h-10 rounded-2xl bg-teal-50 items-center justify-center">
                    {icon}
                </View>
                <Text className={cn("text-lg font-bold text-slate-800 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{title}</Text>
            </View>
            <View>
                {items.map((item, index) => (
                    <FAQItem
                        key={index}
                        question={item.question}
                        answer={item.answer}
                        isOpen={openIndex === index}
                        onToggle={() => onToggle(index)}
                    />
                ))}
            </View>
        </View>
    );
}

export default function FAQPage() {
    const { t } = useTranslation('info');

    // Track open items per category
    const [openStates, setOpenStates] = useState<Record<string, number | null>>({
        orders: null,
        shipping: null,
        payment: null,
        returns: null,
        account: null,
        products: null,
    });

    const handleToggle = (category: string, index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenStates(prev => ({
            ...prev,
            [category]: prev[category] === index ? null : index
        }));
    };

    const faqCategories = [
        {
            key: 'orders',
            icon: <ShoppingCart size={20} color="#d4af37" />,
            title: t('faq.categories.orders.title'),
            items: [
                { question: t('faq.categories.orders.q1'), answer: t('faq.categories.orders.a1') },
                { question: t('faq.categories.orders.q2'), answer: t('faq.categories.orders.a2') },
            ]
        },
        {
            key: 'shipping',
            icon: <Truck size={20} color="#d4af37" />,
            title: t('faq.categories.shipping.title'),
            items: [
                { question: t('faq.categories.shipping.q1'), answer: t('faq.categories.shipping.a1') },
                { question: t('faq.categories.shipping.q2'), answer: t('faq.categories.shipping.a2') },
            ]
        },
        {
            key: 'payment',
            icon: <CreditCard size={20} color="#d4af37" />,
            title: t('faq.categories.payment.title'),
            items: [
                { question: t('faq.categories.payment.q1'), answer: t('faq.categories.payment.a1') },
                { question: t('faq.categories.payment.q2'), answer: t('faq.categories.payment.a2') },
            ]
        },
        {
            key: 'returns',
            icon: <RotateCcw size={20} color="#d4af37" />,
            title: t('faq.categories.returns.title'),
            items: [
                { question: t('faq.categories.returns.q1'), answer: t('faq.categories.returns.a1') },
            ]
        },
    ];

    return (
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 60 }}>
            <Stack.Screen options={{ title: t('faq.hero.title') }} />
            
            {/* Hero Section */}
            <View className="bg-teal-700 py-16 px-4 items-center relative overflow-hidden mb-4">
                <Image 
                  source={require("@/assets/images/aka_g.png")} 
                  className="w-24 h-24 mb-4" 
                  resizeMode="contain" 
                />
                <View className="w-16 h-16 rounded-2xl bg-teal-600/50 items-center justify-center mb-6">
                    <HelpCircle size={32} color="#ccfbf1" />
                </View>
                <Text className="text-3xl font-bold mb-4 text-white text-center font-tajawal">
                    {t('faq.hero.title')}
                </Text>
                <Text className="text-[15px] text-teal-100 text-center px-4 font-tajawal">
                    {t('faq.hero.subtitle')}
                </Text>
            </View>

            {/* FAQ Content */}
            <View className="py-8 px-4">
                {faqCategories.map((category) => (
                    <FAQCategory
                        key={category.key}
                        icon={category.icon}
                        title={category.title}
                        items={category.items}
                        openIndex={openStates[category.key]}
                        onToggle={(index) => handleToggle(category.key, index)}
                    />
                ))}
            </View>

            {/* Contact Section */}
            <View className="py-8 px-4 bg-white mx-4 rounded-[32px] border border-slate-200/80 shadow-sm items-center mt-4 mb-8">
                <View className="w-14 h-14 rounded-2xl bg-teal-50 items-center justify-center mb-4">
                    <Mail size={24} className="text-teal-600" />
                </View>
                <Text className="text-xl font-bold text-slate-800 mb-3 text-center font-tajawal">
                    {t('faq.contact.title')}
                </Text>
                <Text className="text-sm text-slate-500 mb-6 text-center px-2 font-tajawal">
                    {t('faq.contact.description')}
                </Text>

                <View className="gap-3 w-full">
                     {/* Buttons - reusing styles */}
                     <Pressable className={cn("bg-teal-600 rounded-full py-4 px-6 items-center flex-row justify-center gap-2 shadow-sm active:bg-teal-700 active:scale-[0.98] transition-all", I18nManager.isRTL && "flex-row-reverse")}>
                         <Mail size={18} color="white"/>
                         <Text className="text-white font-bold font-tajawal text-[15px]">{t('faq.contact.emailButton')}</Text>
                     </Pressable>
                     <Pressable className={cn("bg-white border border-slate-200 rounded-full py-4 px-6 items-center flex-row justify-center gap-2 active:bg-slate-50", I18nManager.isRTL && "flex-row-reverse")}>
                         <Phone size={18} className="text-slate-700"/>
                         <Text className="text-slate-700 font-bold font-tajawal text-[15px]">{t('faq.contact.callButton')}</Text>
                     </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}
