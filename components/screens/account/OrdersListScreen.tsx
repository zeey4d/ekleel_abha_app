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
        <View className={`${bgClass} px-2 py-1 rounded mr-2`}>
            <Text className={`${textClass} text-xs font-bold capitalize font-cairo`}>{status}</Text>
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
            <View className="flex-1 justify-center items-center p-8">
                <Loader2 size={32} className="animate-spin text-primary" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background p-4">
             <Stack.Screen 
                options={{ 
                    headerShown: true,
                    title: t('orders'),
                    headerBackTitle: "", 
                    headerTintColor: '#000',
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} >
                            <ChevronLeft color="#000000ff" size={28} />
                        </Pressable>
                    ),
                }} 
            />
            <Text className="text-2xl font-bold mb-6 font-cairo">{t('orders')}</Text>

            <FlatList
                data={orders}
                keyExtractor={(item) => (item?.id || Math.random()).toString()}
                contentContainerStyle={{ gap: 16, paddingBottom: 20 }}
                ListEmptyComponent={
                    <Card className="flex-1 justify-center items-center py-16">
                         <View className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <Package size={32} className="text-muted-foreground" color="gray" />
                        </View>
                        <Text className="text-lg font-medium text-foreground mb-4 font-cairo">{t('noOrders')}</Text>
                        <Button onPress={() => router.push('/(tabs)/(home)/(context)/products')} className="bg-primary">
                             <Text className="text-white font-cairo">{tShared('startShopping') || "Start Shopping"}</Text>
                        </Button>
                    </Card>
                }
                renderItem={({ item: order }) => (
                    <Card className="overflow-hidden">
                        {/* Header */}
                        <View className="bg-muted/30 p-4 flex-row items-center justify-between border-b border-border/50">
                            <View className="flex-1">
                                <Text className="text-xs text-muted-foreground uppercase tracking-wider font-cairo">{t('orderId')}</Text>
                                <Text className="font-bold font-mono">#{order.order_id || order.id}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs text-muted-foreground uppercase tracking-wider font-cairo">{t('date')}</Text>
                                <Text className="text-sm font-cairo">{new Date(order.date_added).toLocaleDateString()}</Text>
                            </View>
                             <View className="flex-1 items-end">
                                <Text className="text-xs text-muted-foreground uppercase tracking-wider font-cairo">{t('total')}</Text>
                                <Text className="font-bold text-primary font-cairo">{Number(order.total).toFixed(2)} SAR</Text>
                            </View>
                        </View>

                        {/* Content */}
                        <View className="p-4">
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row -space-x-2">
                                     {(order.products || []).slice(0, 3).map((product, idx) => (
                                        <View key={idx} className="w-10 h-10 rounded-full border-2 border-background bg-white overflow-hidden z-10">
                                             <Image
                                                source={{ uri: getImageUrl(product.image) }}
                                                className="w-full h-full"
                                                resizeMode="cover"
                                            />
                                        </View>
                                    ))}
                                    {(order.products?.length || 0) > 3 && (
                                        <View className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center z-0">
                                            <Text className="text-xs font-medium text-muted-foreground">
                                                +{(order.products?.length || 0) - 3}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <OrderStatusBadge status={order.status} />
                            </View>

                            <View className="flex-row gap-2">
                                <Button 
                                    onPress={() => router.push(`/(tabs)/(account)/account/orders/${order.id}` as any)} 
                                    className="flex-1 flex-row items-center justify-center bg-secondary"
                                >
                                    <Eye size={16} color="black" className="mr-2" />
                                    <Text className="font-cairo">{t('viewOrder')}</Text>
                                </Button>

                                {(order.status_id === 1 || order.status === 'Pending') && (
                                     <Button 
                                        onPress={() => handleCancel(order.id || 0)}
                                        className="bg-red-50 flex-row items-center justify-center px-4"
                                    >
                                        {isCancelling ? <Loader2 size={16} className="animate-spin text-red-500" /> : <Ban size={16} color="#ef4444" />}
                                    </Button>
                                )}
                            </View>
                        </View>
                    </Card>
                )}
            />
        </View>
    );
}
