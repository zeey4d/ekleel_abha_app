import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity, PanResponder } from 'react-native';
import { getImageUrl } from '@/lib/image-utils';

interface ProductGalleryProps {
  images: string[];
  mainImage: string;
}

export const ProductGallery = ({ images, mainImage }: ProductGalleryProps) => {
  const allImages = images && images.length > 0 ? images : mainImage ? [mainImage] : [];
  const [selectedImage, setSelectedImage] = useState(allImages[0] || '');
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierState, setMagnifierState] = useState({ x: 0, y: 0, lensX: 0, lensY: 0 });

  const lensSize = 160;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      const { locationX, locationY, target } = e.nativeEvent;
      const { width, height } = target.getBoundingClientRect();

      let lensX = locationX - lensSize / 2;
      let lensY = locationY - lensSize / 2;

      if (lensX < 0) lensX = 0;
      if (lensX > width - lensSize) lensX = width - lensSize;
      if (lensY < 0) lensY = 0;
      if (lensY > height - lensSize) lensY = height - lensSize;

      const xPct = (lensX / (width - lensSize)) * 100;
      const yPct = (lensY / (height - lensSize)) * 100;

      setMagnifierState({ x: xPct, y: yPct, lensX, lensY });
    },
    onPanResponderRelease: () => setShowMagnifier(false),
  });

  if (!selectedImage) return null;

  return (
    <View className="flex flex-col gap-4 lg:flex-row">
      {/* Thumbnails */}
      <View className="order-2 lg:order-2 lg:w-20">
        {allImages.length > 1 && (
          <View className="flex snap-x gap-3 overflow-x-auto pb-2 lg:max-h-[500px] lg:snap-y lg:flex-col lg:overflow-y-auto lg:pb-0">
            {allImages.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedImage(img)}
                className={`relative h-20 w-20 flex-shrink-0 snap-start overflow-hidden rounded-lg border-2 bg-slate-50 transition-all ${
                  selectedImage === img
                    ? 'border-primary shadow-sm'
                    : 'border-transparent hover:border-slate-300'
                }`}>
                <Image
                  source={{ uri: getImageUrl(img) }}
                  className="h-full w-full object-contain p-1"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Main Image with Magnifier */}
      <View className="order-1 flex-1 lg:order-1">
        <View
          className="group relative z-10 aspect-square cursor-crosshair overflow-visible rounded-2xl border border-slate-100 bg-white"
          onTouchStart={() => setShowMagnifier(true)}
          onTouchEnd={() => setShowMagnifier(false)}
          {...panResponder.panHandlers}>
          <Image
            source={{ uri: getImageUrl(selectedImage) }}
            className="h-full w-full object-contain p-4"
            resizeMode="contain"
          />

          {/* Lens Overlay */}
          {showMagnifier && (
            <View
              className="pointer-events-none absolute z-30 hidden border border-primary/40 bg-primary/5 lg:block"
              style={{
                width: lensSize,
                height: lensSize,
                left: magnifierState.lensX,
                top: magnifierState.lensY,
                backgroundImage: `
                  linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
                `,
                backgroundSize: '8px 8px',
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
};
