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
    <View className="flex-col gap-6 bg-[#f8fafc] p-4 pb-0">
      {/* Main Image */}
      <View 
        style={{ 
            aspectRatio: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 12,
            elevation: 2
        }} 
        className="w-full bg-white rounded-[32px] border border-slate-50 p-6 items-center justify-center overflow-hidden"
      >
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
            contentContainerStyle={{ gap: 12, paddingHorizontal: 4, paddingBottom: 8 }}
        >
        {allImages.map((img, idx) => (
            <Pressable
            key={idx}
            onPress={() => setSelectedImage(img)}
            className={cn(
                "w-20 h-20 rounded-2xl border-2 bg-white overflow-hidden shadow-sm",
                selectedImage === img ? "border-teal-600" : "border-slate-50"
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