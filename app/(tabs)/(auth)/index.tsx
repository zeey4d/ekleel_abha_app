import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { UserIcon, MailIcon, PhoneIcon, MapPinIcon, SettingsIcon } from 'lucide-react-native';
import { View, ScrollView } from 'react-native';

export default function AccountScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 gap-6 p-6">
        {/* Profile Header */}
        <View className="items-center gap-4">
          <View className="rounded-full bg-primary/10 p-8">
            <Icon as={UserIcon} size={64} className="text-primary" />
          </View>
          <View className="items-center gap-1">
            <Text className="text-3xl font-bold text-foreground">أحمد محمد</Text>
            <Text className="text-muted-foreground">مطور تطبيقات</Text>
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
                <Text className="text-foreground font-medium">ahmed@example.com</Text>
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
                <Text className="text-foreground font-medium">+966 50 123 4567</Text>
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
                <Text className="text-foreground font-medium">الرياض، المملكة العربية السعودية</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Button */}
        <Button className="flex-row items-center justify-center gap-2 mt-2">
          <Icon as={SettingsIcon} size={20} className="text-primary-foreground" />
          <Text className="text-primary-foreground font-semibold">الإعدادات</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
