import React, { useState, useRef } from 'react';
import { View, Pressable, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image'; // أفضل للأداء والكاش
import { Maximize2 } from 'lucide-react-native';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger, 
  DialogTitle, 
  DialogClose 
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProductGalleryProps {
  images: string[];
  mainImage: string;
}

export const ProductGallery = ({ images, mainImage }: ProductGalleryProps) => {
  const allImages = images && images.length > 0 ? images : (mainImage ? [mainImage] : []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  if (allImages.length === 0) return null;

  const handleThumbnailPress = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <View className="flex-col gap-4">
      {/* الصورة الأساسية مع مودال التكبير */}
      <Dialog>
        <View className="relative aspect-square w-full bg-white rounded-3xl border border-border overflow-hidden">
          <Image
            source={{ uri: allImages[selectedIndex] }}
            contentFit="contain"
            transition={500}
            className="w-full h-full p-4"
          />

          {/* زر التكبير */}
          <DialogTrigger asChild>
            <Pressable 
              className="absolute top-4 right-4 p-3 bg-white/90 rounded-full shadow-sm active:opacity-70"
            >
              <Maximize2 size={20} className="text-foreground" />
            </Pressable>
          </DialogTrigger>
        </View>

        {/* مودال العرض كامل الشاشة */}
        <DialogContent className="p-0 bg-black/95 border-0 h-full w-full justify-center">
          <DialogTitle className="sr-only">عرض الصورة</DialogTitle>
          <Image
            source={{ uri: allImages[selectedIndex] }}
            contentFit="contain"
            className="w-full h-[80%]"
          />
          <DialogClose className="absolute top-12 right-6 p-2 bg-white/20 rounded-full">
             <Text className="text-white">إغلاق</Text>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* قائمة الصور المصغرة (Thumbnails) */}
      {allImages.length > 1 && (
        <FlatList
          data={allImages}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingHorizontal: 4, gap: 12 }}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => handleThumbnailPress(index)}
              className={cn(
                "w-20 h-20 rounded-2xl border-2 overflow-hidden bg-card",
                selectedIndex === index ? "border-primary" : "border-transparent"
              )}
            >
              <Image
                source={{ uri: item }}
                contentFit="contain"
                className="w-full h-full p-1"
              />
            </Pressable>
          )}
        />
      )}
    </View>
  );
};