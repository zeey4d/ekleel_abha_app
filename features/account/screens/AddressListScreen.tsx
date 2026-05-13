import React from 'react';
import { View, FlatList, TouchableOpacity, Alert, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useRouter, Stack } from 'expo-router';
import { useGetUserAddressesQuery, useDeleteAddressMutation, useUpdateAddressMutation } from '@/store/features/addresses/addressesSlice';
import { Loader2, Plus, Trash2, Edit2, Check, MapPin, ChevronLeft } from 'lucide-react-native';

import { I18nManager } from 'react-native';
import { cn } from '@/lib/utils';

export default function AddressList() {
    const { t } = useTranslation('account');
    const router = useRouter();
    const { data: addressState, isLoading } = useGetUserAddressesQuery();
    const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
    const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();

    const addresses = addressState?.ids.map(id => addressState.entities[id]).filter(Boolean) || [];

    const handleSetDefault = async (id: number | string) => {
        try {
            await updateAddress({ id, default: true }).unwrap();
            // Toast or Snackbar here
        } catch (err) {
            console.error("Failed to set default address", err);
        }
    };

    const handleDelete = (id: number | string) => {
        Alert.alert(
            t('confirmDelete'),
            t('confirmDeleteMessage'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAddress(id).unwrap();
                        } catch (err) {
                            console.error("Failed to delete address", err);
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
                    title: t('addresses'),
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
            <View className={cn("flex-row items-center justify-between mb-6 mt-2", I18nManager.isRTL && "flex-row-reverse")}>
                <Text className="text-2xl font-bold font-tajawal text-slate-800 dark:text-white">{t('addresses')}</Text>
                <Pressable 
                    onPress={() => router.push('/(tabs)/(account)/addresses/new' as any)}
                    className={cn("flex-row items-center bg-teal-600 px-5 py-2.5 rounded-full active:scale-95 transition-all shadow-sm", I18nManager.isRTL && "flex-row-reverse")}
                >
                    <Plus size={18} color="white" className={I18nManager.isRTL ? "ml-2" : "mr-2"} />
                    <Text className="text-white font-bold font-tajawal text-sm">{t('addAddress')}</Text>
                </Pressable>
            </View>

            <FlatList
                data={addresses}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ gap: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center py-16 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800/80 mt-4 shadow-sm">
                        <View className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                            <MapPin size={40} className="text-slate-400" color="#94a3b8" />
                        </View>
                        <Text className="text-lg font-bold text-slate-500 dark:text-slate-400 font-tajawal text-center px-4">{t('noAddresses')}</Text>
                    </View>
                }
                renderItem={({ item: address }) => (
                    <View className={cn(
                        "p-6 rounded-[32px] border shadow-sm relative overflow-hidden",
                        address.default 
                            ? "bg-teal-50/50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-900" 
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80"
                    )}>
                        {address.default && (
                            <View className={cn("absolute top-5 bg-teal-100 dark:bg-teal-900/30 px-3 py-1 rounded-full", I18nManager.isRTL ? "left-5" : "right-5")}>
                                <Text className="text-[10px] text-teal-700 dark:text-teal-400 font-bold uppercase tracking-widest font-tajawal">{t('defaultAddress')}</Text>
                            </View>
                        )}
                        
                        <View className="mb-5">
                            <Text className={cn("text-lg font-bold mb-2 font-tajawal text-slate-800 dark:text-white", I18nManager.isRTL && "text-right")}>
                                {address.firstname} {address.lastname}
                            </Text>
                            <View className="flex-col gap-1.5">
                                {!!address.company && <Text className={cn("text-slate-500 dark:text-slate-400 font-tajawal text-sm", I18nManager.isRTL && "text-right")}>{address.company}</Text>}
                                <Text className={cn("text-slate-500 dark:text-slate-400 font-tajawal text-sm", I18nManager.isRTL && "text-right")}>{address.address_1}</Text>
                                {!!address.address_2 && <Text className={cn("text-slate-500 dark:text-slate-400 font-tajawal text-sm", I18nManager.isRTL && "text-right")}>{address.address_2}</Text>}
                                <Text className={cn("text-slate-500 dark:text-slate-400 font-tajawal text-sm", I18nManager.isRTL && "text-right")}>{address.city}, {address.postcode}</Text>
                                <Text className={cn("text-slate-500 dark:text-slate-400 font-tajawal text-sm", I18nManager.isRTL && "text-right")}>{address.zone?.name || address.zone_id}, {address.country_id}</Text>
                            </View>
                        </View>

                        <View className={cn("flex-row justify-between pt-4 border-t", address.default ? "border-teal-100 dark:border-teal-900/50" : "border-slate-100 dark:border-slate-800/50", I18nManager.isRTL && "flex-row-reverse")}>
                            {!address.default ? (
                                <Pressable 
                                    onPress={() => handleSetDefault(address.id)}
                                    disabled={isUpdating}
                                    className={cn("flex-row items-center", I18nManager.isRTL && "flex-row-reverse")}
                                >
                                    {isUpdating ? <Loader2 size={16} className="animate-spin text-slate-400" /> : <Check size={16} className="text-slate-400" />}
                                    <View className="w-1.5" />
                                    <Text className="text-[13px] text-slate-500 dark:text-slate-400 font-bold font-tajawal">{t('setAsDefault')}</Text>
                                </Pressable>
                            ) : <View />}
                            
                            <View className={cn("flex-row gap-2", I18nManager.isRTL && "flex-row-reverse")}>
                                <Pressable 
                                    onPress={() => router.push(`/(tabs)/(account)/addresses/${address.id}` as any)}
                                    className="p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl active:bg-slate-50 dark:active:bg-slate-700"
                                >
                                    <Edit2 size={18} className="text-slate-600 dark:text-slate-300" />
                                </Pressable>

                                <Pressable 
                                    onPress={() => handleDelete(address.id)}
                                    className="p-2.5 border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-xl active:bg-red-100 dark:active:bg-red-900/20"
                                >
                                    {isDeleting ? <Loader2 size={18} className="animate-spin text-red-500" /> : <Trash2 size={18} color="#ef4444" />}
                                </Pressable>
                            </View>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}
