// store/features/admin/adminLanguagesSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminLanguage {
    language_id: number;
    name: string;
    code: string;
    locale?: string;
    image?: string;
    directory?: string;
    sort_order: number;
    status: number;
}

export interface AdminLanguagesParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: number;
}

export interface CreateLanguagePayload {
    name: string;
    code: string;
    locale?: string;
    image?: string;
    directory?: string;
    sort_order?: number;
    status: number;
}

export interface UpdateLanguagePayload {
    id: number;
    data: Partial<CreateLanguagePayload>;
}

export interface BulkUpdateStatusPayload {
    ids: number[];
    status: number;
}

export interface AdminLanguagesState extends EntityState<AdminLanguage, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

// Entity Adapter
const adminLanguagesAdapter = createEntityAdapter<AdminLanguage, number>({
    selectId: (language) => language.language_id,
    sortComparer: (a, b) => a.sort_order - b.sort_order,
});

const initialState: AdminLanguagesState = adminLanguagesAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminLanguagesSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all languages (admin)
        getAdminLanguages: builder.query<AdminLanguagesState, AdminLanguagesParams>({
            query: (params) => ({
                url: '/admin/languages',
                params,
            }),
            transformResponse: (response: any): AdminLanguagesState => {
                const state = adminLanguagesAdapter.setAll(initialState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminLanguage' as const, id })),
                        { type: 'AdminLanguage' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminLanguage' as const, id: 'LIST' }],
        }),

        // Get single language (admin)
        getAdminLanguage: builder.query<AdminLanguage, number>({
            query: (id) => `/admin/languages/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminLanguage' as const, id }],
        }),

        // Create language
        createAdminLanguage: builder.mutation<AdminLanguage, CreateLanguagePayload>({
            query: (data) => ({
                url: '/admin/languages',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminLanguage' as const, id: 'LIST' }],
        }),

        // Update language
        updateAdminLanguage: builder.mutation<AdminLanguage, UpdateLanguagePayload>({
            query: ({ id, data }) => ({
                url: `/admin/languages/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminLanguage' as const, id },
                { type: 'AdminLanguage' as const, id: 'LIST' },
            ],
        }),

        // Delete language
        deleteAdminLanguage: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/languages/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminLanguage' as const, id },
                { type: 'AdminLanguage' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete languages
        bulkDeleteAdminLanguages: builder.mutation<{ message: string }, number[]>({
            query: (ids) => ({
                url: '/admin/languages/bulk-delete',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: [{ type: 'AdminLanguage' as const, id: 'LIST' }],
        }),

        // Bulk update language status
        bulkUpdateAdminLanguagesStatus: builder.mutation<{ message: string }, BulkUpdateStatusPayload>({
            query: (data) => ({
                url: '/admin/languages/bulk-update-status',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminLanguage' as const, id: 'LIST' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminLanguagesQuery,
    useGetAdminLanguageQuery,
    useCreateAdminLanguageMutation,
    useUpdateAdminLanguageMutation,
    useDeleteAdminLanguageMutation,
    useBulkDeleteAdminLanguagesMutation,
    useBulkUpdateAdminLanguagesStatusMutation,
} = adminLanguagesSlice;

// Selectors
export const {
    selectAll: selectAllAdminLanguages,
    selectById: selectAdminLanguageById,
    selectIds: selectAdminLanguageIds,
} = adminLanguagesAdapter.getSelectors<RootState>(
    (state) =>
        adminLanguagesSlice.endpoints.getAdminLanguages.select({})(state).data || initialState
);

export default adminLanguagesSlice;
