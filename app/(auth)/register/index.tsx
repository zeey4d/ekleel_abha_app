import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useRegisterMutation } from '@/store/features/auth/authSlice';
import { authStorage } from '@/lib/authStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, Loader2, Check, Square
} from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';

export default function RegisterScreen() {
    const { t } = useTranslation('auth');
    const router = useRouter();
    const [registerUser, { isLoading, isSuccess }] = useRegisterMutation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [generalError, setGeneralError] = useState('');

    const registerSchema = z.object({
        firstname: z.string().min(1, t('register.validation.firstNameRequired')),
        lastname: z.string().min(1, t('register.validation.lastNameRequired')),
        email: z.string().email(t('register.validation.emailInvalid')),
        telephone: z.string().min(1, t('register.validation.phoneRequired')),
        password: z.string().min(8, t('register.validation.passwordMin')),
        password_confirmation: z.string().min(1, t('register.validation.confirmPasswordRequired')),
        acceptTerms: z.boolean().refine((val) => val === true, t('register.validation.acceptTerms')),
    }).refine((data) => data.password === data.password_confirmation, {
        message: t('register.validation.passwordsNoMatch'),
        path: ['password_confirmation'],
    });

    type RegisterFormValues = z.infer<typeof registerSchema>;

    const {
        control,
        handleSubmit,
        watch,
        setError,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstname: '',
            lastname: '',
            email: '',
            telephone: '',
            password: '',
            password_confirmation: '',
            acceptTerms: false,
        },
    });

    const password = watch('password', '');
    const emailValue = watch('email', '');

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

    // Redirect to verification page on success
    useEffect(() => {
        if (isSuccess && emailValue) {
            AsyncStorage.setItem('verification_email', emailValue).then(() => {
                router.push('/(auth)/verify-phone');
            });
        }
    }, [isSuccess, emailValue, router]);

    const onSubmit = useCallback(async (data: RegisterFormValues) => {
        setGeneralError('');

        try {
            const { acceptTerms, ...apiData } = data;
            await registerUser(apiData).unwrap();
        } catch (err: any) {
            console.error('Registration failed:', err);
            if (err?.status === 422 && err?.data?.errors) {
                Object.keys(err.data.errors).forEach((key) => {
                    setError(key as keyof RegisterFormValues, {
                        type: 'server',
                        message: err.data.errors[key][0],
                    });
                });
                setGeneralError(t('register.checkFields'));
            } else {
                setGeneralError(err?.data?.message || t('register.registrationFailed'));
            }
        }
    }, [registerUser, setError, t]);

    return (
        <ScrollView
            className="flex-1 bg-background"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
            keyboardShouldPersistTaps="handled"
        >
            <Stack.Screen options={{ title: t('register.title') }} />

            {/* Header */}
            <View className="items-center mb-8">
                <Text className="text-3xl font-bold mb-2 text-foreground">{t('register.title')}</Text>
                <Text className="text-muted-foreground text-center">{t('register.subtitle')}</Text>
            </View>

            {/* Form Card */}
            <View className="bg-card rounded-2xl p-6 border border-border/50">

                {/* Error */}
                {generalError ? (
                    <View className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex-row items-start gap-3 mb-4">
                        <AlertCircle size={20} color="#ef4444" />
                        <Text className="text-sm text-destructive flex-1">{generalError}</Text>
                    </View>
                ) : null}

                {/* Name Fields */}
                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground/80 mb-2">{t('register.firstNameLabel')}</Text>
                        <View className="relative">
                            <View className="absolute left-3 top-3.5 z-10">
                                <User size={20} color="#9ca3af" />
                            </View>
                            <Controller
                                control={control}
                                name="firstname"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className={`w-full pl-11 pr-4 py-3 border ${errors.firstname ? 'border-destructive' : 'border-border'} rounded-lg bg-transparent text-foreground`}
                                        placeholder={t('register.firstNamePlaceholder')}
                                        placeholderTextColor="#9ca3af"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />
                        </View>
                        {errors.firstname && (
                            <Text className="text-xs text-destructive mt-1">{errors.firstname.message}</Text>
                        )}
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground/80 mb-2">{t('register.lastNameLabel')}</Text>
                        <View className="relative">
                            <View className="absolute left-3 top-3.5 z-10">
                                <User size={20} color="#9ca3af" />
                            </View>
                            <Controller
                                control={control}
                                name="lastname"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className={`w-full pl-11 pr-4 py-3 border ${errors.lastname ? 'border-destructive' : 'border-border'} rounded-lg bg-transparent text-foreground`}
                                        placeholder={t('register.lastNamePlaceholder')}
                                        placeholderTextColor="#9ca3af"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />
                        </View>
                        {errors.lastname && (
                            <Text className="text-xs text-destructive mt-1">{errors.lastname.message}</Text>
                        )}
                    </View>
                </View>

                {/* Email */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-foreground/80 mb-2">{t('register.emailLabel')}</Text>
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
                                    placeholder={t('register.emailPlaceholder')}
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

                {/* Phone */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-foreground/80 mb-2">{t('register.phoneLabel')}</Text>
                    <View className="relative">
                        <View className="absolute left-3 top-3.5 z-10">
                            <Phone size={20} color="#9ca3af" />
                        </View>
                        <Controller
                            control={control}
                            name="telephone"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className={`w-full pl-11 pr-4 py-3 border ${errors.telephone ? 'border-destructive' : 'border-border'} rounded-lg bg-transparent text-foreground`}
                                    placeholder={t('register.phonePlaceholder')}
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="phone-pad"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                    </View>
                    {errors.telephone && (
                        <Text className="text-xs text-destructive mt-1">{errors.telephone.message}</Text>
                    )}
                </View>

                {/* Password Fields */}
                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground/80 mb-2">{t('register.passwordLabel')}</Text>
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
                                        placeholder={t('register.passwordPlaceholder')}
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
                                {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                            </Pressable>
                        </View>
                        {errors.password && (
                            <Text className="text-xs text-destructive mt-1">{errors.password.message}</Text>
                        )}
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground/80 mb-2">{t('register.confirmPasswordLabel')}</Text>
                        <View className="relative">
                            <View className="absolute left-3 top-3.5 z-10">
                                <Lock size={20} color="#9ca3af" />
                            </View>
                            <Controller
                                control={control}
                                name="password_confirmation"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className={`w-full pl-11 pr-12 py-3 border ${errors.password_confirmation ? 'border-destructive' : 'border-border'} rounded-lg bg-transparent text-foreground`}
                                        placeholder={t('register.passwordPlaceholder')}
                                        placeholderTextColor="#9ca3af"
                                        secureTextEntry={!showConfirmPassword}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />
                            <Pressable
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3.5"
                            >
                                {showConfirmPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                            </Pressable>
                        </View>
                        {errors.password_confirmation && (
                            <Text className="text-xs text-destructive mt-1">{errors.password_confirmation.message}</Text>
                        )}
                    </View>
                </View>

                {/* Password Strength Indicator */}
                {password ? (
                    <View className="mb-4">
                        <View className="flex-row gap-1">
                            <View className={`h-1 flex-1 rounded ${password.length >= 8 ? 'bg-green-500' : 'bg-muted'}`} />
                            <View className={`h-1 flex-1 rounded ${password.match(/[A-Z]/) && password.match(/[a-z]/) ? 'bg-green-500' : 'bg-muted'}`} />
                            <View className={`h-1 flex-1 rounded ${password.match(/[0-9]/) ? 'bg-green-500' : 'bg-muted'}`} />
                            <View className={`h-1 flex-1 rounded ${password.match(/[^A-Za-z0-9]/) ? 'bg-green-500' : 'bg-muted'}`} />
                        </View>
                        <Text className="text-xs text-muted-foreground mt-1">{t('register.passwordStrength')}</Text>
                    </View>
                ) : null}

                {/* Terms Checkbox */}
                <Controller
                    control={control}
                    name="acceptTerms"
                    render={({ field: { onChange, value } }) => (
                        <Pressable
                            onPress={() => onChange(!value)}
                            className="flex-row items-start gap-3 mb-4"
                        >
                            <View className={`w-5 h-5 mt-0.5 rounded border items-center justify-center ${value ? 'bg-primary border-primary' : 'border-border'}`}>
                                {value && <Check size={14} color="white" />}
                            </View>
                            <View className="flex-1 flex-row flex-wrap">
                                <Text className="text-sm text-muted-foreground">{t('register.termsAgree')} </Text>
                                <Pressable onPress={() => router.push('/(info)/terms-of-service')}>
                                    <Text className="text-sm font-medium text-primary">{t('register.termsOfService')}</Text>
                                </Pressable>
                                <Text className="text-sm text-muted-foreground"> {t('register.and')} </Text>
                                <Pressable onPress={() => router.push('/(info)/privacy-policy')}>
                                    <Text className="text-sm font-medium text-primary">{t('register.privacyPolicy')}</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    )}
                />
                {errors.acceptTerms && (
                    <Text className="text-xs text-destructive mb-4 ml-8">{errors.acceptTerms.message}</Text>
                )}

                {/* Register Button */}
                <Pressable
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className={`w-full rounded-lg py-3.5 flex-row items-center justify-center gap-2 ${isLoading ? 'bg-muted' : 'bg-primary'}`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={20} color="white" />
                            <Text className="text-primary-foreground font-semibold">{t('register.creatingAccount')}</Text>
                        </>
                    ) : (
                        <>
                            <User size={20} color="white" />
                            <Text className="text-primary-foreground font-semibold">{t('register.createAccountBtn')}</Text>
                        </>
                    )}
                </Pressable>

                {/* Login Link */}
                <View className="flex-row justify-center mt-6">
                    <Text className="text-sm text-muted-foreground">{t('register.alreadyHaveAccount')} </Text>
                    <Pressable onPress={() => router.push('/(auth)/login')}>
                        <Text className="text-sm font-semibold text-primary">{t('register.signInInstead')}</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}
