import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminTag {
    tag_id: number;
    name_en: string;
    name_ar?: string;
    sort_order?: number;
    products_count?: number;
}

export interface AdminTagsParams {
    page?: number;
    per_page?: number;
    search?: string;
}

export interface CreateTagPayload {
    name_en: string;
    name_ar?: string;
    sort_order?: number;
}

export interface UpdateTagPayload {
    id: number;
    data: {
        name_en?: string;
        name_ar?: string;
        sort_order?: number;
    };
}

export interface BulkDeletePayload {
    ids: number[];
}

export interface AdminTagsState extends EntityState<AdminTag, number> {
    loading: boolean;
    error: string | null;
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

// Entity Adapter
const adminTagsAdapter = createEntityAdapter<AdminTag, number>({
    selectId: (tag) => tag.tag_id,
    sortComparer: (a, b) => b.tag_id - a.tag_id, // Sort by tag_id desc to match the controller
});

const initialState: AdminTagsState = adminTagsAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminTagSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all tags
        getAdminTags: builder.query<AdminTagsState, AdminTagsParams>({
            query: (params) => ({
                url: '/admin/tags',
                params,
            }),
            transformResponse: (response: any): AdminTagsState => {
                const paginatedData = response.data;
                const tags = paginatedData.data || [];
                const state = adminTagsAdapter.setAll(initialState, tags);
                return {
                    ...state,
                    pagination: {
                        current_page: paginatedData.current_page,
                        last_page: paginatedData.last_page,
                        per_page: paginatedData.per_page,
                        total: paginatedData.total,
                        from: paginatedData.from,
                        to: paginatedData.to,
                    },
                };
            },
            providesTags: (result) =>
                result
                    ? [
                          ...result.ids.map((id) => ({ type: 'AdminTag' as const, id })),
                          { type: 'AdminTag' as const, id: 'LIST' },
                      ]
                    : [{ type: 'AdminTag' as const, id: 'LIST' }],
        }),

        // Get single tag
        getAdminTag: builder.query<AdminTag, number>({
            query: (id) => `/admin/tags/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminTag' as const, id }],
        }),

        // Create tag
        createAdminTag: builder.mutation<AdminTag, CreateTagPayload>({
            query: (data) => ({
                url: '/admin/tags',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminTag' as const, id: 'LIST' }],
        }),

        // Update tag
        updateAdminTag: builder.mutation<AdminTag, UpdateTagPayload>({
            query: ({ id, data }) => ({
                url: `/admin/tags/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminTag' as const, id },
                { type: 'AdminTag' as const, id: 'LIST' },
            ],
        }),

        // Delete tag
        deleteAdminTag: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/admin/tags/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminTag' as const, id },
                { type: 'AdminTag' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete tags
        bulkDeleteAdminTags: builder.mutation<{ success: boolean; message: string }, BulkDeletePayload>({
            query: (data) => ({
                url: '/admin/tags/bulk-delete',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminTag' as const, id: 'LIST' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminTagsQuery,
    useLazyGetAdminTagsQuery,
    useGetAdminTagQuery,
    useCreateAdminTagMutation,
    useUpdateAdminTagMutation,
    useDeleteAdminTagMutation,
    useBulkDeleteAdminTagsMutation,
} = adminTagSlice;

// Selectors
export const {
    selectAll: selectAllAdminTags,
    selectById: selectAdminTagById,
    selectIds: selectAdminTagIds,
} = adminTagsAdapter.getSelectors<RootState>(
    (state) => adminTagSlice.endpoints.getAdminTags.select({})(state).data || initialState
);

export default adminTagSlice;
