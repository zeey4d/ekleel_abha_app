import React, { useState } from "react";
import { View, Image, ScrollView, Pressable, Dimensions } from "react-native";
import { getImageUrl } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  mainImage: string;
}

export const ProductGallery = ({ images, mainImage }: ProductGalleryProps) => {
  const allImages = images && images.length > 0 ? images : (mainImage ? [mainImage] : []);
  const [selectedImage, setSelectedImage] = useState(allImages[0] || "");
  const { width } = Dimensions.get('window');

  if (!selectedImage) return null;

  return (
    <View className="flex-col gap-4">
      {/* Main Image */}
      <View className="w-full aspect-square bg-white rounded-2xl border border-border p-4 items-center justify-center overflow-hidden">
        <Image
          source={{ uri: getImageUrl(selectedImage) }}
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
        >
        {allImages.map((img, idx) => (
            <Pressable
            key={idx}
            onPress={() => setSelectedImage(img)}
            className={cn(
                "w-20 h-20 rounded-lg border-2 bg-white overflow-hidden",
                selectedImage === img ? "border-primary" : "border-border"
            )}
            >
            <Image 
                source={{ uri: getImageUrl(img) }} 
                className="w-full h-full" 
                resizeMode="contain"
            />
            </Pressable>
        ))}
        </ScrollView>
      )}
    </View>
  );
};