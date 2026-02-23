import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, TextInput, Pressable, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useVerifyRegistrationMutation, useResendRegistrationOtpMutation } from '@/store/features/auth/authSlice';
import { authStorage } from '@/lib/authStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlertCircle, Loader2, CheckCircle2, RefreshCw } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';

export default function VerifyPhoneScreen() {
    const { t } = useTranslation('auth');
    const router = useRouter();
    const [verifyRegistration, { isLoading: isVerifying }] = useVerifyRegistrationMutation();
    const [resendOtp, { isLoading: isResending }] = useResendRegistrationOtpMutation();

    const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
    const [generalError, setGeneralError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [email, setEmail] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const verifySchema = z.object({
        code: z.string().length(6, t('verifyPhone.validation.codeLength')),
    });

    type VerifyFormValues = z.infer<typeof verifySchema>;

    const {
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<VerifyFormValues>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            code: '',
        },
    });

    // Get email from AsyncStorage
    useEffect(() => {
        const getEmail = async () => {
            const storedEmail = await AsyncStorage.getItem('verification_email');
            if (!storedEmail) {
                router.replace('/(auth)/register');
            } else {
                setEmail(storedEmail);
            }
        };
        getEmail();
    }, [router]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCodeChange = useCallback((index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...codeDigits];
        newCode[index] = value.slice(-1);
        setCodeDigits(newCode);
        setValue('code', newCode.join(''));
        setGeneralError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    }, [codeDigits, setValue]);

    const handleKeyPress = useCallback((index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
        if (e.nativeEvent.key === 'Backspace' && !codeDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }, [codeDigits]);

    const onSubmit = useCallback(async (data: VerifyFormValues) => {
        setGeneralError('');
        setSuccessMsg('');

        try {
            const guestSessionId = await AsyncStorage.getItem('guest_session_id');

            const result = await verifyRegistration({
                email,
                code: data.code,
                device_name: 'Mobile App',
                guest_session_id: guestSessionId || undefined,
            }).unwrap();

            // Store token
            await authStorage.setToken(result.access_token);

            // Clear guest session if merged
            if (guestSessionId) {
                await AsyncStorage.removeItem('guest_session_id');
            }

            setSuccessMsg(t('verifyPhone.successMessage'));

            // Clean up
            await AsyncStorage.removeItem('verification_email');

            // Redirect to create address
            setTimeout(() => {
                router.replace('/(auth)/create-address');
            }, 1500);
        } catch (err: any) {
            console.error('Verification failed:', err);
            setGeneralError(err?.data?.message || t('verifyPhone.invalidCode'));
            setCodeDigits(['', '', '', '', '', '']);
            setValue('code', '');
            inputRefs.current[0]?.focus();
        }
    }, [email, verifyRegistration, router, t, setValue]);

    const handleResend = useCallback(async () => {
        setGeneralError('');
        setSuccessMsg('');

        try {
            await resendOtp({ email }).unwrap();
            setSuccessMsg(t('verifyPhone.newCodeSent'));
            setTimeLeft(300);
            setCodeDigits(['', '', '', '', '', '']);
            setValue('code', '');
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            setGeneralError(err?.data?.message || t('verifyPhone.resendFailed'));
        }
    }, [email, resendOtp, t, setValue]);

    return (
        <ScrollView
            className="flex-1 bg-background"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
            keyboardShouldPersistTaps="handled"
        >
            <Stack.Screen options={{ title: t('verifyPhone.title') }} />

            {/* Header */}
            <View className="items-center mb-8">
                <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
                    <CheckCircle2 size={32} color="#8b5cf6" />
                </View>
                <Text className="text-3xl font-bold mb-2 text-foreground">{t('verifyPhone.title')}</Text>
                <Text className="text-muted-foreground text-center">
                    {t('verifyPhone.sentCodeTo')}
                </Text>
                <Text className="font-semibold text-foreground">{email}</Text>
            </View>

            {/* Form Card */}
            <View className="bg-card rounded-2xl p-6 border border-border/50">

                {/* Error */}
                {(generalError || errors.code) ? (
                    <View className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex-row items-start gap-3 mb-4">
                        <AlertCircle size={20} color="#ef4444" />
                        <Text className="text-sm text-destructive flex-1">{generalError || errors.code?.message}</Text>
                    </View>
                ) : null}

                {/* Success */}
                {successMsg ? (
                    <View className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex-row items-start gap-3 mb-4">
                        <CheckCircle2 size={20} color="#22c55e" />
                        <Text className="text-sm text-green-600 flex-1">{successMsg}</Text>
                    </View>
                ) : null}

                {/* OTP Input */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-foreground/80 mb-3 text-center">{t('verifyPhone.enterCode')}</Text>
                    <View className="flex-row gap-2 justify-center">
                        {codeDigits.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                className="w-12 h-14 text-center text-2xl font-bold border-2 border-border rounded-lg bg-transparent text-foreground"
                                keyboardType="number-pad"
                                maxLength={1}
                                value={digit}
                                onChangeText={(value) => handleCodeChange(index, value)}
                                onKeyPress={(e) => handleKeyPress(index, e)}
                                editable={!isVerifying}
                                selectTextOnFocus
                            />
                        ))}
                    </View>
                </View>

                {/* Timer */}
                <View className="items-center mb-4">
                    <Text className="text-sm text-muted-foreground">
                        {timeLeft > 0 ? (
                            <>
                                {t('verifyPhone.codeExpiresIn')}{' '}
                                <Text className="font-semibold text-foreground">{formatTime(timeLeft)}</Text>
                            </>
                        ) : (
                            <Text className="text-destructive font-semibold">{t('verifyPhone.codeExpired')}</Text>
                        )}
                    </Text>
                </View>

                {/* Verify Button */}
                <Pressable
                    onPress={handleSubmit(onSubmit)}
                    disabled={isVerifying || codeDigits.some(d => !d)}
                    className={`w-full rounded-lg py-3.5 flex-row items-center justify-center gap-2 mb-4 ${isVerifying || codeDigits.some(d => !d) ? 'bg-muted' : 'bg-primary'}`}
                >
                    {isVerifying ? (
                        <>
                            <Loader2 size={20} color="white" />
                            <Text className="text-primary-foreground font-semibold">{t('verifyPhone.verifying')}</Text>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={20} color="white" />
                            <Text className="text-primary-foreground font-semibold">{t('verifyPhone.verifyBtn')}</Text>
                        </>
                    )}
                </Pressable>

                {/* Resend */}
                <View className="items-center">
                    <Pressable
                        onPress={handleResend}
                        disabled={isResending || timeLeft > 240}
                        className="flex-row items-center gap-2"
                    >
                        <RefreshCw size={16} color={isResending || timeLeft > 240 ? '#9ca3af' : '#8b5cf6'} />
                        <Text className={`text-sm font-medium underline ${isResending || timeLeft > 240 ? 'text-muted-foreground' : 'text-primary'}`}>
                            {isResending ? t('verifyPhone.sendingCode') : t('verifyPhone.resendCode')}
                        </Text>
                    </Pressable>
                    {timeLeft > 240 && (
                        <Text className="text-xs text-muted-foreground mt-2">
                            {t('verifyPhone.availableIn')} {formatTime(timeLeft - 240)}
                        </Text>
                    )}
                </View>

                {/* Alternative Action */}
                <View className="mt-6 pt-6 border-t border-border">
                    <View className="flex-row justify-center">
                        <Text className="text-sm text-muted-foreground">{t('verifyPhone.wrongEmail')} </Text>
                        <Pressable onPress={() => router.push('/(auth)/register')}>
                            <Text className="text-sm font-semibold text-primary">{t('verifyPhone.goBackEdit')}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Help Text */}
            <Text className="text-center text-xs text-muted-foreground mt-8">{t('verifyPhone.checkSpam')}</Text>
        </ScrollView>
    );
}
