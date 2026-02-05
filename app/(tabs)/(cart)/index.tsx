import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react-native';
import { View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useGetCartQuery } from '@/store/features/cart/cartSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard({
    loginRoute: '/(tabs)/(cart)/login',
    enabled: true,
  });

  const { data: cart, isLoading: cartLoading } = useGetCartQuery(undefined, {
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

  // Loading cart data
  if (cartLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#020617" />
      </View>
    );
  }

  // Empty cart
  if (!cart?.items || cart.items.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-background p-6">
        <View className="bg-primary/10 rounded-full p-8 mb-6">
          <Icon as={ShoppingCart} size={64} className="text-primary" />
        </View>
        <Text className="text-2xl font-bold text-foreground text-center mb-2">
          سلة التسوق فارغة
        </Text>
        <Text className="text-muted-foreground text-center mb-6">
          لم تقم بإضافة أي منتجات إلى سلة التسوق بعد
        </Text>
        <Button onPress={() => router.push('/(tabs)/(categories)' as any)}>
          <Text className="text-primary-foreground font-semibold">تصفح المنتجات</Text>
        </Button>
      </View>
    );
  }

  // Calculate totals
  const subtotal = cart.items.reduce((sum: number, item: any) => {
    return sum + (parseFloat(item.product?.price || 0) * item.quantity);
  }, 0);

  // Cart with items
  return (
    <Animated.View className="flex-1 bg-background" entering={FadeIn.duration(600)}>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="p-4 gap-4">
          <Text className="text-2xl font-bold text-foreground">
            سلة التسوق ({cart.items.length})
          </Text>

          {cart.items.map((item: any) => (
            <Pressable 
              key={item.id}
              className="flex-row bg-card rounded-xl p-4 gap-4"
              onPress={() => router.push(`/(tabs)/(cart)/products/${item.product_id}` as any)}
            >
              <View className="w-20 h-20 bg-muted rounded-lg items-center justify-center">
                <Icon as={ShoppingCart} size={32} className="text-muted-foreground" />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold" numberOfLines={2}>
                  {item.product?.name || 'منتج'}
                </Text>
                <Text className="text-primary font-bold mt-1">
                  {item.product?.price || '0'} ر.س
                </Text>
                
                {/* Quantity Controls */}
                <View className="flex-row items-center gap-2 mt-2">
                  <Pressable className="w-8 h-8 rounded-full bg-muted items-center justify-center">
                    <Minus size={16} color="#020617" />
                  </Pressable>
                  <Text className="text-foreground font-semibold w-8 text-center">
                    {item.quantity}
                  </Text>
                  <Pressable className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                    <Plus size={16} color="#ffffff" />
                  </Pressable>
                </View>
              </View>
              <Pressable className="p-2">
                <Icon as={Trash2} size={20} className="text-destructive" />
              </Pressable>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Checkout Footer */}
      <View 
        className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-muted-foreground">المجموع الفرعي</Text>
          <Text className="text-xl font-bold text-foreground">{subtotal.toFixed(2)} ر.س</Text>
        </View>
        <Button className="w-full">
          <Text className="text-primary-foreground font-semibold">إتمام الشراء</Text>
        </Button>
      </View>
    </Animated.View>
  );
}
