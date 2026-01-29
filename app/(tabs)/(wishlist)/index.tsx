import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

export default function WishlistScreen() {
  const router = useRouter();
  
  return (
     <View className="flex-1 justify-center items-center bg-background">
      <Text className="text-foreground text-lg">قائمة الرغبات فارغة حالياً.</Text>
      <Button className="mt-4" onPress={() => router.push('/(tabs)/(categories)')}>
        تصفح المنتجات
      </Button>
    </View>
  );
}
