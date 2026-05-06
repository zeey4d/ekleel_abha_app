// src/features/reviews/reviewsSlice.ts
import {
  createSelector,
  createEntityAdapter,
  EntityState
} from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
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
  customer?: {
    id: number;
    name: string;
  };
  product_id?: number;
  product_name?: string;
  status?: 'approved' | 'pending' | 'rejected' | 'failed' | 'complete';
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
}

export interface ProductInfo {
  id: number;
  name: string;
  average_rating: number;
  total_reviews: number;
}

export interface ProductReviewResponse {
  product: ProductInfo;
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
  data: Review[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ReviewSubmitData {
  product_id: number;
  rating: number;
  text: string;
}

export interface ReviewUpdateData extends Partial<Omit<ReviewSubmitData, 'product_id'>> {
  id: ReviewId;
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
  product?: ProductInfo;
  rating_distribution?: {
    [key: number]: number;
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

        return `/reviews/product/${productId}?${params.toString()}`;
      },
      transformResponse: (response: ProductReviewResponse): ReviewsState => {
        const state = reviewsAdapter.setAll(initialReviewsState, response.reviews.data);
        return {
          ...state,
          meta: response.reviews.meta,
          product: response.product,
          rating_distribution: response.rating_distribution,
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
        const state = reviewsAdapter.setAll(initialReviewsState, response.data);
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
    submitReview: builder.mutation<{ message: string; data: Review }, ReviewSubmitData>({
      query: (reviewData) => ({
        url: `/reviews`,
        method: 'POST',
        body: reviewData,
      }),
      async onQueryStarted(reviewData, { dispatch, queryFulfilled }) {
        const tempId = `temp_${Date.now()}`;
        // Optimistic update for product reviews
        const patchResultProduct = dispatch(
          reviewsSlice.util.updateQueryData(
            'getProductReviews',
            { productId: reviewData.product_id },
            (draft) => {
              const tempReview = {
                id: tempId,
                author: 'You',
                date_added: new Date().toISOString(),
                ...reviewData,
                status: 'pending' as const,
              };
              reviewsAdapter.addOne(draft, tempReview as Review);
            }
          )
        );

        try {
          await queryFulfilled;
        } catch (error: any) {
          // On failure, update status to failed instead of undoing
          dispatch(
            reviewsSlice.util.updateQueryData(
              'getProductReviews',
              { productId: reviewData.product_id },
              (draft) => {
                const review = draft.entities[tempId];
                if (review) {
                  review.status = 'failed';
                }
              }
            )
          );

          const serverError = error?.error?.data?.message || error?.error?.data?.error || '';
          if (serverError) {
            console.warn('Review submission rejected:', serverError);
          }
        }
      },
      invalidatesTags: (result, error, { product_id }) => [
        { type: 'Review' as const, id: `PRODUCT_${product_id}` },
        { type: 'Review' as const, id: 'USER' },
      ],
    }),

    // --- Update Review ---
    updateReview: builder.mutation<{ message: string; data: Review }, ReviewUpdateData>({
      query: ({ id, ...reviewData }) => ({
        url: `/reviews/${id}`,
        method: 'PUT',
        body: reviewData,
      }),
      async onQueryStarted({ id, ...reviewData }, { dispatch, queryFulfilled }) {
        const timestamp = new Date().toISOString();

        // We don't have the productId here easily to update getProductReviews optimistically
        // efficiently without storing productId on the review object and looking it up.
        // For simplicity, we'll rely on cache invalidation or update what we can.

        // Optimistic update for user reviews
        const patchResultUser = dispatch(
          reviewsSlice.util.updateQueryData('getUserReviews', undefined, (draft) => {
            const existingReview = draft.entities[id];
            if (existingReview) {
              reviewsAdapter.updateOne(draft, {
                id,
                changes: {
                  ...reviewData,
                  date_modified: timestamp,
                  status: 'pending', // Updates reset status to pending
                },
              });
            }
          })
        );

        try {
          await queryFulfilled;
        } catch (error) {
          patchResultUser.undo();
          console.error('Failed to update review:', error);
        }
      },
      // Invalidate tags to force refetch. We iterate over all caching matching this.
      // Since we don't know the productId, we might need to be broader or rely on list invalidation.
      // But actually, if we had the Review object, we'd know the productId.
      // For now, invalidating 'USER' and 'LIST' is often enough, but specific product cache might be stale.
      // Ideally we should pass productId or return it.
      invalidatesTags: ['Review'],
    }),

    // --- Delete Review ---
    deleteReview: builder.mutation<{ message: string }, { id: ReviewId }>({
      query: ({ id }) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const patchResultUser = dispatch(
          reviewsSlice.util.updateQueryData('getUserReviews', undefined, (draft) => {
            reviewsAdapter.removeOne(draft, id);
          })
        );

        try {
          await queryFulfilled;
        } catch (error) {
          patchResultUser.undo();
          console.error('Failed to delete review:', error);
        }
      },
      invalidatesTags: ['Review'],
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
  createSelector(
    [reviewsSlice.endpoints.getProductReviews.select({ productId })],
    (result) => result.data?.product?.average_rating ?? 0
  );

// Review count for a product
export const selectProductReviewCount = (productId: number) =>
  createSelector(
    [reviewsSlice.endpoints.getProductReviews.select({ productId })],
    (result) => result.data?.product?.total_reviews ?? 0
  );

// Rating distribution for a product
export const selectProductRatingDistribution = (productId: number) =>
  createSelector(
    [reviewsSlice.endpoints.getProductReviews.select({ productId })],
    (result) => result.data?.rating_distribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  );

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