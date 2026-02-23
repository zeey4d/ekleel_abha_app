import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { getImageUrl } from '@/lib/image-utils';
import { Badge } from '../ui/badge'; 

interface Category {
  id: number;
  name: string;
  image?: string | null;
  product_count?: number;
  children_count?: number;
}

export const CategoryCard = ({ category }: { category: Category }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/categories/${category.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        {category.image ? (
          <Image
            source={{ uri: getImageUrl(category.image) }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>{category.name[0]}</Text>
          </View>
        )}

        {/* Overlay */}
        <View style={styles.overlay} />

        {/* Count Badge */}
        <View style={styles.badgeWrapper}>
          <Badge style={styles.badgeCustom}>
            <Text style={styles.badgeText}>
              {category.product_count || 0} Items
            </Text>
          </Badge>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{category.name}</Text>

        {category.children_count !== undefined && category.children_count > 0 && (
          <Text style={styles.subtitle}>
            {category.children_count} Subcategories
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.shopNowText}>Shop Now</Text>
          <ArrowRight size={14} color="#007AFF" />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    position: 'relative',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9', // slate-100
    backgroundColor: '#ffffff',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    borderColor: '#e2e8f0', // slate-200
    opacity: 0.9,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    overflow: 'hidden',
    backgroundColor: '#f8fafc', // slate-50
  },
  image: {
    height: '100%',
    width: '100%',
  },
  placeholderContainer: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  placeholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#cbd5e1', // slate-300
    opacity: 0.5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  badgeWrapper: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  badgeCustom: {
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1e293b', // slate-800
  },
  content: {
    alignItems: 'center',
    padding: 16,
  },
  title: {
    marginBottom: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a', // slate-900
  },
  subtitle: {
    marginBottom: 12,
    fontSize: 12,
    color: '#64748b', // slate-500
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopNowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 4,
  },
});