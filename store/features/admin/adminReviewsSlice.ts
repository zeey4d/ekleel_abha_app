// store/features/admin/adminReviewsSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// --- Type Definitions ---

export interface AdminReview {
    review_id: number;
    product_id: number;
    customer_id: number;
    author: string;
    text: string;
    rating: number;
    status: number; // 0 = pending, 1 = approved
    date_added: string;
    date_modified: string;
    product_name?: string;
    customer_firstname?: string;
    customer_lastname?: string;
    customer_email?: string;
    customer_telephone?: string;
}

export interface AdminReviewProductStats {
    total_reviews: number;
    average_rating: number;
    approved_count: number;
    pending_count: number;
}

export interface AdminReviewDetail {
    review: AdminReview;
    product_stats: AdminReviewProductStats;
}

export interface AdminReviewsParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: number | string;
    product_id?: number;
    customer_id?: number;
    rating?: number;
    sort_by?: 'date_added' | 'rating' | 'author';
    sort_order?: 'asc' | 'desc';
}

export interface UpdateReviewPayload {
    id: number;
    data: {
        status?: number;
        rating?: number;
        text?: string;
        author?: string;
    };
}

export interface BulkUpdateStatusPayload {
    ids: number[];
    status: number;
}

export interface ReviewStatistics {
    overall: {
        total_reviews: number;
        average_rating: number;
        approved: number;
        pending: number;
    };
    rating_distribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
    last_30_days: {
        total: number;
        average_rating: number;
        approved: number;
        pending: number;
    };
    top_reviewed_products: Array<{
        product_id: number;
        product_name: string;
        review_count: number;
        average_rating: number;
    }>;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface AdminReviewsState extends EntityState<AdminReview, number> {
    loading: boolean;
    error: string | null;
    pagination?: PaginationMeta;
}

// --- Entity Adapter ---

const adminReviewsAdapter = createEntityAdapter<AdminReview, number>({
    selectId: (review) => review.review_id,
    sortComparer: (a, b) =>
        new Date(b.date_added).getTime() - new Date(a.date_added).getTime(),
});

const initialState: AdminReviewsState = adminReviewsAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// --- RTK Query API Slice ---

export const adminReviewsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all reviews (admin) with filtering, search, pagination
        getAdminReviews: builder.query<AdminReviewsState, AdminReviewsParams>({
            query: (params) => ({
                url: '/admin/reviews',
                params,
            }),
            transformResponse: (response: { success: boolean; data: any }): AdminReviewsState => {
                // Laravel paginator puts items in response.data.data
                const paginator = response.data;
                const reviews: AdminReview[] = paginator.data ?? [];
                const state = adminReviewsAdapter.setAll(initialState, reviews);
                return {
                    ...state,
                    pagination: {
                        current_page: paginator.current_page,
                        last_page: paginator.last_page,
                        per_page: paginator.per_page,
                        total: paginator.total,
                        from: paginator.from,
                        to: paginator.to,
                    },
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminReview' as const, id })),
                        { type: 'AdminReview' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminReview' as const, id: 'LIST' }],
        }),

        // Get single review with product stats (admin)
        getAdminReview: builder.query<AdminReviewDetail, number>({
            query: (id) => `/admin/reviews/${id}`,
            transformResponse: (response: { success: boolean; data: AdminReviewDetail }) =>
                response.data,
            providesTags: (result, error, id) => [{ type: 'AdminReview' as const, id }],
        }),

        // Get review statistics for admin dashboard
        getAdminReviewStatistics: builder.query<ReviewStatistics, void>({
            query: () => '/admin/reviews/statistics',
            transformResponse: (response: { success: boolean; data: ReviewStatistics }) =>
                response.data,
            providesTags: [{ type: 'AdminReview' as const, id: 'STATS' }],
            keepUnusedDataFor: 300,
        }),

        // Update review (admin can update status, rating, text, author)
        updateAdminReview: builder.mutation<AdminReview, UpdateReviewPayload>({
            query: ({ id, data }) => ({
                url: `/admin/reviews/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: { success: boolean; message: string; data: AdminReview }) =>
                response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminReview' as const, id },
                { type: 'AdminReview' as const, id: 'LIST' },
                { type: 'AdminReview' as const, id: 'STATS' },
            ],
        }),

        // Delete single review (admin)
        deleteAdminReview: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/admin/reviews/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminReview' as const, id },
                { type: 'AdminReview' as const, id: 'LIST' },
                { type: 'AdminReview' as const, id: 'STATS' },
            ],
        }),

        // Bulk delete reviews (admin)
        bulkDeleteAdminReviews: builder.mutation<
            { success: boolean; message: string; deleted: number },
            number[]
        >({
            query: (ids) => ({
                url: '/admin/reviews/bulk-delete',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: [
                { type: 'AdminReview' as const, id: 'LIST' },
                { type: 'AdminReview' as const, id: 'STATS' },
            ],
        }),

        // Bulk update review status (approve / unapprove)
        bulkUpdateAdminReviewsStatus: builder.mutation<
            { success: boolean; message: string; updated: number },
            BulkUpdateStatusPayload
        >({
            query: (data) => ({
                url: '/admin/reviews/bulk-update-status',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [
                { type: 'AdminReview' as const, id: 'LIST' },
                { type: 'AdminReview' as const, id: 'STATS' },
            ],
        }),
    }),
});

// --- Export Hooks ---
export const {
    useGetAdminReviewsQuery,
    useGetAdminReviewQuery,
    useGetAdminReviewStatisticsQuery,
    useUpdateAdminReviewMutation,
    useDeleteAdminReviewMutation,
    useBulkDeleteAdminReviewsMutation,
    useBulkUpdateAdminReviewsStatusMutation,
} = adminReviewsSlice;

// --- Selectors ---
export const {
    selectAll: selectAllAdminReviews,
    selectById: selectAdminReviewById,
    selectIds: selectAdminReviewIds,
} = adminReviewsAdapter.getSelectors<RootState>(
    (state) =>
        adminReviewsSlice.endpoints.getAdminReviews.select({})(state).data || initialState
);

export default adminReviewsSlice;
