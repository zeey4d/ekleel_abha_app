import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { BellIcon, CheckCircleIcon, InfoIcon, AlertCircleIcon } from 'lucide-react-native';
import { View, ScrollView } from 'react-native';

const notifications = [
  {
    id: 1,
    title: 'إشعار جديد',
    message: 'لديك رسالة جديدة من أحمد',
    time: 'منذ 5 دقائق',
    type: 'info',
    icon: InfoIcon,
  },
  {
    id: 2,
    title: 'تم بنجاح',
    message: 'تم حفظ التغييرات بنجاح',
    time: 'منذ ساعة',
    type: 'success',
    icon: CheckCircleIcon,
  },
  {
    id: 3,
    title: 'تنبيه',
    message: 'يرجى تحديث معلومات الملف الشخصي',
    time: 'منذ ساعتين',
    type: 'warning',
    icon: AlertCircleIcon,
  },
];

export default function NotificationsScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 gap-6 p-6">
        <View className="items-center gap-3">
          <View className="rounded-full bg-primary/10 p-6">
            <Icon as={BellIcon} size={48} className="text-primary" />
          </View>
          <Text className="text-3xl font-bold text-foreground">الإشعارات</Text>
        </View>

        <View className="gap-3">
          {notifications.map((notification) => (
            <View key={notification.id} className="rounded-xl bg-card p-5 shadow-sm">
              <View className="flex-row items-start gap-4">
                <View className={`rounded-full p-2 ${
                  notification.type === 'success' ? 'bg-green-500/10' :
                  notification.type === 'warning' ? 'bg-yellow-500/10' :
                  'bg-blue-500/10'
                }`}>
                  <Icon 
                    as={notification.icon} 
                    size={24} 
                    className={
                      notification.type === 'success' ? 'text-green-500' :
                      notification.type === 'warning' ? 'text-yellow-500' :
                      'text-blue-500'
                    }
                  />
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-lg font-semibold text-foreground">
                    {notification.title}
                  </Text>
                  <Text className="text-muted-foreground leading-5">
                    {notification.message}
                  </Text>
                  <Text className="text-sm text-muted-foreground mt-1">
                    {notification.time}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
