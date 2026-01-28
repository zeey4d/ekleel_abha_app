// src/features/reviews/reviewsSlice.ts
import { 
  createSelector, 
  createEntityAdapter, 
  EntityState 
} from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { productsSlice } from '../products/productsSlice';
import type { RootState } from '@/store/store';

// --- Type Definitions ---

export type ReviewId = string | number;

export interface Review {
  id: ReviewId;
  author: string;
  text: string;
  rating: number;
  date_added: string;
  date_modified?: string;
  helpful_count?: number;
  reported?: boolean;
  user?: {
    id: number;
    name: string;
  };
  product_id?: number;
  product_name?: string;
  status?: 'approved' | 'pending';
}

export interface ProductReviewResponse {
  product: {
    id: number;
    name: string;
    average_rating: number;
    total_reviews: number;
  };
  reviews: {
    data: Review[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface UserReviewResponse {
  data: Array<{
    id: number;
    product_id: number;
    product_name: string;
    text: string;
    rating: number;
    status: 'approved' | 'pending';
    date_added: string;
    date_modified?: string;
  }>;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ReviewSubmitData {
  rating: number;
  text: string;
}

export interface ReviewUpdateData extends Partial<ReviewSubmitData> {
  reviewId: ReviewId;
}

export interface GetProductReviewsParams {
  productId: number;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'highest' | 'lowest';
  rating?: number;
}

export interface GetUserReviewsParams {
  page?: number;
  limit?: number;
}

export interface ReportReviewParams {
  reviewId: ReviewId;
  reason: string;
}

// --- Entity Adapter ---

const reviewsAdapter = createEntityAdapter<Review, ReviewId>({
  selectId: (review) => review.id,
  sortComparer: (a, b) => {
    const dateA = new Date(a.date_added).getTime();
    const dateB = new Date(b.date_added).getTime();
    return dateB - dateA;
  },
});

interface ReviewsState extends EntityState<Review, ReviewId> {
  loading: boolean;
  error: string | null;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const initialReviewsState: ReviewsState = reviewsAdapter.getInitialState({
  loading: false,
  error: null,
});

// --- RTK Query API Slice ---

export const reviewsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Get Product Reviews ---
    getProductReviews: builder.query<ReviewsState, GetProductReviewsParams>({
      query: ({ productId, page = 1, limit = 10, sort = 'newest', rating }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        params.append('sort', sort);
        
        if (rating !== undefined) {
          params.append('rating', rating.toString());
        }
        
        return `/reviews/${productId}?${params.toString()}`;
      },
      transformResponse: (response: ProductReviewResponse): ReviewsState => {
        const state = reviewsAdapter.setAll(initialReviewsState, response.reviews.data);
        return {
          ...state,
          meta: response.reviews.meta
        };
      },
      providesTags: (result, error, { productId }) => [
        { type: 'Review' as const, id: `PRODUCT_${productId}` },
        { type: 'Review' as const, id: 'LIST' },
      ],
      keepUnusedDataFor: 300,
    }),

    // --- Get User Reviews ---
    getUserReviews: builder.query<ReviewsState, GetUserReviewsParams | void>({
      query: (params = {}) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 10;
        return `/reviews/user?page=${page}&limit=${limit}`;
      },
      transformResponse: (response: UserReviewResponse): ReviewsState => {
        const reviews = response.data.map(review => ({
          ...review,
          id: review.id,
          author: review.product_name,
          text: review.text,
          rating: review.rating,
          date_added: review.date_added,
          date_modified: review.date_modified,
          status: review.status
        }));
        
        const state = reviewsAdapter.setAll(initialReviewsState, reviews);
        return {
          ...state,
          meta: response.meta
        };
      },
      providesTags: [
        { type: 'Review' as const, id: 'USER' },
        { type: 'Review' as const, id: 'LIST' },
      ],
      keepUnusedDataFor: 300,
    }),

    // --- Submit Review ---
    submitReview: builder.mutation<Review, { productId: number } & ReviewSubmitData>({
      query: ({ productId, ...reviewData }) => ({
        url: `/reviews/${productId}`,
        method: 'POST',
        body: reviewData,
      }),
      async onQueryStarted({ productId, ...reviewData }, { dispatch, queryFulfilled }) {
        // Optimistic update for product reviews
        const patchResultProduct = dispatch(
          reviewsSlice.util.updateQueryData(
            'getProductReviews',
            { productId },
            (draft) => {
              const tempReview = {
                id: `temp_${Date.now()}`,
                author: 'Current User',
                date_added: new Date().toISOString(),
               ...reviewData
              };
              reviewsAdapter.addOne(draft, tempReview);
            }
          )
        );

        // Optimistic update for user reviews
        const patchResultUser = dispatch(
          reviewsSlice.util.updateQueryData(
            'getUserReviews',
            undefined,
            (draft) => {
              const tempReview: Review = {
                id: `temp_${Date.now()}`,
                author: 'Current User', // Add the author property
                product_id: productId,
                product_name: 'Loading...',
                text: reviewData.text,
                rating: reviewData.rating,
                status: 'approved',
                date_added: new Date().toISOString(),
              };
              reviewsAdapter.addOne(draft, tempReview);
            }
          )
        );

        try {
          const { data: createdReview } = await queryFulfilled;

          // Replace temporary review with actual data
          dispatch(
            reviewsSlice.util.updateQueryData(
              'getProductReviews',
              { productId },
              (draft) => {
                reviewsAdapter.removeOne(draft, `temp_${draft.ids[0]}`);
                reviewsAdapter.addOne(draft, createdReview);
              }
            )
          );

          dispatch(
            reviewsSlice.util.updateQueryData(
              'getUserReviews',
              undefined,
              (draft) => {
                reviewsAdapter.removeOne(draft, `temp_${draft.ids[0]}`);
                reviewsAdapter.addOne(draft, createdReview);
              }
            )
          );
        } catch (error) {
          patchResultProduct.undo();
          patchResultUser.undo();
          console.error('Failed to submit review:', error);
        }
      },
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review' as const, id: `PRODUCT_${productId}` },
        { type: 'Review' as const, id: 'USER' },
      ],
    }),

    // --- Update Review ---
    updateReview: builder.mutation<Review, { productId: number; reviewId: number } & Partial<ReviewSubmitData>>({
      query: ({ productId, reviewId, ...reviewData }) => ({
        url: `/reviews/${productId}/${reviewId}`,
        method: 'PUT',
        body: reviewData,
      }),
      async onQueryStarted({ productId, reviewId, ...reviewData }, { dispatch, queryFulfilled }) {
        const timestamp = new Date().toISOString();

        // Optimistic update for product reviews
        const patchResultProduct = dispatch(
          reviewsSlice.util.updateQueryData(
            'getProductReviews',
            { productId },
            (draft) => {
              const existingReview = draft.entities[reviewId];
              if (existingReview) {
                reviewsAdapter.updateOne(draft, {
                  id: reviewId,
                  changes: {
                    ...reviewData,
                    date_modified: timestamp,
                  },
                });
              }
            }
          )
        );

        // Optimistic update for user reviews
        const patchResultUser = dispatch(
          reviewsSlice.util.updateQueryData('getUserReviews', undefined, (draft) => {
            const existingReview = draft.entities[reviewId];
            if (existingReview) {
              reviewsAdapter.updateOne(draft, {
                id: reviewId,
                changes: {
                  ...reviewData,
                  date_modified: timestamp,
                },
              });
            }
          })
        );

        try {
          await queryFulfilled;
        } catch (error) {
          patchResultProduct?.undo();
          patchResultUser.undo();
          console.error('Failed to update review:', error);
        }
      },
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review' as const, id: `PRODUCT_${productId}` },
        { type: 'Review' as const, id: 'USER' },
      ],
    }),

    // --- Delete Review ---
    deleteReview: builder.mutation<{ message: string }, { productId: number; reviewId: number }>({
      query: ({ productId, reviewId }) => ({
        url: `/reviews/${productId}/${reviewId}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ productId, reviewId }, { dispatch, queryFulfilled }) {
        // Optimistic updates
        const patchResultProduct = dispatch(
          reviewsSlice.util.updateQueryData(
            'getProductReviews',
            { productId },
            (draft) => {
              reviewsAdapter.removeOne(draft, reviewId);
            }
          )
        );

        const patchResultUser = dispatch(
          reviewsSlice.util.updateQueryData('getUserReviews', undefined, (draft) => {
            reviewsAdapter.removeOne(draft, reviewId);
          })
        );

        try {
          await queryFulfilled;
        } catch (error) {
          patchResultProduct?.undo();
          patchResultUser.undo();
          console.error('Failed to delete review:', error);
        }
      },
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review' as const, id: `PRODUCT_${productId}` },
        { type: 'Review' as const, id: 'USER' },
      ],
    }),

    // --- Report Review ---
    reportReview: builder.mutation<{ message: string }, ReportReviewParams>({
      query: ({ reviewId, reason }) => ({
        url: `/reviews/${reviewId}/report`,
        method: 'POST',
        body: { reason },
      }),
    }),
  }),
});

// --- Export Hooks ---
export const {
  useGetProductReviewsQuery,
  useGetUserReviewsQuery,
  useSubmitReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useReportReviewMutation,
} = reviewsSlice;

// --- Selectors ---

// Base adapter selectors
const adapterSelectors = reviewsAdapter.getSelectors();

// Product reviews selector factory
export const selectProductReviews = (productId: number) =>
  createSelector(
    [reviewsSlice.endpoints.getProductReviews.select({ productId })],
    (result) => result.data ?? initialReviewsState
  );

// User reviews selector
export const selectUserReviews = createSelector(
  [reviewsSlice.endpoints.getUserReviews.select(undefined)],
  (result) => result.data ?? initialReviewsState
);

// Reviews by product ID
export const selectReviewsByProductId = (productId: number) =>
  createSelector([selectProductReviews(productId)], (reviewsState) =>
    adapterSelectors.selectAll(reviewsState)
  );

// Average rating for a product
export const selectProductAverageRating = (productId: number) =>
  createSelector([selectReviewsByProductId(productId)], (reviews) => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  });

// Review count for a product
export const selectProductReviewCount = (productId: number) =>
  createSelector([selectReviewsByProductId(productId)], (reviews) => reviews.length);

// Rating distribution for a product
export const selectProductRatingDistribution = (productId: number) =>
  createSelector([selectReviewsByProductId(productId)], (reviews) => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      const rating = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5;
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
      }
    });
    return distribution;
  });

// Get pagination meta for product reviews
export const selectProductReviewsMeta = (productId: number) =>
  createSelector(
    [reviewsSlice.endpoints.getProductReviews.select({ productId })],
    (result) => result.data?.meta || null
  );

// Get pagination meta for user reviews
export const selectUserReviewsMeta = createSelector(
  [reviewsSlice.endpoints.getUserReviews.select(undefined)],
  (result) => result.data?.meta || null
);

export default reviewsSlice;