// store/features/admin/adminFaqsSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminFaq {
    faq_id: number;
    sort_order: number;
    status: number;
    faq_category_id?: number;
    category_name?: string;
    descriptions?: AdminFaqDescription[];
}

export interface AdminFaqDescription {
    faq_id: number;
    language_id: number;
    question: string;
    answer: string;
}

export interface AdminFaqsParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: number;
    faq_category_id?: number;
}

export interface CreateFaqPayload {
    sort_order: number;
    status: number;
    faq_category_id?: number;
    descriptions: Array<{
        language_id: number;
        question: string;
        answer: string;
    }>;
}

export interface UpdateFaqPayload {
    id: number;
    data: Partial<CreateFaqPayload>;
}

export interface BulkUpdateStatusPayload {
    ids: number[];
    status: number;
}

export interface AdminFaqsState extends EntityState<AdminFaq, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

// Entity Adapter
const adminFaqsAdapter = createEntityAdapter<AdminFaq, number>({
    selectId: (faq) => faq.faq_id,
});

const initialState: AdminFaqsState = adminFaqsAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminFaqsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all FAQs (admin)
        getAdminFaqs: builder.query<AdminFaqsState, AdminFaqsParams>({
            query: (params) => ({
                url: '/admin/faqs',
                params,
            }),
            transformResponse: (response: any): AdminFaqsState => {
                const state = adminFaqsAdapter.setAll(initialState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminFaq' as const, id })),
                        { type: 'AdminFaq' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminFaq' as const, id: 'LIST' }],
        }),

        // Get single FAQ (admin)
        getAdminFaq: builder.query<AdminFaq, number>({
            query: (id) => `/admin/faqs/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminFaq' as const, id }],
        }),

        // Create FAQ
        createAdminFaq: builder.mutation<AdminFaq, CreateFaqPayload>({
            query: (data) => ({
                url: '/admin/faqs',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminFaq' as const, id: 'LIST' }],
        }),

        // Update FAQ
        updateAdminFaq: builder.mutation<AdminFaq, UpdateFaqPayload>({
            query: ({ id, data }) => ({
                url: `/admin/faqs/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminFaq' as const, id },
                { type: 'AdminFaq' as const, id: 'LIST' },
            ],
        }),

        // Delete FAQ
        deleteAdminFaq: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/faqs/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminFaq' as const, id },
                { type: 'AdminFaq' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete FAQs
        bulkDeleteAdminFaqs: builder.mutation<{ message: string }, number[]>({
            query: (ids) => ({
                url: '/admin/faqs/bulk-destroy',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: [{ type: 'AdminFaq' as const, id: 'LIST' }],
        }),

        // Bulk update FAQ status
        bulkUpdateAdminFaqsStatus: builder.mutation<{ message: string }, BulkUpdateStatusPayload>({
            query: (data) => ({
                url: '/admin/faqs/bulk-update-status',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminFaq' as const, id: 'LIST' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminFaqsQuery,
    useGetAdminFaqQuery,
    useCreateAdminFaqMutation,
    useUpdateAdminFaqMutation,
    useDeleteAdminFaqMutation,
    useBulkDeleteAdminFaqsMutation,
    useBulkUpdateAdminFaqsStatusMutation,
} = adminFaqsSlice;

// Selectors
export const {
    selectAll: selectAllAdminFaqs,
    selectById: selectAdminFaqById,
    selectIds: selectAdminFaqIds,
} = adminFaqsAdapter.getSelectors<RootState>(
    (state) =>
        adminFaqsSlice.endpoints.getAdminFaqs.select({})(state).data || initialState
);

export default adminFaqsSlice;
