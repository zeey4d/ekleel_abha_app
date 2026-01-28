import React, { useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, ShoppingCart } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

interface HeaderProps {
  navigation: any;
  route: any;
  options: any;
  back?: any;
}

export default function AppHeader({ navigation, route, options, back }: HeaderProps) {
  const router = useRouter();
  const variant: 'default' | 'categories' = options?.headerVariant || 'default';

  const title = useMemo(() => {
    if (typeof options?.headerTitle === 'string') return options.headerTitle;
    if (typeof options?.title === 'string') return options.title;
    if (route?.name) return route.name;
    return '';
  }, [options, route]);

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      router.replace('/');
    }
  };

  const isTransparent = Boolean(options?.headerTransparent);
  const iconColor = isTransparent ? '#ffffff' : '#111827';

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      {variant === 'categories' ? (
        <TouchableOpacity
          onPress={() => router.push('/search')}
          style={{
            width: '100%',
            backgroundColor: '#f1f5f9',
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 12,
          }}>
          <Text className="text-sm text-gray-500">ابحث عن تصنيف أو منتج</Text>
        </TouchableOpacity>
      ) : (
        <Text className="text-lg font-semibold" style={{ color: iconColor }}>
          {title}
        </Text>
      )}
    </View>
  );
}
