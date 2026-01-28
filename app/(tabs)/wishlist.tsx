import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { View } from 'react-native';

export default function Wishlist() {
  return (
     <View className="flex-1 justify-center items-center">
      <Text className="text-foreground text-lg">قائمة الرغبات فارغة حالياً.</Text>
      <Button className="mt-4" onPress={() => { /* Navigate to products or categories */ }}>
        تصفح المنتجات
      </Button>
    </View>
  );
}
