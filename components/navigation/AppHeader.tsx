import React, { useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView edges={['top']} style={{ backgroundColor: isTransparent ? 'transparent' : '#fff' }}>
      <View style={{ height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
        {/* Left: Back Button */}
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          {navigation.canGoBack() && (
             <TouchableOpacity onPress={handleBack} style={{ padding: 4 }}>
               <Icon as={ArrowLeft} size={24} color={iconColor} />
             </TouchableOpacity>
          )}
        </View>

        {/* Center: Title or Search */}
        <View style={{ flex: 4, alignItems: 'center' }}>
          {variant === 'categories' ? (
            <TouchableOpacity
              onPress={() => router.push('/search')}
              style={{
                width: '100%',
                backgroundColor: '#f1f5f9',
                borderRadius: 10,
                paddingVertical: 8,
                paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8
              }}>
              <Icon as={Search} size={16} className="text-gray-500" />
              <Text className="text-sm text-gray-500">ابحث عن تصنيف أو منتج</Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-lg font-semibold" style={{ color: iconColor }}>
              {title}
            </Text>
          )}
        </View>
        
        {/* Right: Actions (Placeholder for now) */}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
             {/* Can add cart/profile icons here later */}
        </View>

      </View>
    </SafeAreaView>
  );
}
