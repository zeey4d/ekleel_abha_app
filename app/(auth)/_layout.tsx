import { Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AuthLayout() {
    const { t } = useTranslation('auth');

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerBackTitle: '',
                headerTintColor: '#000',
                headerStyle: { backgroundColor: '#fff' },
                headerTitleStyle: { fontWeight: '600' },
            }}
        >
            <Stack.Screen name="login/index" options={{ title: t('login.title') }} />
            <Stack.Screen name="register/index" options={{ title: t('register.title') }} />
            <Stack.Screen name="forgot-password/index" options={{ title: t('forgotPassword.title') }} />
            <Stack.Screen name="reset-password/index" options={{ title: t('resetPassword.title') }} />
            <Stack.Screen name="verify-phone/index" options={{ title: t('verifyPhone.title') }} />
            <Stack.Screen name="create-address/index" options={{ title: t('createAddress.title') }} />
        </Stack>
    );
}
