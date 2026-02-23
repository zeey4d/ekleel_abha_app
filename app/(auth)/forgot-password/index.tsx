import React, { useState, useCallback } from 'react';
import { View, ScrollView, TextInput, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useForgotPasswordMutation } from '@/store/features/auth/authSlice';
import { Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';

export default function ForgotPasswordScreen() {
    const { t } = useTranslation('auth');
    const router = useRouter();
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

    const [generalError, setGeneralError] = useState('');
    const [success, setSuccess] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');

    const forgotPasswordSchema = z.object({
        email: z.string().email(t('forgotPassword.validation.emailInvalid')),
    });

    type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = useCallback(async (data: ForgotPasswordFormValues) => {
        setGeneralError('');

        try {
            await forgotPassword(data).unwrap();
            setSubmittedEmail(data.email);
            setSuccess(true);
        } catch (err: any) {
            console.error('Forgot password failed:', err);
            setGeneralError(err?.data?.message || t('forgotPassword.sendFailed'));
        }
    }, [forgotPassword, t]);

    if (success) {
        return (
            <ScrollView
                className="flex-1 bg-background"
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
            >
                <Stack.Screen options={{ title: t('forgotPassword.title') }} />

                <View className="bg-card rounded-2xl p-8 border border-border/50 items-center">
                    <View className="w-16 h-16 bg-green-500/10 rounded-full items-center justify-center mb-6">
                        <CheckCircle2 size={32} color="#22c55e" />
                    </View>

                    <Text className="text-2xl font-bold mb-4 text-center">{t('forgotPassword.successTitle')}</Text>

                    <Text className="text-muted-foreground mb-2 text-center">{t('forgotPassword.successDesc')}</Text>
                    <Text className="font-semibold text-foreground mb-6">{submittedEmail}</Text>

                    <View className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 w-full">
                        <Text className="text-sm text-primary text-center">{t('forgotPassword.linkExpiry')}</Text>
                    </View>

                    <Pressable
                        onPress={() => setSuccess(false)}
                        className="w-full bg-primary rounded-lg py-3 items-center mb-3"
                    >
                        <Text className="text-primary-foreground font-semibold">{t('forgotPassword.resendEmail')}</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => router.push('/(auth)/login')}
                        className="w-full py-3 items-center"
                    >
                        <Text className="text-muted-foreground font-medium">{t('common.backToLogin')}</Text>
                    </Pressable>

                    <Text className="text-xs text-muted-foreground mt-6 text-center">{t('forgotPassword.checkSpam')}</Text>
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
            <Stack.Screen options={{ title: t('forgotPassword.title') }} />

            {/* Header */}
            <View className="items-center mb-8">
                <Text className="text-3xl font-bold mb-2 text-foreground">{t('forgotPassword.title')}</Text>
                <Text className="text-muted-foreground text-center">{t('forgotPassword.subtitle')}</Text>
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

                {/* Email */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-foreground/80 mb-2">{t('forgotPassword.emailLabel')}</Text>
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
                                    placeholder={t('forgotPassword.emailPlaceholder')}
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

                {/* Submit Button */}
                <Pressable
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className={`w-full rounded-lg py-3.5 flex-row items-center justify-center gap-2 mb-4 ${isLoading ? 'bg-muted' : 'bg-primary'}`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={20} color="white" />
                            <Text className="text-primary-foreground font-semibold">{t('forgotPassword.sending')}</Text>
                        </>
                    ) : (
                        <>
                            <Mail size={20} color="white" />
                            <Text className="text-primary-foreground font-semibold">{t('forgotPassword.sendResetLink')}</Text>
                        </>
                    )}
                </Pressable>

                {/* Back to Login */}
                <Pressable
                    onPress={() => router.push('/(auth)/login')}
                    className="flex-row items-center justify-center gap-2"
                >
                    <ArrowLeft size={16} color="#9ca3af" />
                    <Text className="text-sm font-medium text-muted-foreground">{t('common.backToLogin')}</Text>
                </Pressable>
            </View>

            {/* Help Text */}
            <Text className="text-center text-xs text-muted-foreground mt-8">{t('forgotPassword.needHelp')}</Text>
        </ScrollView>
    );
}
