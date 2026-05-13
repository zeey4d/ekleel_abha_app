import React, { useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGetMeQuery, useUpdateProfileMutation, useChangePasswordMutation } from '@/store/features/auth/authSlice';
import { useTranslation } from 'react-i18next';
import { Loader2, ChevronLeft } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { useRouter, Stack } from 'expo-router';

const profileSchema = z.object({
    firstname: z.string().min(2, "First name must be at least 2 characters"),
    lastname: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    telephone: z.string().min(9, "Phone number must be valid"),
});

const passwordSchema = z.object({
    current_password: z.string().min(1, "Current password is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfileFormScreen() {
    const { t } = useTranslation('account');
    const router = useRouter();
    const { data: user } = useGetMeQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

    const { control: profileControl, handleSubmit: handleProfileSubmit, reset: resetProfile, formState: { errors: profileErrors } } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstname: "",
            lastname: "",
            email: "",
            telephone: "",
        },
    });

    const { control: passwordControl, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            current_password: "",
            password: "",
            password_confirmation: "",
        },
    });

    useEffect(() => {
        if (user) {
            resetProfile({
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                telephone: user.telephone,
            });
        }
    }, [user, resetProfile]);

    const onProfileSubmit = async (values: ProfileFormValues) => {
        try {
            await updateProfile(values).unwrap();
            // Toast success
        } catch (error: any) {
            console.error("Profile update failed", error);
            // Handle error toast
        }
    };

    const onPasswordSubmit = async (values: PasswordFormValues) => {
        try {
            await changePassword(values).unwrap();
            resetPassword();
            // Toast success
        } catch (error: any) {
            console.error("Password change failed", error);
            // Handle error toast
        }
    };

    if (!user) return null;

    return (
        <ScrollView className="flex-1 bg-slate-50 p-4" contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}>
             <Stack.Screen 
                options={{ 
                    headerShown: true,
                    title: t('profile'),
                    headerBackTitle: "", 
                    headerTintColor: '#000',
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} >
                            <ChevronLeft color="#000000ff" size={28} />
                        </Pressable>
                    ),
                }} 
            />
            
            {/* Profile Update Section */}
            <View className="mb-6 p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800/80 shadow-sm">
                <Text className="text-xl font-bold mb-2 font-tajawal text-slate-800 dark:text-white">{t('profile')}</Text>
                <Text className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-tajawal">{t('updateProfileInfo')}</Text>

                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-tajawal">{t('firstname')}</Text>
                        <Controller
                            control={profileControl}
                            name="firstname"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-tajawal text-slate-800 dark:text-white"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        {profileErrors.firstname && <Text className="text-red-500 text-xs font-tajawal mt-1">{profileErrors.firstname.message}</Text>}
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-tajawal">{t('lastname')}</Text>
                        <Controller
                            control={profileControl}
                            name="lastname"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-tajawal text-slate-800 dark:text-white"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        {profileErrors.lastname && <Text className="text-red-500 text-xs font-tajawal mt-1">{profileErrors.lastname.message}</Text>}
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-tajawal">{t('email')}</Text>
                        <Controller
                            control={profileControl}
                            name="email"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-tajawal text-slate-800 dark:text-white"
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            )}
                        />
                         {profileErrors.email && <Text className="text-red-500 text-xs font-tajawal mt-1">{profileErrors.email.message}</Text>}
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-tajawal">{t('phone')}</Text>
                        <Controller
                            control={profileControl}
                            name="telephone"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-tajawal text-slate-800 dark:text-white"
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType="phone-pad"
                                />
                            )}
                        />
                         {profileErrors.telephone && <Text className="text-red-500 text-xs font-tajawal mt-1">{profileErrors.telephone.message}</Text>}
                    </View>

                    <Pressable 
                        onPress={handleProfileSubmit(onProfileSubmit)} 
                        disabled={isUpdating} 
                        className="mt-6 bg-teal-600 py-4 rounded-full flex-row justify-center items-center active:bg-teal-700 active:scale-[0.98] transition-all"
                    >
                        {isUpdating && <Loader2 color="white" size={20} className="animate-spin mr-2" />}
                        <Text className="text-white font-bold font-tajawal text-[15px]">{t('saveChanges')}</Text>
                    </Pressable>
                </View>
            </View>

            {/* Password Change Section */}
            <View className="mb-8 p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800/80 shadow-sm">
                <Text className="text-xl font-bold mb-2 font-tajawal text-slate-800 dark:text-white">{t('changePassword')}</Text>
                 <Text className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-tajawal">{t('passwordSecurity')}</Text>

                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-tajawal">{t('currentPassword')}</Text>
                        <Controller
                            control={passwordControl}
                            name="current_password"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-tajawal text-slate-800 dark:text-white"
                                    value={value}
                                    onChangeText={onChange}
                                    secureTextEntry
                                />
                            )}
                        />
                        {passwordErrors.current_password && <Text className="text-red-500 text-xs font-tajawal mt-1">{passwordErrors.current_password.message}</Text>}
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-tajawal">{t('newPassword')}</Text>
                        <Controller
                            control={passwordControl}
                            name="password"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-tajawal text-slate-800 dark:text-white"
                                    value={value}
                                    onChangeText={onChange}
                                    secureTextEntry
                                />
                            )}
                        />
                        {passwordErrors.password && <Text className="text-red-500 text-xs font-tajawal mt-1">{passwordErrors.password.message}</Text>}
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-tajawal">{t('confirmPassword')}</Text>
                        <Controller
                            control={passwordControl}
                            name="password_confirmation"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800 font-tajawal text-slate-800 dark:text-white"
                                    value={value}
                                    onChangeText={onChange}
                                    secureTextEntry
                                />
                            )}
                        />
                        {passwordErrors.password_confirmation && <Text className="text-red-500 text-xs font-tajawal mt-1">{passwordErrors.password_confirmation.message}</Text>}
                    </View>

                    <Pressable 
                        onPress={handlePasswordSubmit(onPasswordSubmit)} 
                        disabled={isChangingPassword} 
                        className="mt-6 bg-slate-800 dark:bg-slate-700 py-4 rounded-full flex-row justify-center items-center active:bg-slate-900 active:scale-[0.98] transition-all"
                    >
                        {isChangingPassword && <Loader2 color="white" size={20} className="animate-spin mr-2" />}
                         <Text className="text-white font-bold font-tajawal text-[15px]">{t('changePassword')}</Text>
                    </Pressable>
                </View>
            </View>

        </ScrollView>
    );
}
