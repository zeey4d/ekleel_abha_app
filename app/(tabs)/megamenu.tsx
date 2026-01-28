import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, FlatList, Image, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';
import { useGetCategoryTreeQuery } from '@/store/features/categories/categoriesSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'expo-router';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-utils';
import { Search } from 'lucide-react-native';
import { Input } from '@/components/ui/input';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.28;

export default function MegaMenu() {
  const router = useRouter();
  const { data: categoryState, isLoading } = useGetCategoryTreeQuery({});
  const categories = categoryState?.tree || [];
  
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Set initial selected category
  useEffect(() => {
    if (categories.length > 0 && !selectedId) {
      setSelectedId(categories[0].id);
    }
  }, [categories]);

  const selectedCategory = categories.find((c) => c.id === selectedId);

  if (isLoading) {
    return (
      <View className="flex-1 flex-row">
        <View className="w-[100px] border-r border-border p-2 gap-2">
           {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-md" />)}
        </View>
        <View className="flex-1 p-4 gap-4">
           {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-md" />)}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header with Search */}
      <View className="px-4 py-3 border-b border-border bg-background z-10">
        <View className="flex-row items-center bg-secondary/50 rounded-lg px-3 py-2">
          <Search size={20} className="text-muted-foreground mr-2" />
          <Text className="text-muted-foreground">Search categories...</Text>
        </View>
      </View>

      <View className="flex-1 flex-row">
        {/* Left Sidebar - Parent Categories */}
        <View className="bg-secondary/30 border-r border-border" style={{ width: SIDEBAR_WIDTH }}>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => {
              const isSelected = selectedId === item.id;
              return (
                <Pressable
                  onPress={() => setSelectedId(item.id)}
                  className={cn(
                    "py-4 px-2 border-l-4 transition-all",
                    isSelected 
                      ? "bg-background border-primary" 
                      : "border-transparent active:bg-secondary/50"
                  )}
                >
                  <Text 
                    className={cn(
                      "text-xs text-center font-medium",
                      isSelected ? "text-primary font-bold" : "text-muted-foreground"
                    )}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {/* Right Content - Subcategories */}
        <View className="flex-1 bg-background">
          {selectedCategory && (
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            >
              {/* Header for Selected Category */}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-lg font-bold text-foreground">{selectedCategory.name}</Text>
                <Pressable onPress={() => router.push(`/categories/${selectedCategory.id}`)}>
                  <Text className="text-xs text-primary font-bold">VIEW ALL</Text>
                </Pressable>
              </View>

              {/* Banner Image (if available) */}
              {selectedCategory.image && (
                <Pressable 
                  onPress={() => router.push(`/categories/${selectedCategory.id}`)}
                  className="mb-6 rounded-xl overflow-hidden shadow-sm"
                >
                  <Image 
                    source={{ uri: getImageUrl(selectedCategory.image) }} 
                    className="h-32 w-full"
                    resizeMode="cover"
                  />
                  <View className="absolute inset-x-0 bottom-0 bg-black/40 p-2">
                     <Text className="text-white text-xs font-bold text-center">Shop {selectedCategory.name}</Text>
                  </View>
                </Pressable>
              )}

              {/* Subcategories Grid */}
              <View className="flex-row flex-wrap gap-3">
                {selectedCategory.children && selectedCategory.children.length > 0 ? (
                  selectedCategory.children.map((sub) => (
                    <Pressable
                      key={sub.id}
                      onPress={() => router.push(`/categories/${sub.id}`)}
                      className="w-[30%] items-center mb-4"
                    >
                      <View className="h-16 w-16 bg-secondary rounded-full items-center justify-center mb-2 overflow-hidden border border-border">
                        {sub.image ? (
                          <Image 
                             source={{ uri: getImageUrl(sub.image) }} 
                             className="h-full w-full"
                             resizeMode="cover"
                          />
                        ) : (
                          <Text className="text-xl font-bold text-muted-foreground">
                            {sub.name.charAt(0)}
                          </Text>
                        )}
                      </View>
                      <Text className="text-[10px] text-center font-medium text-foreground leading-tight" numberOfLines={2}>
                        {sub.name}
                      </Text>
                    </Pressable>
                  ))
                ) : (
                  <View className="w-full py-10 items-center justify-center">
                    <Text className="text-muted-foreground">No subcategories found.</Text>
                    <Pressable 
                      onPress={() => router.push(`/categories/${selectedCategory.id}`)}
                      className="mt-4 bg-primary px-6 py-2 rounded-full"
                    >
                      <Text className="text-primary-foreground font-bold text-xs">Browse Products</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}