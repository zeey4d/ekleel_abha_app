import React, { useMemo } from 'react';
import { View, FlatList, Image, Pressable, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft, Tags } from 'lucide-react-native';
import { I18nManager } from 'react-native';

// Hooks & State
import { useGetCategoryTreeQuery } from '@/store/features/categories/categoriesSlice';
import { useLocalizedEntityName } from '@/hooks/useLocalizedEntityName'; // Optional if you need granular control
import { getImageUrl } from '@/lib/image-utils';

// Types
import { Category } from '@/store/types';

export default function CategoriesListScreen() {
    const { t, i18n } = useTranslation('categories');
    const router = useRouter();
    const isRTL = i18n.language === 'ar';

    // 1. Fetch Categories
    const { data: categoryState, isLoading, error } = useGetCategoryTreeQuery({});

    // 2. Use the tree from state
    const categoryTree = useMemo(() => {
        return categoryState?.tree || [];
    }, [categoryState]);

    const renderCategoryItem = ({ item }: { item: any }) => {
        const name = isRTL ? (item.name_ar || item.name) : (item.name_en || item.name);
        const hasChildren = item.children && item.children.length > 0;

        return (
            <View className="mb-4">
                {/* Main Category Card */}
                <Pressable
                    onPress={() => router.push(`categories/${item.id}` as any)}
                    className="flex-row items-center bg-white p-4 rounded-xl border border-slate-100 active:bg-slate-50"
                    style={isRTL && !I18nManager.isRTL ? { flexDirection: 'row-reverse' } : undefined}
                >
                    <View 
                      className="bg-slate-50 w-12 h-12 rounded-lg items-center justify-center border border-slate-200"
                      style={{ marginEnd: 16 }}
                    >
                        {item.image ? (
                            <Image
                                source={{ uri: getImageUrl(item.image) }}
                                className="w-8 h-8"
                                resizeMode="contain"
                            />
                        ) : (
                            <Tags size={20} color="#94a3b8" />
                        )}
                    </View>
                    
                    <View className="flex-1">
                        <Text className="text-base font-bold text-slate-800 text-start">{name}</Text>
                        {hasChildren && (
                            <Text className="text-xs text-slate-400 text-start mt-0.5">
                                {item.children.length} {t('subCategories', 'أقسام فرعية')}
                            </Text>
                        )}
                    </View>

                    {isRTL ? (
                        <ArrowLeft size={20} color="#cbd5e1" />
                    ) : (
                        <ArrowRight size={20} color="#cbd5e1" />
                    )}
                </Pressable>

                {/* Subcategories (Preview - First 4) */}
                {hasChildren && (
                    <View className="flex-row flex-wrap mt-2 pl-4">
                         {item.children.slice(0, 4).map((child: any) => {
                             const childName = isRTL ? (child.name_ar || child.name) : (child.name_en || child.name);
                             return (
                                <Pressable
                                    key={child.id}
                                    onPress={() => router.push(`categories/${child.id}` as any)}
                                    className="mr-2 mb-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"
                                >
                                    <Text className="text-xs text-slate-600 font-medium font-outfit">{childName}</Text>
                                </Pressable>
                             );
                         })}
                         {item.children.length > 4 && (
                             <Pressable 
                                onPress={() => router.push(`categories/${item.id}` as any)}
                                className="mr-2 mb-2 px-2 py-1.5"
                             >
                                 <Text className="text-xs text-primary font-medium">+{item.children.length - 4} More</Text>
                             </Pressable>
                         )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View className="flex-1 bg-background">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('Header.title'),
                    headerStyle: { backgroundColor: '#fff' },
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} >
                            {isRTL ? (
                                <ArrowRight color="#000000ff" size={28} />
                            ) : (
                                <ArrowLeft color="#000000ff" size={28} />
                            )}
                        </Pressable>
                    ),
                }}
            />

            <FlatList
                data={categoryTree}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCategoryItem}
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
                
                ListEmptyComponent={
                    !isLoading ? (
                        <View className="items-center py-20">
                            <Text className="text-slate-400">{t('noCategories', 'No categories found')}</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}
