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
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard({
    loginRoute: '/(tabs)/(wishlist)/login',
    enabled: true,
  });

  const { data: wishlist, isLoading: wishlistLoading } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Show loading while checking auth
  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#020617" />
      </View>
    );
  }

  // If not authenticated, the hook will redirect - show loading
  if (!isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#020617" />
      </View>
    );
  }

  // Loading wishlist data
  if (wishlistLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#020617" />
      </View>
    );
  }

  // Empty wishlist
  if (!wishlist?.items || wishlist.items.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-6">
        <View className="bg-primary/10 rounded-full p-8 mb-6">
          <Icon as={Heart} size={64} className="text-primary" />
        </View>
        <Text className="text-2xl font-bold text-foreground text-center mb-2">
          قائمة الأمنيات فارغة
        </Text>
        <Text className="text-muted-foreground text-center mb-6">
          لم تقم بإضافة أي منتجات إلى قائمة الأمنيات بعد
        </Text>
        <Button onPress={() => router.push('/(tabs)/(categories)' as any)}>
          <Text className="text-primary-foreground font-semibold">تصفح المنتجات</Text>
        </Button>
      </View>
    );
  }

  // Wishlist with items
  return (
    <Animated.ScrollView className="flex-1 bg-background" entering={FadeIn.duration(600)}>
      <View className="p-4 gap-4">
        <Text className="text-2xl font-bold text-foreground">
          قائمة الأمنيات ({wishlist.items.length})
        </Text>

        {wishlist.items.map((item: any) => (
          <Pressable 
            key={item.id}
            className="flex-row bg-card rounded-xl p-4 gap-4"
            onPress={() => router.push(`/(tabs)/(wishlist)/products/${item.product_id}` as any)}
          >
            <View className="w-20 h-20 bg-muted rounded-lg items-center justify-center">
              <Icon as={ShoppingBag} size={32} className="text-muted-foreground" />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-semibold" numberOfLines={2}>
                {item.product?.name || 'منتج'}
              </Text>
              <Text className="text-primary font-bold mt-2">
                {item.product?.price || '0'} ر.س
              </Text>
            </View>
            <Pressable className="p-2">
              <Icon as={Trash2} size={20} className="text-destructive" />
            </Pressable>
          </Pressable>
        ))}
      </View>
    </Animated.ScrollView>
  );
}
