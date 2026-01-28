import React from 'react';
import { View, ScrollView } from 'react-native';
import { Star } from 'lucide-react-native';

// مكونات react-native-reusables
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';

// Hooks
import { useGetProductReviewsQuery } from "@/store/features/reviews/reviewsSlice";

interface ProductReviewsProps {
  productId: number;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { data, isLoading } = useGetProductReviewsQuery({ productId, limit: 5 });

  if (isLoading) return <ReviewsSkeleton />;

  const reviews = data?.ids.map(id => data.entities[id]) || [];
  const meta = data?.meta;
  const distribution = [70, 20, 5, 2, 3]; // Mock data

  return (
    <View className="flex-col gap-8 p-4">
      {/* Summary Section */}
      <View className="bg-muted/30 p-6 rounded-3xl border border-border">
        <View className="items-center mb-6">
          <Text className="text-5xl font-bold text-foreground">4.5</Text>
          <View className="flex-row my-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} fill={i < 4 ? "#FACC15" : "transparent"} color="#FACC15" />
            ))}
          </View>
          <Text className="text-sm text-muted-foreground">
             بناءً على {meta?.total || 0} تقييم
          </Text>
        </View>

        {/* Stars Distribution */}
        <View className="gap-3">
          {[5, 4, 3, 2, 1].map((star, idx) => (
            <View key={star} className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-1 w-10">
                <Star size={14} fill="#FACC15" color="#FACC15" />
                <Text className="text-sm font-medium">{star}</Text>
              </View>
              <View className="flex-1">
                <Progress value={distribution[idx]} className="h-2" />
              </View>
              <Text className="w-8 text-right text-xs text-muted-foreground">
                {distribution[idx]}%
              </Text>
            </View>
          ))}
        </View>

        <Button variant="outline" className="mt-6 rounded-xl">
          <Text>كتابة مراجعة</Text>
        </Button>
      </View>

      {/* Reviews List */}
      <View className="gap-6">
        {reviews.length === 0 ? (
          <View className="py-10 items-center">
            <Text className="text-muted-foreground">لا توجد تقييمات بعد</Text>
          </View>
        ) : (
          reviews.map((review) => (
            <View key={review.id} className="border-b border-border pb-6">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center gap-3">
                  <Avatar className="w-10 h-10" alt={review.author}>
                    <AvatarImage source={{ uri: review.author_image }} />
                    <AvatarFallback>
                      <Text>{review.author?.[0] || 'U'}</Text>
                    </AvatarFallback>
                  </Avatar>
                  <View>
                    <Text className="font-bold text-sm">{review.author}</Text>
                    <View className="flex-row mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          fill={i < review.rating ? "#FACC15" : "transparent"} 
                          color={i < review.rating ? "#FACC15" : "#E2E8F0"} 
                        />
                      ))}
                    </View>
                  </View>
                </View>
                <Text className="text-[10px] text-muted-foreground">
                  {new Date(review.date_added).toLocaleDateString('ar-EG')}
                </Text>
              </View>
              <Text className="text-muted-foreground text-sm leading-5">
                {review.text}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

function ReviewsSkeleton() {
  return (
    <View className="p-4 gap-4">
      <Skeleton className="h-48 w-full rounded-3xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </View>
  );
}