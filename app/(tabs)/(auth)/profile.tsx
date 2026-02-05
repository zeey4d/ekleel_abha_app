import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { UserIcon, MailIcon, PhoneIcon, MapPinIcon, SettingsIcon, LogOutIcon, ShoppingBag, Heart, CreditCard } from 'lucide-react-native';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useGetMeQuery, useLogoutMutation } from '@/store/features/auth/authSlice';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileScreen() {
  const router = useRouter();
  const { data: user, isLoading } = useGetMeQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.replace('/(tabs)/(auth)/login' as any);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background p-6">
        <View className="items-center gap-4 mb-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="w-40 h-6 rounded-lg" />
          <Skeleton className="w-32 h-4 rounded-lg" />
        </View>
        <View className="gap-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 gap-6 p-6">
        {/* Profile Header */}
        <View className="items-center gap-4">
          <View className="rounded-full bg-primary/10 p-8">
            <Icon as={UserIcon} size={64} className="text-primary" />
          </View>
          <View className="items-center gap-1">
            <Text className="text-3xl font-bold text-foreground">
              {user?.name || 'المستخدم'}
            </Text>
            <Text className="text-muted-foreground">
              {user?.email || ''}
            </Text>
          </View>
        </View>

        {/* Profile Info Cards */}
        <View className="gap-3">
          <View className="rounded-xl bg-card p-5 shadow-sm">
            <View className="flex-row items-center gap-4">
              <View className="rounded-full bg-primary/10 p-3">
                <Icon as={MailIcon} size={24} className="text-primary" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground mb-1">البريد الإلكتروني</Text>
                <Text className="text-foreground font-medium">{user?.email || '-'}</Text>
              </View>
            </View>
          </View>

          <View className="rounded-xl bg-card p-5 shadow-sm">
            <View className="flex-row items-center gap-4">
              <View className="rounded-full bg-primary/10 p-3">
                <Icon as={PhoneIcon} size={24} className="text-primary" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground mb-1">رقم الهاتف</Text>
                <Text className="text-foreground font-medium">{user?.phone || '-'}</Text>
              </View>
            </View>
          </View>

          <View className="rounded-xl bg-card p-5 shadow-sm">
            <View className="flex-row items-center gap-4">
              <View className="rounded-full bg-primary/10 p-3">
                <Icon as={MapPinIcon} size={24} className="text-primary" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground mb-1">الموقع</Text>
                <Text className="text-foreground font-medium">
                  {user?.address?.city || 'لم يتم التحديد'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View className="gap-3">
          <Text className="text-lg font-semibold text-foreground">روابط سريعة</Text>
          
          <Pressable 
            className="flex-row items-center gap-4 rounded-xl bg-card p-4"
            onPress={() => router.push('/(tabs)/(cart)' as any)}
          >
            <Icon as={ShoppingBag} size={24} className="text-primary" />
            <Text className="flex-1 text-foreground">طلباتي</Text>
          </Pressable>

          <Pressable 
            className="flex-row items-center gap-4 rounded-xl bg-card p-4"
            onPress={() => router.push('/(tabs)/(wishlist)' as any)}
          >
            <Icon as={Heart} size={24} className="text-primary" />
            <Text className="flex-1 text-foreground">قائمة الأمنيات</Text>
          </Pressable>

          <Pressable 
            className="flex-row items-center gap-4 rounded-xl bg-card p-4"
          >
            <Icon as={CreditCard} size={24} className="text-primary" />
            <Text className="flex-1 text-foreground">طرق الدفع</Text>
          </Pressable>

          <Pressable 
            className="flex-row items-center gap-4 rounded-xl bg-card p-4"
          >
            <Icon as={SettingsIcon} size={24} className="text-primary" />
            <Text className="flex-1 text-foreground">الإعدادات</Text>
          </Pressable>
        </View>

        {/* Logout Button */}
        <Button 
          variant="destructive" 
          className="flex-row items-center justify-center gap-2 mt-2"
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <Icon as={LogOutIcon} size={20} className="text-destructive-foreground" />
          <Text className="text-destructive-foreground font-semibold">
            {isLoggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
}
