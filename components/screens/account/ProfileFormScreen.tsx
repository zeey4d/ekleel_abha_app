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
        <ScrollView className="flex-1 bg-background p-4" contentContainerStyle={{ paddingBottom: 40 }}>
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
            <View className="mb-8 p-4 bg-card rounded-xl border border-border">
                <Text className="text-xl font-bold mb-2 font-cairo">{t('profile')}</Text>
                <Text className="text-sm text-muted-foreground mb-4 font-cairo">{t('updateProfileInfo')}</Text>

                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-medium mb-1 font-cairo">{t('firstname')}</Text>
                        <Controller
                            control={profileControl}
                            name="firstname"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="border border-border rounded-md p-3 bg-background font-cairo"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        {profileErrors.firstname && <Text className="text-red-500 text-xs font-cairo">{profileErrors.firstname.message}</Text>}
                    </View>

                    <View>
                        <Text className="text-sm font-medium mb-1 font-cairo">{t('lastname')}</Text>
                        <Controller
                            control={profileControl}
                            name="lastname"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="border border-border rounded-md p-3 bg-background font-cairo"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        {profileErrors.lastname && <Text className="text-red-500 text-xs font-cairo">{profileErrors.lastname.message}</Text>}
                    </View>

                    <View>
                        <Text className="text-sm font-medium mb-1 font-cairo">{t('email')}</Text>
                        <Controller
                            control={profileControl}
                            name="email"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="border border-border rounded-md p-3 bg-background font-cairo"
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            )}
                        />
                         {profileErrors.email && <Text className="text-red-500 text-xs font-cairo">{profileErrors.email.message}</Text>}
                    </View>

                    <View>
                        <Text className="text-sm font-medium mb-1 font-cairo">{t('phone')}</Text>
                        <Controller
                            control={profileControl}
                            name="telephone"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="border border-border rounded-md p-3 bg-background font-cairo"
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType="phone-pad"
                                />
                            )}
                        />
                         {profileErrors.telephone && <Text className="text-red-500 text-xs font-cairo">{profileErrors.telephone.message}</Text>}
                    </View>

                    <Button onPress={handleProfileSubmit(onProfileSubmit)} disabled={isUpdating} className="mt-2 bg-primary">
                        {isUpdating && <Loader2 color="white" className="animate-spin mr-2" />}
                        <Text className="text-white font-bold font-cairo">{t('saveChanges')}</Text>
                    </Button>
                </View>
            </View>

            {/* Password Change Section */}
            <View className="mb-8 p-4 bg-card rounded-xl border border-border">
                <Text className="text-xl font-bold mb-2 font-cairo">{t('changePassword')}</Text>
                 <Text className="text-sm text-muted-foreground mb-4 font-cairo">{t('passwordSecurity')}</Text>

                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-medium mb-1 font-cairo">{t('currentPassword')}</Text>
                        <Controller
                            control={passwordControl}
                            name="current_password"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="border border-border rounded-md p-3 bg-background font-cairo"
                                    value={value}
                                    onChangeText={onChange}
                                    secureTextEntry
                                />
                            )}
                        />
                        {passwordErrors.current_password && <Text className="text-red-500 text-xs font-cairo">{passwordErrors.current_password.message}</Text>}
                    </View>

                    <View>
                        <Text className="text-sm font-medium mb-1 font-cairo">{t('newPassword')}</Text>
                        <Controller
                            control={passwordControl}
                            name="password"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="border border-border rounded-md p-3 bg-background font-cairo"
                                    value={value}
                                    onChangeText={onChange}
                                    secureTextEntry
                                />
                            )}
                        />
                        {passwordErrors.password && <Text className="text-red-500 text-xs font-cairo">{passwordErrors.password.message}</Text>}
                    </View>

                    <View>
                        <Text className="text-sm font-medium mb-1 font-cairo">{t('confirmPassword')}</Text>
                        <Controller
                            control={passwordControl}
                            name="password_confirmation"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className="border border-border rounded-md p-3 bg-background font-cairo"
                                    value={value}
                                    onChangeText={onChange}
                                    secureTextEntry
                                />
                            )}
                        />
                        {passwordErrors.password_confirmation && <Text className="text-red-500 text-xs font-cairo">{passwordErrors.password_confirmation.message}</Text>}
                    </View>

                    <Button onPress={handlePasswordSubmit(onPasswordSubmit)} disabled={isChangingPassword} className="mt-2 bg-primary">
                        {isChangingPassword && <Loader2 color="white" className="animate-spin mr-2" />}
                         <Text className="text-white font-bold font-cairo">{t('changePassword')}</Text>
                    </Button>
                </View>
            </View>

        </ScrollView>
    );
}
