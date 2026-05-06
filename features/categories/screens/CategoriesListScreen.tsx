import React, { useMemo } from 'react';
import { View, FlatList, Image, Pressable, Text, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft, ChevronRight, ChevronLeft, Layers } from 'lucide-react-native';
import { I18nManager } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

// Hooks & State
import { useGetCategoryTreeQuery } from '@/store/features/categories/categoriesSlice';
import { getImageUrl } from '@/lib/image-utils';

export default function CategoriesListScreen() {
    const { t, i18n } = useTranslation('categories');
    const router = useRouter();
    const isRTL = i18n.language === 'ar';

    const { data: categoryState, isLoading, error } = useGetCategoryTreeQuery({});

    const categoryTree = useMemo(() => {
        return categoryState?.tree || [];
    }, [categoryState]);

    const renderCategoryItem = ({ item, index }: { item: any; index: number }) => {
        const name = isRTL ? (item.name_ar || item.name) : (item.name_en || item.name);
        const hasChildren = item.children && item.children.length > 0;
        const isRtlStyle = isRTL && !I18nManager.isRTL;

        return (
            <Animated.View 
                entering={FadeInDown.delay(index * 100).springify().damping(16).stiffness(150)}
                className="mb-5"
            >
                {/* Main Category Card */}
                <Pressable
                    onPress={() => router.push(`categories/${item.id}` as any)}
                    className="flex-row items-center bg-white p-4 rounded-[20px] border border-slate-100/80 active:bg-slate-50 transition-colors"
                    style={[{
                        shadowColor: '#94a3b8',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.08,
                        shadowRadius: 16,
                        elevation: 3,
                    }, isRtlStyle ? { flexDirection: 'row-reverse' } : undefined]}
                >
                    {/* Icon/Image Wrapper */}
                    <View 
                        className="bg-slate-50 w-16 h-16 rounded-[16px] items-center justify-center border border-slate-100"
                        style={isRtlStyle ? { marginLeft: 16 } : { marginRight: 16 }}
                    >
                        {item.image ? (
                            <Image
                                source={{ uri: getImageUrl(item.image) }}
                                className="w-10 h-10"
                                resizeMode="contain"
                            />
                        ) : (
                            <Layers size={26} color="#94a3b8" strokeWidth={1.5} />
                        )}
                    </View>
                    
                    {/* Text Details */}
                    <View className="flex-1 justify-center">
                        <Text 
                            className="text-[18px] font-bold text-slate-800 font-cairo" 
                            style={{ textAlign: isRTL ? 'right' : 'left' }}
                        >
                            {name}
                        </Text>
                        {hasChildren ? (
                            <View className="flex-row items-center mt-1" style={isRtlStyle ? { flexDirection: 'row-reverse' } : undefined}>
                                <Text className="text-[13px] text-slate-500 font-medium font-cairo">
                                    {item.children.length} {t('subCategories', 'أقسام فرعية')}
                                </Text>
                            </View>
                        ) : (
                            <Text className="text-[13px] text-slate-400 font-medium mt-1 font-cairo" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                {t('noSubcategories', 'لا يوجد أقسام فرعية')}
                            </Text>
                        )}
                    </View>

                    {/* Action Arrow */}
                    <View className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center border border-slate-100/50">
                        {isRTL ? (
                            <ChevronLeft size={18} color="#94a3b8" />
                        ) : (
                            <ChevronRight size={18} color="#94a3b8" />
                        )}
                    </View>
                </Pressable>

                {/* Subcategories Pills */}
                {hasChildren && (
                    <View 
                        className="flex-row flex-wrap mt-3 px-1" 
                        style={isRtlStyle ? { flexDirection: 'row-reverse' } : undefined}
                    >
                         {item.children.slice(0, 4).map((child: any) => {
                             const childName = isRTL ? (child.name_ar || child.name) : (child.name_en || child.name);
                             return (
                                <Pressable
                                    key={child.id}
                                    onPress={() => router.push(`categories/${child.id}` as any)}
                                    className={`bg-white px-4 py-2 rounded-full border border-slate-200 active:bg-slate-50 mb-2 ${isRtlStyle ? 'ml-2' : 'mr-2'}`}
                                    style={{
                                        shadowColor: '#cbd5e1',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 4,
                                        elevation: 1,
                                    }}
                                >
                                    <Text className="text-[13px] text-slate-600 font-bold font-cairo">{childName}</Text>
                                </Pressable>
                             );
                         })}
                         {item.children.length > 4 && (
                             <Pressable 
                                onPress={() => router.push(`categories/${item.id}` as any)}
                                className="px-3 py-2 justify-center"
                             >
                                 <Text className="text-[13px] text-primary font-bold font-cairo" style={{ color: '#10b981' }}>
                                     {isRTL ? `+${item.children.length - 4} المزيد` : `+${item.children.length - 4} More`}
                                 </Text>
                             </Pressable>
                         )}
                    </View>
                )}
            </Animated.View>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('Header.title', 'الأقسام'),
                    headerTitleStyle: { 
                        fontFamily: 'Cairo-Bold',
                        fontWeight: 'bold',
                        fontSize: 18,
                        color: '#0f172a'
                    },
                    headerStyle: { backgroundColor: '#f8fafc' },
                    headerShadowVisible: false,
                    headerTitleAlign: 'center',
                    headerLeft: () => (
                        <Pressable 
                            onPress={() => router.back()} 
                            className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-200/50"
                        >
                            {isRTL ? (
                                <ArrowRight color="#334155" size={24} />
                            ) : (
                                <ArrowLeft color="#334155" size={24} />
                            )}
                        </Pressable>
                    ),
                }}
            />

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#10b981" />
                    <Text className="text-slate-500 mt-4 font-bold font-cairo">
                        {t('loading', 'جاري التحميل...')}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={categoryTree}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCategoryItem}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Animated.View entering={FadeIn} className="items-center justify-center py-32 px-4">
                            <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-6 shadow-sm border border-slate-100">
                                <Layers size={40} color="#cbd5e1" />
                            </View>
                            <Text className="text-lg font-bold text-slate-700 text-center mb-2 font-cairo">
                                {t('noCategoriesTitle', 'لا توجد أقسام حالياً')}
                            </Text>
                            <Text className="text-sm text-slate-500 text-center font-cairo leading-6">
                                {t('noCategoriesDesc', 'لم يتم إضافة أي أقسام حتى الآن، يرجى العودة لاحقاً للحصول على المزيد من التحديثات.')}
                            </Text>
                        </Animated.View>
                    }
                />
            )}
        </View>
    );
}
