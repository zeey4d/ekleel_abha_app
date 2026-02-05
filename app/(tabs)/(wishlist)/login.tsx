import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLoginMutation } from '@/store/features/auth/authSlice';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';

export default function WishlistLoginScreen() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const [login, { isLoading, error }] = useLoginMutation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      await login({ email, password }).unwrap();
      // After successful login, go back to wishlist
      router.replace('/(tabs)/(wishlist)' as any);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
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
          <Text className="text-xl font-bold text-foreground">تسجيل الدخول</Text>
        </View>

        <View className="flex-1 justify-center px-6 py-8">
          {/* Icon & Title */}
          <View className="items-center mb-8">
            <View className="bg-primary/10 rounded-full p-6 mb-4">
              <Lock size={48} color="#020617" />
            </View>
            <Text className="text-2xl font-bold text-foreground text-center">
              سجل الدخول للوصول لقائمة الأمنيات
            </Text>
            <Text className="text-muted-foreground text-center mt-2">
              يرجى تسجيل الدخول لعرض وإدارة قائمة الأمنيات الخاصة بك
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
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

            {/* Error Message */}
            {error && (
              <Text className="text-destructive text-center">
                فشل تسجيل الدخول. يرجى التحقق من البيانات.
              </Text>
            )}

            {/* Login Button */}
            <Button 
              className="mt-4" 
              onPress={handleLogin}
              disabled={isLoading || !email || !password}
            >
              <Text className="text-primary-foreground font-semibold">
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Text>
            </Button>

            {/* Register Link */}
            <View className="flex-row justify-center gap-1 mt-4">
              <Text className="text-muted-foreground">ليس لديك حساب؟</Text>
              <Pressable onPress={() => router.push('/(tabs)/(auth)/register' as any)}>
                <Text className="text-primary font-semibold">سجل الآن</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
