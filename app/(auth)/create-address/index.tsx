import React, { useState, useCallback } from 'react';
import { View, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAddAddressMutation } from '@/store/features/addresses/addressesSlice';
import { useGetMeQuery } from '@/store/features/auth/authSlice';
import { MapPin, Loader2, ArrowRight, Home, Building2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';

export default function CreateAddressScreen() {
    const { t } = useTranslation('auth');
    const router = useRouter();
    const [addAddress, { isLoading }] = useAddAddressMutation();
    const { data: user } = useGetMeQuery();

    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [city, setCity] = useState('');
    const [postcode, setPostcode] = useState('');

    const handleConfirmLocation = useCallback(async () => {
        if (!address1.trim()) {
            Alert.alert(t('createAddress.selectLocationFirst'));
            return;
        }

        if (!user) {
            Alert.alert('Error', 'User information not available. Please try again.');
            return;
        }

        const addressPayload = {
            firstname: user.firstname,
            lastname: user.lastname,
            address_1: address1.trim(),
            address_2: address2.trim(),
            city: city.trim() || 'Riyadh',
            postcode: postcode.trim() || '00000',
            country_id: 222,
            zone_id: 3513,
            company: '',
            default: true,
        };

        console.log('Submitting address payload:', addressPayload);

        try {
            const result = await addAddress(addressPayload).unwrap();
            console.log('Address creation success:', result);
            Alert.alert(t('createAddress.success'));
            router.replace('/(tabs)');
        } catch (error: any) {
            console.error('Failed to add address:', error);

            if (error?.data?.message) {
                Alert.alert('Error', error.data.message);
            } else if (error?.status === 422) {
                Alert.alert('Error', t('createAddress.validation.addressRequired'));
            } else {
                Alert.alert('Error', t('createAddress.error'));
            }
        }
    }, [address1, address2, city, postcode, user, addAddress, router, t]);

    return (
        <ScrollView
            className="flex-1 bg-background"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
            keyboardShouldPersistTaps="handled"
        >
            <Stack.Screen options={{ title: t('createAddress.title') }} />

            {/* Header */}
            <View className="items-center mb-8">
                <Text className="text-3xl font-bold mb-2 text-foreground">{t('createAddress.title')}</Text>
                <Text className="text-muted-foreground text-center">{t('createAddress.subtitle')}</Text>
            </View>

            {/* Form Card */}
            <View className="bg-card rounded-2xl p-6 border border-border/50">

                {/* Instruction */}
                <View className="bg-primary/5 border border-primary/10 rounded-lg p-4 flex-row items-start gap-2 mb-6">
                    <MapPin size={20} color="#8b5cf6" />
                    <Text className="text-sm text-primary flex-1">{t('createAddress.mapInstruction')}</Text>
                </View>

                {/* Address Line 1 */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-foreground/80 mb-2">{t('createAddress.address1Label') || 'العنوان الرئيسي'}</Text>
                    <View className="relative">
                        <View className="absolute left-3 top-3.5 z-10">
                            <Home size={20} color="#9ca3af" />
                        </View>
                        <TextInput
                            className="w-full pl-11 pr-4 py-3 border border-border rounded-lg bg-transparent text-foreground"
                            placeholder={t('createAddress.address1Placeholder') || 'مثال: شارع الملك فهد، حي النزهة'}
                            placeholderTextColor="#9ca3af"
                            value={address1}
                            onChangeText={setAddress1}
                        />
                    </View>
                </View>

                {/* Address Line 2 */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-foreground/80 mb-2">{t('createAddress.address2Label') || 'تفاصيل إضافية'}</Text>
                    <View className="relative">
                        <View className="absolute left-3 top-3.5 z-10">
                            <Building2 size={20} color="#9ca3af" />
                        </View>
                        <TextInput
                            className="w-full pl-11 pr-4 py-3 border border-border rounded-lg bg-transparent text-foreground"
                            placeholder={t('createAddress.address2Placeholder') || 'رقم المبنى، الطابق، الشقة (اختياري)'}
                            placeholderTextColor="#9ca3af"
                            value={address2}
                            onChangeText={setAddress2}
                        />
                    </View>
                </View>

                {/* City & Postcode Row */}
                <View className="flex-row gap-3 mb-6">
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground/80 mb-2">{t('createAddress.cityLabel') || 'المدينة'}</Text>
                        <TextInput
                            className="w-full px-4 py-3 border border-border rounded-lg bg-transparent text-foreground"
                            placeholder={t('createAddress.cityPlaceholder') || 'مثال: أبها'}
                            placeholderTextColor="#9ca3af"
                            value={city}
                            onChangeText={setCity}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground/80 mb-2">{t('createAddress.postcodeLabel') || 'الرمز البريدي'}</Text>
                        <TextInput
                            className="w-full px-4 py-3 border border-border rounded-lg bg-transparent text-foreground"
                            placeholder={t('createAddress.postcodePlaceholder') || '00000'}
                            placeholderTextColor="#9ca3af"
                            keyboardType="number-pad"
                            value={postcode}
                            onChangeText={setPostcode}
                        />
                    </View>
                </View>

                {/* Submit Button */}
                <Pressable
                    onPress={handleConfirmLocation}
                    disabled={isLoading}
                    className={`w-full rounded-lg py-3.5 flex-row items-center justify-center gap-2 ${isLoading ? 'bg-muted' : 'bg-primary'}`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} color="white" />
                            <Text className="text-primary-foreground font-semibold">{t('createAddress.saving')}</Text>
                        </>
                    ) : (
                        <>
                            <Text className="text-primary-foreground font-semibold">{t('createAddress.confirmLocation')}</Text>
                            <ArrowRight size={18} color="white" />
                        </>
                    )}
                </Pressable>
            </View>
        </ScrollView>
    );
}
