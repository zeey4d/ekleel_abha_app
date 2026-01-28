// store/features/admin/adminPagesSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminPage {
    information_id: number;
    sort_order: number;
    status: number;
    bottom: number;
    descriptions?: AdminPageDescription[];
}

export interface AdminPageDescription {
    information_id: number;
    language_id: number;
    title: string;
    description: string;
    meta_title?: string;
    meta_description?: string;
    meta_keyword?: string;
}

export interface AdminPagesParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: number;
}

export interface CreatePagePayload {
    sort_order: number;
    status: number;
    bottom: number;
    descriptions: Array<{
        language_id: number;
        title: string;
        description: string;
        meta_title?: string;
        meta_description?: string;
        meta_keyword?: string;
    }>;
}

export interface UpdatePagePayload {
    id: number;
    data: Partial<CreatePagePayload>;
}

export interface BulkUpdateStatusPayload {
    ids: number[];
    status: number;
}

export interface AdminPagesState extends EntityState<AdminPage, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

// Entity Adapter
const adminPagesAdapter = createEntityAdapter<AdminPage, number>({
    selectId: (page) => page.information_id,
});

const initialState: AdminPagesState = adminPagesAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminPagesSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all pages (admin)
        getAdminPages: builder.query<AdminPagesState, AdminPagesParams>({
            query: (params) => ({
                url: '/admin/information',
                params,
            }),
            transformResponse: (response: any): AdminPagesState => {
                const state = adminPagesAdapter.setAll(initialState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminPage' as const, id })),
                        { type: 'AdminPage' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminPage' as const, id: 'LIST' }],
        }),

        // Get single page (admin)
        getAdminPage: builder.query<AdminPage, number>({
            query: (id) => `/admin/information/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminPage' as const, id }],
        }),

        // Create page
        createAdminPage: builder.mutation<AdminPage, CreatePagePayload>({
            query: (data) => ({
                url: '/admin/information',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminPage' as const, id: 'LIST' }],
        }),

        // Update page
        updateAdminPage: builder.mutation<AdminPage, UpdatePagePayload>({
            query: ({ id, data }) => ({
                url: `/admin/information/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminPage' as const, id },
                { type: 'AdminPage' as const, id: 'LIST' },
            ],
        }),

        // Delete page
        deleteAdminPage: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/information/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminPage' as const, id },
                { type: 'AdminPage' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete pages
        bulkDeleteAdminPages: builder.mutation<{ message: string }, number[]>({
            query: (ids) => ({
                url: '/admin/information/bulk-destroy',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: [{ type: 'AdminPage' as const, id: 'LIST' }],
        }),

        // Bulk update page status
        bulkUpdateAdminPagesStatus: builder.mutation<{ message: string }, BulkUpdateStatusPayload>({
            query: (data) => ({
                url: '/admin/information/bulk-update-status',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminPage' as const, id: 'LIST' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminPagesQuery,
    useGetAdminPageQuery,
    useCreateAdminPageMutation,
    useUpdateAdminPageMutation,
    useDeleteAdminPageMutation,
    useBulkDeleteAdminPagesMutation,
    useBulkUpdateAdminPagesStatusMutation,
} = adminPagesSlice;

// Selectors
export const {
    selectAll: selectAllAdminPages,
    selectById: selectAdminPageById,
    selectIds: selectAdminPageIds,
} = adminPagesAdapter.getSelectors<RootState>(
    (state) =>
        adminPagesSlice.endpoints.getAdminPages.select({})(state).data || initialState
);

export default adminPagesSlice;
