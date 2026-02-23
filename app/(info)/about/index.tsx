import React from 'react';
import { View, ScrollView, Image, useWindowDimensions, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router, Stack } from 'expo-router';
import { Heart, Award, Users, Target, Sparkles, Shield, ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';

interface ValueCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function ValueCard({ icon, title, description }: ValueCardProps) {
    return (
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-4">
            <View className="w-14 h-14 rounded-full bg-yellow-500/10 items-center justify-center mb-4">
                {icon}
            </View>
            <Text className="text-xl font-bold text-slate-900 mb-2 text-start">{title}</Text>
            <Text className="text-slate-600 leading-relaxed text-start">{description}</Text>
        </View>
    );
}

export default function AboutPage() {
    const { t, i18n } = useTranslation('info');
    const isRtl = i18n.language === 'ar';
    const { width } = useWindowDimensions();

    const values = [
        {
            icon: <Shield size={28} color="#d4af37" />,
            title: t('about.values.authenticity.title'),
            description: t('about.values.authenticity.description'),
        },
        {
            icon: <Award size={28} color="#d4af37" />,
            title: t('about.values.excellence.title'),
            description: t('about.values.excellence.description'),
        },
        {
            icon: <Heart size={28} color="#d4af37" />,
            title: t('about.values.passion.title'),
            description: t('about.values.passion.description'),
        },
        {
            icon: <Users size={28} color="#d4af37" />,
            title: t('about.values.community.title'),
            description: t('about.values.community.description'),
        },
        {
            icon: <Target size={28} color="#d4af37" />,
            title: t('about.values.innovation.title'),
            description: t('about.values.innovation.description'),
        },
        {
            icon: <Sparkles size={28} color="#d4af37" />,
            title: t('about.values.trust.title'),
            description: t('about.values.trust.description'),
        },
    ];

    return (
        <ScrollView className="flex-1 bg-slate-50">
            <Stack.Screen options={{ title: t('about.meta.title') ,
                                          headerLeft: () => (
                              <Pressable onPress={() => router.back()} >
                                  <ChevronLeft color="#000000ff" size={28} />
                              </Pressable>
                          ),
            }}
             />
            
            {/* Hero Section */}
            <View className="bg-foreground py-16 overflow-hidden relative">
                 <View className="absolute inset-0 opacity-10">
                    {/* Abstract background pattern placeholder */}
                </View>
                <View className="px-4 z-10 items-center">
                    <Text className="text-3xl md:text-5xl font-bold mb-6 text-white text-center leading-tight">
                        {t('about.hero.title')}
                    </Text>
                    <Text className="text-lg text-white/80 text-center leading-relaxed px-4">
                        {t('about.hero.subtitle')}
                    </Text>
                </View>
            </View>

            {/* Story Section */}
            <View className="py-12 px-4">
                <Text className="text-2xl font-bold text-slate-900 mb-6 text-start">
                    {t('about.story.title')}
                </Text>
                <View className="gap-4 text-slate-600 mb-8">
                    <Text className="text-start leading-6 text-muted-foreground">{t('about.story.paragraph1')}</Text>
                    <Text className="text-start leading-6 text-muted-foreground">{t('about.story.paragraph2')}</Text>
                    <Text className="text-start leading-6 text-muted-foreground">{t('about.story.paragraph3')}</Text>
                </View>

                {/* Image Placeholder or Asset */}
                <View className="items-center justify-center bg-yellow-500/5 rounded-2xl p-8 aspect-square mb-8">
                    {/* Using require for local image if available, or placeholder */}
                    <Image
                        source={require('@/assets/images/icon.png')} // Replace with actual asset if available, or keep generic
                        className="w-48 h-48"
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* Mission Section */}
            <View className="py-12 px-4 bg-white">
                <View className="items-center">
                    <Text className="text-2xl font-bold text-slate-900 mb-6 text-center">
                        {t('about.mission.title')}
                    </Text>
                    <Text className="text-lg text-slate-600 leading-relaxed mb-8 text-center">
                        {t('about.mission.description')}
                    </Text>
                    
                    <View className="flex-row flex-wrap justify-center gap-4 w-full">
                        <View className="bg-slate-50 rounded-xl p-6 shadow-sm w-full md:w-[30%] items-center">
                            <Text className="text-3xl font-bold text-yellow-600 mb-2">500+</Text>
                            <Text className="text-slate-600">{t('about.stats.products')}</Text>
                        </View>
                        <View className="bg-slate-50 rounded-xl p-6 shadow-sm w-full md:w-[30%] items-center">
                            <Text className="text-3xl font-bold text-yellow-600 mb-2">50K+</Text>
                            <Text className="text-slate-600">{t('about.stats.customers')}</Text>
                        </View>
                        <View className="bg-slate-50 rounded-xl p-6 shadow-sm w-full md:w-[30%] items-center">
                            <Text className="text-3xl font-bold text-yellow-600 mb-2">100%</Text>
                            <Text className="text-slate-600">{t('about.stats.authentic')}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Values Section */}
            <View className="py-12 px-4">
                <View className="mb-8">
                    <Text className="text-2xl font-bold text-slate-900 mb-4 text-center">
                        {t('about.values.title')}
                    </Text>
                    <Text className="text-lg text-slate-600 text-center">
                        {t('about.values.subtitle')}
                    </Text>
                </View>
                <View>
                    {values.map((value, index) => (
                        <ValueCard key={index} {...value} />
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}
