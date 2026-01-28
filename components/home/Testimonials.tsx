import React from 'react';
import { View, Image, FlatList } from 'react-native';
import { Text } from '@/components/ui/text';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslation } from 'react-i18next';
import { Quote } from 'lucide-react-native';

interface Testimonial {
  id: number | string;
  name: string;
  position: string;
  content: string;
  image: string | null;
  rating: number;
}

export const Testimonials = ({ testimonials }: { testimonials: Testimonial[] }) => {
  const { t } = useTranslation('home');

  if (!testimonials?.length) return null;

  return (
    <View className="rounded-3xl bg-muted px-4 py-12">
      {/* Header */}
      <View className="mb-10 items-center">
        <Text className="text-center text-2xl font-bold text-foreground">
          {t('Testimonials.title')}
        </Text>
        <Text className="mt-2 text-center text-muted-foreground">{t('Testimonials.subtitle')}</Text>
      </View>

      {/* Cards */}
      <FlatList
        data={testimonials.slice(0, 3)}
        keyExtractor={(item) => item.id.toString()}
        numColumns={1}
        contentContainerStyle={{ gap: 16 }}
        renderItem={({ item }) => (
          <View className="relative rounded-2xl border border-border bg-card p-6">
            {/* Quote Icon */}
            <Quote size={28} className="absolute right-4 top-4 text-border" />

            {/* Content */}
            <Text className="mb-6 leading-relaxed text-muted-foreground">“{item.content}”</Text>

            {/* User */}
            <View className="flex-row items-center gap-3">
              {item.image ? (
                <Image
                  source={{ uri: getImageUrl(item.image) }}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <View className="h-10 w-10 items-center justify-center rounded-full bg-border">
                  <Text className="font-bold">{item.name.charAt(0)}</Text>
                </View>
              )}

              <View>
                <Text className="text-sm font-bold text-foreground">{item.name}</Text>
                <Text className="text-xs text-muted-foreground">{item.position}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};
