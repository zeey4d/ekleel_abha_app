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
        <ScrollView className="flex-1 bg-background p-4" contentContainerStyle={{ paddingBottom: 40 }}>
            <Stack.Screen 
                options={{ 
                    headerShown: true,
                    title: mode === 'create' ? t('addAddress') : t('editAddress'),
                    headerBackTitle: "", 
                    headerTintColor: '#000',
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} >
                            <ChevronLeft color="#000000ff" size={28} />
                        </Pressable>
                    ),
                }} 
            />
            <Text className="text-2xl font-bold mb-6 font-cairo">
                {mode === 'create' ? t('addAddress') : t('editAddress')}
            </Text>

            <View className="space-y-4">
                {/* First Name */}
                <View>
                    <Text className="text-sm font-medium mb-1 font-cairo">{t('firstname')}</Text>
                    <Controller
                        control={control}
                        name="firstname"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-border rounded-md p-3 bg-card font-cairo"
                                value={value}
                                onChangeText={onChange}
                                placeholder={t('firstname')}
                            />
                        )}
                    />
                    {errors.firstname && <Text className="text-red-500 text-xs mt-1 font-cairo">{errors.firstname.message}</Text>}
                </View>

                {/* Last Name */}
                <View>
                    <Text className="text-sm font-medium mb-1 font-cairo">{t('lastname')}</Text>
                    <Controller
                        control={control}
                        name="lastname"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-border rounded-md p-3 bg-card font-cairo"
                                value={value}
                                onChangeText={onChange}
                                placeholder={t('lastname')}
                            />
                        )}
                    />
                    {errors.lastname && <Text className="text-red-500 text-xs mt-1 font-cairo">{errors.lastname.message}</Text>}
                </View>

                {/* Company */}
                <View>
                    <Text className="text-sm font-medium mb-1 font-cairo">{t('company')} ({t('optional')})</Text>
                    <Controller
                        control={control}
                        name="company"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-border rounded-md p-3 bg-card font-cairo"
                                value={value}
                                onChangeText={onChange}
                                placeholder={t('company')}
                            />
                        )}
                    />
                </View>

                {/* Address 1 */}
                <View>
                    <Text className="text-sm font-medium mb-1 font-cairo">{t('address_1')}</Text>
                    <Controller
                        control={control}
                        name="address_1"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-border rounded-md p-3 bg-card font-cairo"
                                value={value}
                                onChangeText={onChange}
                                placeholder={t('address_1')}
                            />
                        )}
                    />
                    {errors.address_1 && <Text className="text-red-500 text-xs mt-1 font-cairo">{errors.address_1.message}</Text>}
                </View>

                {/* Address 2 */}
                <View>
                    <Text className="text-sm font-medium mb-1 font-cairo">{t('address_2')}</Text>
                    <Controller
                        control={control}
                        name="address_2"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-border rounded-md p-3 bg-card font-cairo"
                                value={value}
                                onChangeText={onChange}
                                placeholder={t('address_2')}
                            />
                        )}
                    />
                </View>

                {/* City */}
                <View>
                    <Text className="text-sm font-medium mb-1 font-cairo">{t('city')}</Text>
                    <Controller
                        control={control}
                        name="city"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-border rounded-md p-3 bg-card font-cairo"
                                value={value}
                                onChangeText={onChange}
                                placeholder={t('city')}
                            />
                        )}
                    />
                    {errors.city && <Text className="text-red-500 text-xs mt-1 font-cairo">{errors.city.message}</Text>}
                </View>

                {/* Postcode */}
                <View>
                    <Text className="text-sm font-medium mb-1 font-cairo">{t('postcode')}</Text>
                    <Controller
                        control={control}
                        name="postcode"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="border border-border rounded-md p-3 bg-card font-cairo"
                                value={value}
                                onChangeText={onChange}
                                placeholder={t('postcode')}
                                keyboardType="numeric"
                            />
                        )}
                    />
                </View>

                {/* Default Address Switch */}
                <View className="flex-row items-center justify-between p-4 border border-border rounded-md bg-card">
                    <Text className="text-base font-medium font-cairo">{t('defaultAddress')}</Text>
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

                <Button 
                    onPress={handleSubmit(onSubmit)} 
                    disabled={isLoading}
                    className="mt-6 bg-primary"
                >
                    {isLoading ? <Loader2 color="white" className="animate-spin mr-2" /> : null}
                    <Text className="text-white font-bold font-cairo">{t('saveAddress')}</Text>
                </Button>
            </View>
        </ScrollView>
    );
}
