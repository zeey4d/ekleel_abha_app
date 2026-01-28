// store/features/admin/adminReviewsSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminReview {
    review_id: number;
    product_id: number;
    product_name?: string;
    customer_id: number;
    author: string;
    text: string;
    rating: number;
    status: number;
    date_added: string;
    date_modified: string;
}

export interface AdminReviewsParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: number;
    product_id?: number;
    customer_id?: number;
    rating?: number;
}

export interface CreateReviewPayload {
    product_id: number;
    customer_id: number;
    author: string;
    text: string;
    rating: number;
    status: number;
}

export interface UpdateReviewPayload {
    id: number;
    data: Partial<CreateReviewPayload>;
}

export interface BulkUpdateStatusPayload {
    ids: number[];
    status: number;
}

export interface AdminReviewsState extends EntityState<AdminReview, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

// Entity Adapter
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

// API Slice
export const adminReviewsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all reviews (admin)
        getAdminReviews: builder.query<AdminReviewsState, AdminReviewsParams>({
            query: (params) => ({
                url: '/admin/reviews',
                params,
            }),
            transformResponse: (response: any): AdminReviewsState => {
                const state = adminReviewsAdapter.setAll(initialState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
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

        // Get single review (admin)
        getAdminReview: builder.query<AdminReview, number>({
            query: (id) => `/admin/reviews/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminReview' as const, id }],
        }),

        // Create review
        createAdminReview: builder.mutation<AdminReview, CreateReviewPayload>({
            query: (data) => ({
                url: '/admin/reviews',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminReview' as const, id: 'LIST' }],
        }),

        // Update review
        updateAdminReview: builder.mutation<AdminReview, UpdateReviewPayload>({
            query: ({ id, data }) => ({
                url: `/admin/reviews/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminReview' as const, id },
                { type: 'AdminReview' as const, id: 'LIST' },
            ],
        }),

        // Delete review
        deleteAdminReview: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/reviews/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminReview' as const, id },
                { type: 'AdminReview' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete reviews
        bulkDeleteAdminReviews: builder.mutation<{ message: string }, number[]>({
            query: (ids) => ({
                url: '/admin/reviews/bulk-delete',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: [{ type: 'AdminReview' as const, id: 'LIST' }],
        }),

        // Bulk update review status
        bulkUpdateAdminReviewsStatus: builder.mutation<{ message: string }, BulkUpdateStatusPayload>({
            query: (data) => ({
                url: '/admin/reviews/bulk-update-status',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminReview' as const, id: 'LIST' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminReviewsQuery,
    useGetAdminReviewQuery,
    useCreateAdminReviewMutation,
    useUpdateAdminReviewMutation,
    useDeleteAdminReviewMutation,
    useBulkDeleteAdminReviewsMutation,
    useBulkUpdateAdminReviewsStatusMutation,
} = adminReviewsSlice;

// Selectors
export const {
    selectAll: selectAllAdminReviews,
    selectById: selectAdminReviewById,
    selectIds: selectAdminReviewIds,
} = adminReviewsAdapter.getSelectors<RootState>(
    (state) =>
        adminReviewsSlice.endpoints.getAdminReviews.select({})(state).data || initialState
);

export default adminReviewsSlice;
