import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegisterMutation } from '@/store/features/auth/authSlice';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, Phone } from 'lucide-react-native';

export default function RegisterScreen() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const [register, { isLoading, error }] = useRegisterMutation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      return;
    }
    
    try {
      await register({ 
        name, 
        email, 
        phone,
        password,
        password_confirmation: confirmPassword 
      }).unwrap();
      // Redirect to verification or profile
      router.replace('/(tabs)/(auth)/profile' as any);
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <Animated.View className="flex-1" entering={FadeIn.duration(600)}>
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className="flex-1 bg-background"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center border-b border-border px-4 py-3">
          <Pressable onPress={() => router.back()} className="-ml-2 mr-3 p-2">
            <ArrowLeft size={24} color="#020617" />
          </Pressable>
          <Text className="text-xl font-bold text-foreground">إنشاء حساب جديد</Text>
        </View>

        <View className="flex-1 px-6 py-8">
          {/* Form */}
          <View className="gap-4">
            {/* Name Input */}
            <View className="gap-2">
              <Text className="text-foreground font-medium">الاسم الكامل</Text>
              <View className="flex-row items-center border border-border rounded-xl px-4 bg-card">
                <User size={20} color="#9ca3af" />
                <Input
                  className="flex-1 border-0 bg-transparent"
                  placeholder="أدخل اسمك الكامل"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Email Input */}
            <View className="gap-2">
              <Text className="text-foreground font-medium">البريد الإلكتروني</Text>
              <View className="flex-row items-center border border-border rounded-xl px-4 bg-card">
                <Mail size={20} color="#9ca3af" />
                <Input
                  className="flex-1 border-0 bg-transparent"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Phone Input */}
            <View className="gap-2">
              <Text className="text-foreground font-medium">رقم الهاتف</Text>
              <View className="flex-row items-center border border-border rounded-xl px-4 bg-card">
                <Phone size={20} color="#9ca3af" />
                <Input
                  className="flex-1 border-0 bg-transparent"
                  placeholder="05xxxxxxxx"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="gap-2">
              <Text className="text-foreground font-medium">كلمة المرور</Text>
              <View className="flex-row items-center border border-border rounded-xl px-4 bg-card">
                <Lock size={20} color="#9ca3af" />
                <Input
                  className="flex-1 border-0 bg-transparent"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#9ca3af" />
                  ) : (
                    <Eye size={20} color="#9ca3af" />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Confirm Password */}
            <View className="gap-2">
              <Text className="text-foreground font-medium">تأكيد كلمة المرور</Text>
              <View className="flex-row items-center border border-border rounded-xl px-4 bg-card">
                <Lock size={20} color="#9ca3af" />
                <Input
                  className="flex-1 border-0 bg-transparent"
                  placeholder="أعد إدخال كلمة المرور"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            {/* Password Mismatch */}
            {password !== confirmPassword && confirmPassword.length > 0 && (
              <Text className="text-destructive text-center">
                كلمات المرور غير متطابقة
              </Text>
            )}

            {/* Error Message */}
            {error && (
              <Text className="text-destructive text-center">
                فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.
              </Text>
            )}

            {/* Register Button */}
            <Button 
              className="mt-4" 
              onPress={handleRegister}
              disabled={isLoading || !email || !password || !name || password !== confirmPassword}
            >
              <Text className="text-primary-foreground font-semibold">
                {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </Text>
            </Button>

            {/* Login Link */}
            <View className="flex-row justify-center gap-1 mt-4">
              <Text className="text-muted-foreground">لديك حساب بالفعل؟</Text>
              <Pressable onPress={() => router.push('/(tabs)/(auth)/login' as any)}>
                <Text className="text-primary font-semibold">سجل الدخول</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </Animated.View>
  );
}
