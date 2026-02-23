import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TextInput, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useResetPasswordMutation } from '@/store/features/auth/authSlice';
import { Eye, EyeOff, Lock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';

export default function ResetPasswordScreen() {
    const { t } = useTranslation('auth');
    const router = useRouter();
    const { token: tokenParam, email: emailParam } = useLocalSearchParams<{ token: string; email: string }>();
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [success, setSuccess] = useState(false);
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');

    const resetPasswordSchema = z.object({
        password: z.string().min(8, t('resetPassword.validation.passwordMin')),
        password_confirmation: z.string().min(1, t('resetPassword.validation.confirmRequired')),
    }).refine((data) => data.password === data.password_confirmation, {
        message: t('resetPassword.validation.passwordsNoMatch'),
        path: ['password_confirmation'],
    });

    type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            password_confirmation: '',
        },
    });

    const password = watch('password', '');

    // Get token and email from URL params
    useEffect(() => {
        if (!tokenParam || !emailParam) {
            setGeneralError(t('resetPassword.invalidLink'));
            return;
        }
        setToken(tokenParam);
        setEmail(emailParam);
    }, [tokenParam, emailParam, t]);

    const onSubmit = useCallback(async (data: ResetPasswordFormValues) => {
        setGeneralError('');

        if (!token || !email) {
            setGeneralError(t('resetPassword.invalidLink'));
            return;
        }

        try {
            await resetPassword({
                token,
                email,
                password: data.password,
                password_confirmation: data.password_confirmation,
            }).unwrap();

            setSuccess(true);

            setTimeout(() => {
                router.replace('/(auth)/login');
            }, 3000);
        } catch (err: any) {
            console.error('Password reset failed:', err);
            setGeneralError(err?.data?.message || t('resetPassword.resetFailed'));
        }
    }, [token, email, resetPassword, router, t]);

    if (success) {
        return (
            <ScrollView
                className="flex-1 bg-background"
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
            >
                <Stack.Screen options={{ title: t('resetPassword.title') }} />

                <View className="bg-card rounded-2xl p-8 border border-border/50 items-center">
                    <View className="w-16 h-16 bg-green-500/10 rounded-full items-center justify-center mb-6">
                        <CheckCircle2 size={32} color="#22c55e" />
                    </View>

                    <Text className="text-2xl font-bold mb-4 text-center">{t('resetPassword.successTitle')}</Text>

                    <Text className="text-muted-foreground mb-6 text-center">{t('resetPassword.successDesc')}</Text>

                    <View className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 mb-6 w-full">
                        <Text className="text-sm text-green-600 text-center">{t('resetPassword.redirecting')}</Text>
                    </View>

                    <Pressable
                        onPress={() => router.replace('/(auth)/login')}
                        className="w-full bg-primary rounded-lg py-3 items-center"
                    >
                        <Text className="text-primary-foreground font-semibold">{t('resetPassword.goToLoginNow')}</Text>
                    </Pressable>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-background"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
            keyboardShouldPersistTaps="handled"
        >
            <Stack.Screen options={{ title: t('resetPassword.title') }} />

            {/* Header */}
            <View className="items-center mb-8">
                <Text className="text-3xl font-bold mb-2 text-foreground">{t('resetPassword.title')}</Text>
                <Text className="text-muted-foreground text-center">{t('resetPassword.subtitle')}</Text>
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

                {/* Email Display */}
                {email ? (
                    <View className="bg-muted border border-border rounded-lg p-3 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            {t('resetPassword.resettingFor')} <Text className="font-semibold text-foreground">{email}</Text>
                        </Text>
                    </View>
                ) : null}

                {/* New Password */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-foreground/80 mb-2">{t('resetPassword.newPasswordLabel')}</Text>
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
                                    placeholder={t('resetPassword.newPasswordPlaceholder')}
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

                {/* Confirm New Password */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-foreground/80 mb-2">{t('resetPassword.confirmPasswordLabel')}</Text>
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
                                    placeholder={t('resetPassword.confirmPasswordPlaceholder')}
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

                {/* Password Strength */}
                {password ? (
                    <View className="mb-4">
                        <View className="flex-row gap-1">
                            <View className={`h-1 flex-1 rounded ${password.length >= 8 ? 'bg-green-500' : 'bg-muted'}`} />
                            <View className={`h-1 flex-1 rounded ${password.match(/[A-Z]/) && password.match(/[a-z]/) ? 'bg-green-500' : 'bg-muted'}`} />
                            <View className={`h-1 flex-1 rounded ${password.match(/[0-9]/) ? 'bg-green-500' : 'bg-muted'}`} />
                            <View className={`h-1 flex-1 rounded ${password.match(/[^A-Za-z0-9]/) ? 'bg-green-500' : 'bg-muted'}`} />
                        </View>
                        <Text className="text-xs text-muted-foreground mt-1">{t('resetPassword.passwordStrength')}</Text>
                    </View>
                ) : null}

                {/* Submit Button */}
                <Pressable
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading || !token || !email}
                    className={`w-full rounded-lg py-3.5 flex-row items-center justify-center gap-2 ${isLoading || !token || !email ? 'bg-muted' : 'bg-primary'}`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={20} color="white" />
                            <Text className="text-primary-foreground font-semibold">{t('resetPassword.resetting')}</Text>
                        </>
                    ) : (
                        <>
                            <Lock size={20} color="white" />
                            <Text className="text-primary-foreground font-semibold">{t('resetPassword.resetBtn')}</Text>
                        </>
                    )}
                </Pressable>

                {/* Login Link */}
                <View className="flex-row justify-center mt-6">
                    <Text className="text-sm text-muted-foreground">{t('resetPassword.rememberPassword')} </Text>
                    <Pressable onPress={() => router.push('/(auth)/login')}>
                        <Text className="text-sm font-semibold text-primary">{t('common.backToLogin')}</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}
