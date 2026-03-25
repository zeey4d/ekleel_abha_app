import React from 'react';
import { View, Pressable } from 'react-native';
import { useGetProductReviewsQuery } from "@/store/features/reviews/reviewsSlice";
import { Star } from "lucide-react-native";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProductReviewsProps {
  productId: number;
}

const ProgressBar = ({ value }: { value: number }) => (
  <View className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
    <View 
      className="h-full bg-yellow-400 rounded-full" 
      style={{ width: `${value}%` }} 
    />
  </View>
);

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { t } = useTranslation('products');
  const { data, isLoading } = useGetProductReviewsQuery({ productId, limit: 5 });

  if (isLoading) return <ReviewsSkeleton />;

  // Ensure data exists, otherwise use empty defaults
  const reviews = data?.ids.map(id => data.entities[id]) || [];
  const meta = data?.meta;

  // Mock distribution logic
  const distribution = [70, 20, 5, 2, 3]; // Percentages for 5,4,3,2,1 stars

  return (
    <View className="gap-8 pb-8">
      {/* Summary Section */}
      <View className="bg-secondary/20 p-6 rounded-2xl">
        <View className="items-center mb-6">
          <Text className="text-5xl font-bold text-foreground mb-2">4.5</Text>
          <View className="flex-row gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill={i < 4 ? "#facc15" : "transparent"} color={i < 4 ? "#facc15" : "#ccc"} />
            ))}
          </View>
          <Text className="text-sm text-muted-foreground">{t('ProductReviews.basedOnReviews', { count: meta?.total || 0 })}</Text>
        </View>

        <View className="gap-3 w-full">
          {[5, 4, 3, 2, 1].map((star, idx) => (
            <View key={star} className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-1 w-8">
                <Text className="font-medium text-sm text-foreground">{star}</Text>
                <Star size={12} className="text-yellow-400" fill="#facc15" />
              </View>
              <ProgressBar value={distribution[idx]} />
              <Text className="w-8 text-end text-muted-foreground text-xs">{distribution[idx]}%</Text>
            </View>
          ))}
        </View>

        <Button className="w-full mt-6" variant="outline">
            <Text>{t('ProductReviews.writeReview')}</Text>
        </Button>
      </View>

      {/* Reviews List */}
      <View className="gap-6">
        {reviews.length === 0 ? (
          <Text className="text-center py-10 text-muted-foreground">{t('ProductReviews.noReviews')}</Text>
        ) : (
          reviews.map((review) => (
            <View key={review.id} className="border-b border-border pb-6">
              <View className="flex-row justify-between mb-3">
                <View className="flex-row items-center gap-3">
                  <Avatar className="h-10 w-10" alt={review.author || 'User Avatar'}>
                    <AvatarFallback>
                        <Text>{review.author?.[0] || 'U'}</Text>
                    </AvatarFallback>
                  </Avatar>
                  <View>
                    <Text className="font-bold text-foreground text-sm text-start">{review.author}</Text>
                    <View className="flex-row mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < review.rating ? "#facc15" : "transparent"} color={i < review.rating ? "#facc15" : "#e2e8f0"} />
                      ))}
                    </View>
                  </View>
                </View>
                <Text className="text-xs text-muted-foreground">{new Date(review.date_added).toLocaleDateString()}</Text>
              </View>
              <Text className="text-muted-foreground text-sm leading-6 text-start">{review.text}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

function ReviewsSkeleton() {
  return <Skeleton className="h-64 w-full rounded-xl" />
}