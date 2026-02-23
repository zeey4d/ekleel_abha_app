import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { useRouter, Link, Stack } from 'expo-router';
import { useLoginMutation } from '@/store/features/auth/authSlice';
import { useMergeGuestCartMutation } from '@/store/features/cart/cartSlice';
import { authStorage } from '@/lib/authStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle
} from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import Toast from 'react-native-toast-message';

type LoginData = {
    email: string;
    password: string;
};

export default function LoginScreen() {
    const { t } = useTranslation('auth');
    const router = useRouter();

    const [login, { isLoading }] = useLoginMutation();
    const [mergeGuestCart] = useMergeGuestCartMutation();

    const [showPassword, setShowPassword] = useState(false);
    const [generalError, setGeneralError] = useState('');

    const loginSchema = z.object({
        email: z.string().email(t('login.validation.emailInvalid')),
        password: z.string().min(1, t('login.validation.passwordRequired')),
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // Redirect if already authenticated
    useEffect(() => {
        const checkAuth = async () => {
            const isAuth = await authStorage.isAuthenticated();
            if (isAuth) {
                router.replace('/(tabs)');
            }
        };
        checkAuth();
    }, [router]);

    const onSubmit = useCallback(async (data: LoginData) => {
        setGeneralError('');
        const guestSessionId = await AsyncStorage.getItem('guest_session_id');

        try {
            const payload = {
                ...data,
                guest_session_id: guestSessionId || undefined,
            };

            await login(payload).unwrap();

            // Replaced Alert with Toast
            Toast.show({
                type: 'success',
                text1: t('login.title'),
                text2: t('login.loginSuccess'),
            });

            if (guestSessionId) {
                await AsyncStorage.removeItem('guest_session_id');
            }

            router.replace('/(tabs)');
        } catch (err: any) {
            console.error('Login error:', err);
            const errorMessage = err?.data?.message || t('login.invalidCredentials');
            setGeneralError(errorMessage);
            
            Toast.show({
                type: 'error',
                text1: t('login.error'),
                text2: errorMessage,
            });

            if (err?.status === 422 && err?.data?.errors) {
                console.log('Validation errors:', err.data.errors);
            }
        }
    }, [login, router, t]);

    return (
        <ScrollView
            className="flex-1 bg-background"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
            keyboardShouldPersistTaps="handled"
        >
            <Stack.Screen options={{ title: t('login.title') }} />

            {/* Header */}
            <View className="items-center mb-8">
                <Text className="text-3xl font-bold mb-2 text-foreground">{t('login.title')}</Text>
                <Text className="text-muted-foreground text-center">{t('login.subtitle')}</Text>
            </View>

            {/* Form Card */}
            <View className="bg-card rounded-2xl p-6 border border-border/50">

                {/* Error Alert */}
                {generalError ? (
                    <View className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex-row items-start gap-3 mb-4">
                        <AlertCircle size={20} color="#ef4444" />
                        <Text className="text-sm text-destructive flex-1">{generalError}</Text>
                    </View>
                ) : null}

                {/* Email */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-foreground/80 mb-2">{t('login.emailLabel')}</Text>
                    <View className="relative">
                        <View className="absolute left-3 top-3.5 z-10">
                            <Mail size={20} color="#9ca3af" />
                        </View>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className={`w-full pl-11 pr-4 py-3 border ${errors.email ? 'border-destructive' : 'border-border'} rounded-lg bg-transparent text-foreground`}
                                    placeholder={t('login.emailPlaceholder')}
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                    </View>
                    {errors.email && (
                        <Text className="text-xs text-destructive mt-1">{errors.email.message}</Text>
                    )}
                </View>

                {/* Password */}
                <View className="mb-4">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm font-medium text-foreground/80">{t('login.passwordLabel')}</Text>
                        <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
                            <Text className="text-sm font-medium text-primary">{t('login.forgotPassword')}</Text>
                        </Pressable>
                    </View>
                    <View className="relative">
                        <View className="absolute left-3 top-3.5 z-10">
                            <Lock size={20} color="#9ca3af" />
                        </View>
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className={`w-full pl-11 pr-12 py-3 border ${errors.password ? 'border-destructive' : 'border-border'} rounded-lg bg-transparent text-foreground`}
                                    placeholder={t('login.passwordPlaceholder')}
                                    placeholderTextColor="#9ca3af"
                                    secureTextEntry={!showPassword}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                        <Pressable
                            onPress={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5"
                        >
                            {showPassword
                                ? <EyeOff size={20} color="#9ca3af" />
                                : <Eye size={20} color="#9ca3af" />
                            }
                        </Pressable>
                    </View>
                    {errors.password && (
                        <Text className="text-xs text-destructive mt-1">{errors.password.message}</Text>
                    )}
                </View>

                {/* Submit Button */}
                <Pressable
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className={`w-full rounded-lg py-3.5 flex-row items-center justify-center gap-2 ${isLoading ? 'bg-muted' : 'bg-primary'}`}
                >
                    {isLoading ? <Loader2 size={18} color="white" /> : null}
                    <Text className="text-primary-foreground font-semibold text-base">{t('login.signInBtn')}</Text>
                    {!isLoading ? <ArrowRight size={18} color="white" /> : null}
                </Pressable>

                {/* Divider */}
                <View className="my-6 flex-row items-center">
                    <View className="flex-1 h-px bg-border" />
                    <Text className="mx-3 text-xs text-muted-foreground uppercase">{t('login.orContinueWith')}</Text>
                    <View className="flex-1 h-px bg-border" />
                </View>

                {/* Register Link */}
                <View className="flex-row justify-center">
                    <Text className="text-sm text-muted-foreground">{t('login.noAccount')} </Text>
                    <Pressable onPress={() => router.push('/(auth)/register')}>
                        <Text className="text-sm font-semibold text-primary">{t('login.signUp')}</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}
