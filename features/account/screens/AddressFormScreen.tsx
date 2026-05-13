import React, { useEffect, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, Switch, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAddAddressMutation, useUpdateAddressMutation, useGetUserAddressesQuery } from '@/store/features/addresses/addressesSlice';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Loader2, ChevronLeft } from 'lucide-react-native';
import { Button } from '@/components/ui/button';

// Schema
const addressSchema = z.object({
    firstname: z.string().min(2, "First name is required"),
    lastname: z.string().min(2, "Last name is required"),
    company: z.string().optional(),
    address_1: z.string().min(5, "Street address is required"),
    address_2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    postcode: z.string().optional(),
    country_id: z.number().min(1, "Country is required"),
    zone_id: z.number().min(1, "Region is required"),
    default: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function AddressFormScreen() {
    const { t } = useTranslation('account');
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const mode = id ? 'edit' : 'create';

    const { data: addressesData, isLoading: isLoadingAddresses } = useGetUserAddressesQuery(undefined, {
        skip: mode === 'create',
    });

    const initialData = useMemo(() => {
        if (mode === 'create' || !addressesData) return undefined;
        return addressesData.entities[id!];
    }, [addressesData, id, mode]);

    const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();
    const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();

    const isLoading = isAdding || isUpdating || (mode === 'edit' && isLoadingAddresses);

    const { control, handleSubmit, formState: { errors }, reset } = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            firstname: "",
            lastname: "",
            company: "",
            address_1: "",
            address_2: "",
            city: "",
            postcode: "",
            country_id: 184, // Default to Saudi Arabia
            zone_id: 0, // Default
            default: false,
        },
    });

    useEffect(() => {
        if (initialData) {
            reset({
                firstname: initialData.firstname,
                lastname: initialData.lastname,
                company: initialData.company,
                address_1: initialData.address_1,
                address_2: initialData.address_2,
                city: initialData.city,
                postcode: initialData.postcode,
                country_id: Number(initialData.country_id),
                zone_id: Number(initialData.zone_id),
                default: initialData.default,
            });
        }
    }, [initialData, reset]);

    const onSubmit = async (values: AddressFormValues) => {
        try {
            if (mode === "create") {
                await addAddress(values).unwrap();
                // Toast success
            } else {
                if (!id) return;
                await updateAddress({ id: Number(id), ...values }).unwrap();
                // Toast success
            }
            router.back();
        } catch (error: any) {
            console.error(error);
            // Handle error (toast)
        }
    };

    if (mode === 'edit' && isLoadingAddresses) {
        return (
            <View className="flex-1 justify-center items-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </View>
        );
    }

    if (mode === 'edit' && !initialData && !isLoadingAddresses) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-red-500 font-medium font-cairo text-lg">{t('addressNotFound') || "Address not found"}</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-slate-50 p-4" contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}>
            <Stack.Screen 
                options={{ 
                    headerShown: true,
                    title: mode === 'create' ? t('addAddress') : t('editAddress'),
                    headerBackTitle: "", 
                    headerTintColor: '#0f172a',
                    headerTitleStyle: { fontFamily: 'Tajawal_700Bold', fontSize: 18 },
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} className="px-2" >
                            <ChevronLeft color="#0f172a" size={28} />
                        </Pressable>
                    ),
                }} 
            />

            <View className="mb-6 p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800/80 shadow-sm">
                <Text className="text-xl font-bold mb-6 font-tajawal text-slate-800 dark:text-white">
                    {mode === 'create' ? t('addAddress') : t('editAddress')}
                </Text>

                <View className="space-y-4">
                {/* First Name */}
                <View>
                    <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-tajawal">{t('firstname')}</Text>
                    <Controller
                        control={control}
                        name="firstname"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-tajawal text-slate-800 dark:text-white"
                                value={value}
                                onChangeText={onChange}
                                placeholder={t('firstname')}
                                placeholderTextColor="#94a3b8"
                            />
                        )}
                    />
                    {errors.firstname && <Text className="text-red-500 text-xs mt-1 font-tajawal">{errors.firstname.message}</Text>}
                </View>

                {/* Last Name */}
                <View>
                    <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-tajawal">{t('lastname')}</Text>
                    <Controller
                        control={control}
                        name="lastname"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-tajawal text-slate-800 dark:text-white"
                                value={value}
                                onChangeText={onChange}
                                placeholder={t('lastname')}
                                placeholderTextColor="#94a3b8"
                            />
                        )}
                    />
                    {errors.lastname && <Text className="text-red-500 text-xs mt-1 font-tajawal">{errors.lastname.message}</Text>}
                </View>

                {/* Company */}
                <View>
                    <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-tajawal">{t('company')} ({t('optional')})</Text>
                    <Controller
                        control={control}
                        name="company"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-tajawal text-slate-800 dark:text-white"
                                value={value}
                                onChangeText={onChange}
                                placeholder={t('company')}
                                placeholderTextColor="#94a3b8"
                            />
                        )}
                    />
                </View>

                {/* Address 1 */}
                <View>
                    <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-tajawal">{t('address_1')}</Text>
                    <Controller
                        control={control}
                        name="address_1"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-tajawal text-slate-800 dark:text-white"
                                value={value}
                                onChangeText={onChange}
                                placeholder={t('address_1')}
                                placeholderTextColor="#94a3b8"
                            />
                        )}
                    />
                    {errors.address_1 && <Text className="text-red-500 text-xs mt-1 font-tajawal">{errors.address_1.message}</Text>}
                </View>

                {/* Address 2 */}
                <View>
                    <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-tajawal">{t('address_2')}</Text>
                    <Controller
                        control={control}
                        name="address_2"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-tajawal text-slate-800 dark:text-white"
                                value={value}
                                onChangeText={onChange}
                                placeholder={t('address_2')}
                                placeholderTextColor="#94a3b8"
                            />
                        )}
                    />
                </View>

                {/* City */}
                <View>
                    <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-tajawal">{t('city')}</Text>
                    <Controller
                        control={control}
                        name="city"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-tajawal text-slate-800 dark:text-white"
                                value={value}
                                onChangeText={onChange}
                                placeholder={t('city')}
                                placeholderTextColor="#94a3b8"
                            />
                        )}
                    />
                    {errors.city && <Text className="text-red-500 text-xs mt-1 font-tajawal">{errors.city.message}</Text>}
                </View>

                {/* Postcode */}
                <View>
                    <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-tajawal">{t('postcode')}</Text>
                    <Controller
                        control={control}
                        name="postcode"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-tajawal text-slate-800 dark:text-white"
                                value={value}
                                onChangeText={onChange}
                                placeholder={t('postcode')}
                                placeholderTextColor="#94a3b8"
                                keyboardType="numeric"
                            />
                        )}
                    />
                </View>

                {/* Default Address Switch */}
                <View className="flex-row items-center justify-between p-5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 mt-2">
                    <Text className="text-[15px] font-bold text-slate-700 dark:text-slate-300 font-tajawal">{t('defaultAddress')}</Text>
                    <Controller
                        control={control}
                        name="default"
                        render={({ field: { onChange, value } }) => (
                            <Switch
                                value={value}
                                onValueChange={onChange}
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={value ? '#fdfdfd' : '#f4f3f4'}
                            />
                        )}
                    />
                </View>

                <Pressable 
                    onPress={handleSubmit(onSubmit)} 
                    disabled={isLoading}
                    className="mt-8 bg-teal-600 py-4 rounded-full flex-row justify-center items-center active:bg-teal-700 active:scale-[0.98] transition-all shadow-sm"
                >
                    {isLoading && <Loader2 color="white" size={20} className="animate-spin mr-2" />}
                    <Text className="text-white font-bold font-tajawal text-[15px]">{t('saveAddress')}</Text>
                </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}
