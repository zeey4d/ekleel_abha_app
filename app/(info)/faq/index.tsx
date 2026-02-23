import React, { useState } from 'react';
import { View, ScrollView, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HelpCircle, ChevronDown, ShoppingCart, Truck, CreditCard, RotateCcw, Mail, Phone, ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { router, Stack } from 'expo-router';
import { cn } from '@/lib/utils';

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
        <View className="border border-border rounded-xl mb-3 overflow-hidden bg-white">
            <Pressable
                onPress={onToggle}
                className="flex-row items-center justify-between p-4 bg-background"
            >
                <Text className="font-medium text-foreground flex-1 text-start pr-4">{question}</Text>
                <ChevronDown
                    size={20}
                    className={cn(
                        "text-yellow-500 transition-transform",
                        isOpen && "transform rotate-180"
                    )}
                    color="#d4af37"
                />
            </Pressable>
            {isOpen && (
                <View className="px-4 pb-4 pt-0 bg-slate-50">
                    <View className="h-[1px] bg-slate-100 mb-3 w-full" />
                    <Text className="text-muted-foreground leading-relaxed text-start">
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
        <View className="mb-8">
            <View className="flex-row items-center gap-3 mb-4">
                <View className="w-10 h-10 rounded-full bg-yellow-500/10 items-center justify-center">
                    {icon}
                </View>
                <Text className="text-xl font-bold text-foreground">{title}</Text>
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
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 40 }}>
            <Stack.Screen options={{ title: t('faq.hero.title'),             headerLeft: () => (
                              <Pressable onPress={() => router.back()} >
                                  <ChevronLeft color="#000000ff" size={28} />
                              </Pressable>
                          ),}} />
            
            {/* Hero Section */}
            <View className="bg-foreground py-16 px-4 items-center">
                <View className="w-16 h-16 rounded-full bg-yellow-500/20 items-center justify-center mb-6">
                    <HelpCircle size={32} color="#d4af37" />
                </View>
                <Text className="text-3xl font-bold mb-4 text-white text-center">
                    {t('faq.hero.title')}
                </Text>
                <Text className="text-lg text-white/80 text-center px-4">
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
            <View className="py-12 px-4 bg-white items-center">
                <View className="w-14 h-14 rounded-full bg-yellow-500/10 items-center justify-center mb-4">
                    <Mail size={24} color="#d4af37" />
                </View>
                <Text className="text-2xl font-bold text-foreground mb-4 text-center">
                    {t('faq.contact.title')}
                </Text>
                <Text className="text-muted-foreground mb-6 text-center px-4">
                    {t('faq.contact.description')}
                </Text>

                <View className="gap-3 w-full">
                     {/* Buttons - reusing styles */}
                     <Pressable className="bg-yellow-600 rounded-full py-3 px-6 items-center flex-row justify-center gap-2">
                         <Mail size={18} color="white"/>
                         <Text className="text-white font-bold">{t('faq.contact.emailButton')}</Text>
                     </Pressable>
                     <Pressable className="bg-white border border-border rounded-full py-3 px-6 items-center flex-row justify-center gap-2">
                         <Phone size={18} color="black"/>
                         <Text className="text-foreground font-bold">{t('faq.contact.callButton')}</Text>
                     </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}
