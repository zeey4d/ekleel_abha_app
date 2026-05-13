import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Link, useRouter, Stack } from 'expo-router';
import { useGetOrdersQuery, useRequestOrderCancellationMutation } from '@/store/features/orders/ordersSlice';
import { Loader2, Package, Eye, Ban, ChevronLeft } from 'lucide-react-native';
import { getImageUrl } from '@/lib/image-utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'; // Assume compatibility or basic View
import { Badge } from '@/components/ui/badge'; // Assume compatibility or basic View with style
import { I18nManager } from 'react-native';
import { cn } from '@/lib/utils';

const OrderStatusBadge = ({ status }: { status?: string }) => {
    if (!status) return <View className="bg-gray-200 px-2 py-1 rounded"><Text className="text-xs text-gray-700 font-cairo">Unknown</Text></View>;

    let bgClass = "bg-gray-200";
    let textClass = "text-gray-700";

    const statusLower = status.toLowerCase();

    if (["delivered", "complete", "completed", "shipped"].includes(statusLower)) {
        bgClass = "bg-green-100";
        textClass = "text-green-700";
    } else if (["pending", "processing"].includes(statusLower)) {
        bgClass = "bg-yellow-100";
        textClass = "text-yellow-700";
    } else if (["canceled", "cancelled", "failed", "refunded", "denied"].includes(statusLower)) {
        bgClass = "bg-red-100";
        textClass = "text-red-700";
    }

    return (
        <View className={cn(`${bgClass} px-3 py-1.5 rounded-full mr-2`, I18nManager.isRTL && "mr-0 ml-2")}>
            <Text className={`${textClass} text-[11px] font-bold uppercase tracking-widest font-tajawal`}>{status}</Text>
        </View>
    );
};

export default function OrdersList() {
    const { t } = useTranslation('account');
    const tShared = useTranslation('common').t;
    const router = useRouter();

    const { data: ordersState, isLoading } = useGetOrdersQuery({ page: 1, limit: 20 });
    const [cancelOrder, { isLoading: isCancelling }] = useRequestOrderCancellationMutation();

    const orders = ordersState?.ids.map(id => ordersState.entities[id]).filter(Boolean) || [];

    const handleCancel = (id: number | string) => {
        Alert.alert(
            "Cancel Order?",
            "Are you sure you want to cancel this order? This action cannot be undone.",
            [
                { text: "No, Keep it", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await cancelOrder({ orderId: id, reason: "User requested cancellation" }).unwrap();
                        } catch (err) {
                            console.error("Failed to cancel order", err);
                        }
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50 p-8">
                <Loader2 size={32} className="animate-spin text-teal-600" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50 p-4">
             <Stack.Screen 
                options={{ 
                    headerShown: true,
                    title: t('orders'),
                    headerBackTitle: "", 
                    headerTintColor: '#0f172a',
                    headerTitleStyle: { fontFamily: 'Tajawal_700Bold', fontSize: 18 },
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} className="px-2" >
                            <ChevronLeft color="#0f172a" size={28} style={I18nManager.isRTL ? { transform: [{ rotate: '180deg' }] } : {}} />
                        </Pressable>
                    ),
                }} 
            />

            <FlatList
                data={orders}
                keyExtractor={(item) => (item?.id || Math.random()).toString()}
                contentContainerStyle={{ gap: 16, paddingBottom: 100, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center py-16 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800/80 mt-4 shadow-sm">
                         <View className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                            <Package size={40} className="text-slate-400" color="#94a3b8" />
                        </View>
                        <Text className="text-lg font-bold text-slate-800 dark:text-white mb-6 font-tajawal text-center">{t('noOrders')}</Text>
                        <Pressable onPress={() => router.push('/(tabs)/(home)/(context)/products')} className="bg-teal-600 px-8 py-3.5 rounded-full active:scale-95 transition-all shadow-sm">
                             <Text className="text-white font-bold font-tajawal">{tShared('startShopping') || "Start Shopping"}</Text>
                        </Pressable>
                    </View>
                }
                renderItem={({ item: order }) => (
                    <View className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
                        {/* Header */}
                        <View className={cn("bg-slate-50/50 dark:bg-slate-800/30 p-5 flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/50", I18nManager.isRTL && "flex-row-reverse")}>
                            <View className={cn("flex-1", I18nManager.isRTL && "items-end")}>
                                <Text className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-tajawal mb-1">{t('orderId')}</Text>
                                <Text className="font-bold font-mono text-slate-800 dark:text-slate-200">#{order.order_id || order.id}</Text>
                            </View>
                            <View className={cn("flex-1", I18nManager.isRTL ? "items-start" : "items-center")}>
                                <Text className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-tajawal mb-1">{t('date')}</Text>
                                <Text className="text-sm font-bold text-slate-800 dark:text-slate-200 font-tajawal">{new Date(order.date_added).toLocaleDateString()}</Text>
                            </View>
                             <View className={cn("flex-1", I18nManager.isRTL ? "items-start" : "items-end")}>
                                <Text className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-tajawal mb-1">{t('total')}</Text>
                                <Text className="font-bold text-teal-600 font-tajawal">{Number(order.total).toFixed(2)} SAR</Text>
                            </View>
                        </View>

                        {/* Content */}
                        <View className="p-5">
                            <View className={cn("flex-row items-center justify-between mb-5", I18nManager.isRTL && "flex-row-reverse")}>
                                <View className={cn("flex-row -space-x-3", I18nManager.isRTL && "flex-row-reverse space-x-reverse")}>
                                     {(order.products || []).slice(0, 3).map((product, idx) => (
                                        <View key={idx} className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 overflow-hidden z-10 shadow-sm">
                                             <Image
                                                source={{ uri: getImageUrl(product.image) }}
                                                className="w-full h-full"
                                                resizeMode="cover"
                                            />
                                        </View>
                                    ))}
                                    {(order.products?.length || 0) > 3 && (
                                        <View className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 flex items-center justify-center z-0 shadow-sm">
                                            <Text className="text-xs font-bold text-slate-500 font-tajawal">
                                                +{(order.products?.length || 0) - 3}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <OrderStatusBadge status={order.status} />
                            </View>

                            <View className={cn("flex-row gap-3", I18nManager.isRTL && "flex-row-reverse")}>
                                <Pressable 
                                    onPress={() => router.push(`/(tabs)/(account)/account/orders/${order.id}` as any)} 
                                    className="flex-1 flex-row items-center justify-center bg-slate-100 dark:bg-slate-800 py-3.5 rounded-2xl active:bg-slate-200 dark:active:bg-slate-700 transition-colors"
                                >
                                    <Eye size={18} className="text-slate-600 dark:text-slate-300 mr-2" style={I18nManager.isRTL ? { marginRight: 0, marginLeft: 8 } : {}} />
                                    <Text className="font-bold text-slate-700 dark:text-slate-200 font-tajawal text-[13px]">{t('viewOrder')}</Text>
                                </Pressable>

                                {(order.status_id === 1 || order.status === 'Pending') && (
                                     <Pressable 
                                        onPress={() => handleCancel(order.id || 0)}
                                        className="bg-red-50 dark:bg-red-900/10 flex-row items-center justify-center px-5 rounded-2xl active:bg-red-100 dark:active:bg-red-900/20"
                                    >
                                        {isCancelling ? <Loader2 size={18} className="animate-spin text-red-500" /> : <Ban size={18} color="#ef4444" />}
                                    </Pressable>
                                )}
                            </View>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}
