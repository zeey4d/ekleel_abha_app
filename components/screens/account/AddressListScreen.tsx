import React from 'react';
import { View, FlatList, TouchableOpacity, Alert, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useRouter, Stack } from 'expo-router';
import { useGetUserAddressesQuery, useDeleteAddressMutation, useUpdateAddressMutation } from '@/store/features/addresses/addressesSlice';
import { Loader2, Plus, Trash2, Edit2, Check, MapPin, ChevronLeft } from 'lucide-react-native';

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
                    title: t('addresses'),
                    headerBackTitle: "", 
                    headerTintColor: '#000',
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} >
                            <ChevronLeft color="#000000ff" size={28} />
                        </Pressable>
                    ),
                }} 
            />
            <View className="flex-row items-center justify-between mb-6">
                <Text className="text-2xl font-bold">{t('addresses')}</Text>
                <Button 
                    onPress={() => router.push('/(tabs)/(account)/addresses/new' as any)}
                    className="flex-row items-center bg-primary"
                >
                    <Plus size={16} color="white" className="mr-2" />
                    <Text className="text-white ml-2">{t('addAddress')}</Text>
                </Button>
            </View>

            <FlatList
                data={addresses}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ gap: 16, paddingBottom: 20 }}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center py-12 bg-card rounded-lg border border-border">
                        <MapPin size={48} className="text-muted-foreground opacity-30 mb-4" />
                        <Text className="text-muted-foreground">{t('noAddresses')}</Text>
                    </View>
                }
                renderItem={({ item: address }) => (
                    <View className={`p-4 rounded-xl border ${address.default ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                        {address.default && (
                            <View className="absolute top-3 right-3 bg-primary px-2 py-1 rounded">
                                <Text className="text-xs text-white font-bold">{t('defaultAddress')}</Text>
                            </View>
                        )}
                        
                        <View className="mb-4">
                            <Text className="text-lg font-bold mb-1">
                                {address.firstname} {address.lastname}
                            </Text>
                            <View className="flex-col gap-1">
                                {!!address.company && <Text className="text-muted-foreground">{address.company}</Text>}
                                <Text className="text-muted-foreground">{address.address_1}</Text>
                                {!!address.address_2 && <Text className="text-muted-foreground">{address.address_2}</Text>}
                                <Text className="text-muted-foreground">{address.city}, {address.postcode}</Text>
                                <Text className="text-muted-foreground">{address.zone?.name || address.zone_id}, {address.country_id}</Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between pt-4 border-t border-border/50">
                            {!address.default && (
                                <TouchableOpacity 
                                    onPress={() => handleSetDefault(address.id)}
                                    disabled={isUpdating}
                                    className="flex-row items-center"
                                >
                                    {isUpdating ? <Loader2 size={14} className="animate-spin mr-1" color="gray" /> : <Check size={14} className="mr-1" color="gray" />}
                                    <Text className="text-xs text-muted-foreground">{t('setAsDefault')}</Text>
                                </TouchableOpacity>
                            )}
                            
                            <View className="flex-row gap-2 ml-auto">
                                <TouchableOpacity 
                                    onPress={() => router.push(`/(tabs)/(account)/addresses/${address.id}` as any)}
                                    className="p-2 border border-border rounded-md"
                                >
                                    <Edit2 size={16} className="text-foreground" color="black" />
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    onPress={() => handleDelete(address.id)}
                                    className="p-2 border border-red-200 bg-red-50 rounded-md"
                                >
                                    {isDeleting ? <Loader2 size={16} className="animate-spin text-red-500" /> : <Trash2 size={16} color="#ef4444" />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}
