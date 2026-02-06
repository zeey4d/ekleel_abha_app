import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Icon } from '@/components/ui/icon';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react-native';
import { useGetWishlistQuery } from '@/store/features/wishlist/wishlistSlice';

export default function WishlistScreen() {

  // Wishlist with items
  return (
    
    <Animated.ScrollView className="flex-1 bg-background mt-10" entering={FadeIn.duration(600)}>
      <View className="p-4 gap-4 flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-foreground">قائمة الأمنيات</Text>
        <Text className="text-muted-foreground">لم تقم بإضافة أي منتجات إلى قائمة الأمنيات بعد</Text>
      </View>
    </Animated.ScrollView>
  );
}
