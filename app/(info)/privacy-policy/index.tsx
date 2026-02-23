import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, Stack } from 'expo-router';
import {
    Shield, Eye, Database, Lock, Share2, Cookie,
    UserCheck, Bell, Mail,
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

export default function PrivacyPolicyPage() {
    const { t } = useTranslation('info');

    return (
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 40 }}>
            <Stack.Screen options={{ title: t('privacyPolicy.hero.title') 
                ,            headerLeft: () => (
                              <Pressable onPress={() => router.back()} >
                                  <ChevronLeft color="#000000ff" size={28} />
                              </Pressable>
                          ),
            }} />

            {/* Hero Section */}
            <View className="bg-foreground py-16 px-4 items-center">
                <View className="w-16 h-16 rounded-full bg-yellow-500/20 items-center justify-center mb-6">
                    <Shield size={32} color="#d4af37" />
                </View>
                <Text className="text-3xl font-bold mb-4 text-white text-center">
                    {t('privacyPolicy.hero.title')}
                </Text>
                <Text className="text-lg text-white/80 text-center px-4">
                    {t('privacyPolicy.hero.subtitle')}
                </Text>
                <Text className="text-sm text-white/60 mt-4 text-center">
                    {t('privacyPolicy.hero.lastUpdated')}
                </Text>
            </View>

            {/* Content Section */}
            <View className="py-8 px-4">
                <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

                    {/* Introduction */}
                    <View className="mb-10 p-5 bg-slate-50 rounded-xl border border-slate-100">
                        <Text className="text-slate-700 leading-relaxed text-start">
                            {t('privacyPolicy.introduction')}
                        </Text>
                    </View>

                    {/* Section 1: Information We Collect */}
                    <Section
                        icon={<Database size={20} color="#d4af37" />}
                        title={t('privacyPolicy.sections.collection.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('privacyPolicy.sections.collection.intro')}</Text>
                        <Text className="font-medium text-slate-800 mt-2 text-start">{t('privacyPolicy.sections.collection.personal.title')}</Text>
                        <BulletPoint>{t('privacyPolicy.sections.collection.personal.name')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.collection.personal.contact')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.collection.personal.address')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.collection.personal.payment')}</BulletPoint>
                        <Text className="font-medium text-slate-800 mt-2 text-start">{t('privacyPolicy.sections.collection.automatic.title')}</Text>
                        <BulletPoint>{t('privacyPolicy.sections.collection.automatic.device')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.collection.automatic.browsing')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.collection.automatic.ip')}</BulletPoint>
                    </Section>

                    {/* Section 2: How We Use Your Information */}
                    <Section
                        icon={<Eye size={20} color="#d4af37" />}
                        title={t('privacyPolicy.sections.usage.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('privacyPolicy.sections.usage.intro')}</Text>
                        <BulletPoint>{t('privacyPolicy.sections.usage.points.orders')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.usage.points.communication')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.usage.points.improve')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.usage.points.personalize')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.usage.points.security')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.usage.points.legal')}</BulletPoint>
                    </Section>

                    {/* Section 3: Information Sharing */}
                    <Section
                        icon={<Share2 size={20} color="#d4af37" />}
                        title={t('privacyPolicy.sections.sharing.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('privacyPolicy.sections.sharing.intro')}</Text>
                        <BulletPoint>{t('privacyPolicy.sections.sharing.points.service')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.sharing.points.payment')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.sharing.points.delivery')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.sharing.points.legal')}</BulletPoint>
                        <Text className="text-slate-600 leading-relaxed mt-2 text-start">{t('privacyPolicy.sections.sharing.noSell')}</Text>
                    </Section>

                    {/* Section 4: Data Security */}
                    <Section
                        icon={<Lock size={20} color="#d4af37" />}
                        title={t('privacyPolicy.sections.security.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('privacyPolicy.sections.security.content')}</Text>
                        <BulletPoint>{t('privacyPolicy.sections.security.measures.ssl')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.security.measures.encryption')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.security.measures.access')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.security.measures.monitoring')}</BulletPoint>
                    </Section>

                    {/* Section 5: Cookies */}
                    <Section
                        icon={<Cookie size={20} color="#d4af37" />}
                        title={t('privacyPolicy.sections.cookies.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('privacyPolicy.sections.cookies.intro')}</Text>
                        <BulletPoint>{t('privacyPolicy.sections.cookies.types.essential')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.cookies.types.analytics')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.cookies.types.preferences')}</BulletPoint>
                        <Text className="text-slate-600 leading-relaxed mt-2 text-start">{t('privacyPolicy.sections.cookies.control')}</Text>
                    </Section>

                    {/* Section 6: Your Rights */}
                    <Section
                        icon={<UserCheck size={20} color="#d4af37" />}
                        title={t('privacyPolicy.sections.rights.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('privacyPolicy.sections.rights.intro')}</Text>
                        <BulletPoint>{t('privacyPolicy.sections.rights.points.access')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.rights.points.correction')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.rights.points.deletion')}</BulletPoint>
                        <BulletPoint>{t('privacyPolicy.sections.rights.points.optout')}</BulletPoint>
                    </Section>

                    {/* Section 7: Data Retention */}
                    <Section
                        icon={<Database size={20} color="#d4af37" />}
                        title={t('privacyPolicy.sections.retention.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('privacyPolicy.sections.retention.content')}</Text>
                    </Section>

                    {/* Section 8: Updates to Policy */}
                    <Section
                        icon={<Bell size={20} color="#d4af37" />}
                        title={t('privacyPolicy.sections.updates.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('privacyPolicy.sections.updates.content')}</Text>
                    </Section>

                    {/* Section 9: Children's Privacy */}
                    <Section
                        icon={<Shield size={20} color="#d4af37" />}
                        title={t('privacyPolicy.sections.children.title')}
                    >
                        <Text className="text-slate-600 leading-relaxed text-start">{t('privacyPolicy.sections.children.content')}</Text>
                    </Section>

                    {/* Contact Section */}
                    <View className="mt-8 p-5 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
                        <View className="flex-row items-start gap-4">
                            <View className="w-10 h-10 rounded-full bg-yellow-500/10 items-center justify-center">
                                <Mail size={20} color="#d4af37" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-slate-900 mb-2 text-start">{t('privacyPolicy.contact.title')}</Text>
                                <Text className="text-slate-600 text-start">
                                    {t('privacyPolicy.contact.content')}
                                </Text>
                                <Text className="text-slate-600 mt-2 text-start">
                                    <Text className="font-bold">{t('privacyPolicy.contact.email')}</Text> support@ekleelabha.com
                                </Text>
                                <Text className="text-slate-600 text-start">
                                    <Text className="font-bold">{t('privacyPolicy.contact.phone')}</Text> 0575637926
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
