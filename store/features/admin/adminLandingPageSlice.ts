// store/features/admin/AdminLandingPageSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';
import { AdminBanner } from './adminBannersSlice';

// Types
export interface AdminLandingPageRow {
    id: number; // mapped from row_id
    row_id: number;
    category_id: number;
    banner_type_id: number;
    sort_order: number;
    banner_limit: number;
    status: number;
    background_color: string | null;
    spacing_top: number;
    spacing_bottom: number;
    spacing_between: number;
    date_added?: string;
    date_modified?: string;
    
    // joined fields
    banner_type_code?: string;
    banner_type_name?: string;
    banner_width?: number;
    banner_height?: number;
    title_en?: string;
    subtitle_en?: string;
    title_ar?: string;
    subtitle_ar?: string;
    
    active_banner_count?: number;
    banners?: AdminBanner[];
}

export interface AdminLandingPageParams {
    status?: number;
    category_id?: number;
}

export interface CreateLandingPageRowPayload {
    banner_type_id: number;
    category_id?: number;
    sort_order?: number;
    banner_limit?: number;
    status?: boolean | number;
    background_color?: string | null;
    spacing_top?: number;
    spacing_bottom?: number;
    spacing_between?: number;
    title_en: string;
    title_ar?: string;
    subtitle_en?: string;
    subtitle_ar?: string;
}

export interface UpdateLandingPageRowPayload {
    id: number;
    data: Partial<CreateLandingPageRowPayload>;
}

export interface ReorderLandingPageRowsPayload {
    rows: {
        row_id: number;
        sort_order: number;
    }[];
}

export interface PreviewLandingPageParams {
    language_id?: number;
    category_id?: number;
}

export interface AdminLandingPageState extends EntityState<AdminLandingPageRow, number> {
    loading: boolean;
    error: string | null;
}

// Entity Adapter
const adminLandingPageAdapter = createEntityAdapter<AdminLandingPageRow, number>({
    selectId: (row) => row.id,
    sortComparer: (a, b) => a.sort_order - b.sort_order,
});

const initialState: AdminLandingPageState = adminLandingPageAdapter.getInitialState({
    loading: false,
    error: null,
});

// API Slice
export const adminLandingPageSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all landing page rows
        getAdminLandingPageRows: builder.query<AdminLandingPageState, AdminLandingPageParams | void>({
            query: (params) => ({
                url: '/admin/landing-page/rows',
                params: params || undefined,
            }),
            transformResponse: (response: any): AdminLandingPageState => {
                const rows = response.data || [];
                const mappedRows = rows.map((r: any) => ({
                    ...r,
                    id: r.row_id,
                }));
                return adminLandingPageAdapter.setAll(initialState, mappedRows);
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminLandingPageRow' as const, id })),
                        { type: 'AdminLandingPageRow' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminLandingPageRow' as const, id: 'LIST' }],
        }),

        // Get single landing page row
        getAdminLandingPageRow: builder.query<AdminLandingPageRow, number>({
            query: (id) => `/admin/landing-page/rows/${id}`,
            transformResponse: (response: any) => ({
                ...response.data,
                id: response.data.row_id,
            }),
            providesTags: (result, error, id) => [{ type: 'AdminLandingPageRow' as const, id }],
        }),

        // Create landing page row
        createAdminLandingPageRow: builder.mutation<AdminLandingPageRow, CreateLandingPageRowPayload>({
            query: (data) => ({
                url: '/admin/landing-page/rows',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => ({
                ...response.data,
                id: response.data.row_id,
            }),
            invalidatesTags: [
                { type: 'AdminLandingPageRow' as const, id: 'LIST' },
                { type: 'AdminLandingPageRow' as const, id: 'PREVIEW' },
            ],
        }),

        // Update landing page row
        updateAdminLandingPageRow: builder.mutation<AdminLandingPageRow, UpdateLandingPageRowPayload>({
            query: ({ id, data }) => ({
                url: `/admin/landing-page/rows/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => ({
                ...response.data,
                id: response.data.row_id,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminLandingPageRow' as const, id },
                { type: 'AdminLandingPageRow' as const, id: 'LIST' },
                { type: 'AdminLandingPageRow' as const, id: 'PREVIEW' },
            ],
        }),

        // Delete landing page row
        deleteAdminLandingPageRow: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/admin/landing-page/rows/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminLandingPageRow' as const, id },
                { type: 'AdminLandingPageRow' as const, id: 'LIST' },
                { type: 'AdminLandingPageRow' as const, id: 'PREVIEW' },
            ],
        }),

        // Reorder landing page rows
        reorderAdminLandingPageRows: builder.mutation<{ success: boolean; message: string }, ReorderLandingPageRowsPayload>({
            query: (data) => ({
                url: '/admin/landing-page/rows/reorder',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: [
                { type: 'AdminLandingPageRow' as const, id: 'LIST' },
                { type: 'AdminLandingPageRow' as const, id: 'PREVIEW' },
            ],
        }),

        // Preview full landing page layout
        previewAdminLandingPage: builder.query<any, PreviewLandingPageParams | void>({
            query: (params) => ({
                url: '/admin/landing-page/preview',
                params: params || undefined,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminLandingPageRow' as const, id: 'PREVIEW' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminLandingPageRowsQuery,
    useLazyGetAdminLandingPageRowsQuery,
    useGetAdminLandingPageRowQuery,
    useCreateAdminLandingPageRowMutation,
    useUpdateAdminLandingPageRowMutation,
    useDeleteAdminLandingPageRowMutation,
    useReorderAdminLandingPageRowsMutation,
    usePreviewAdminLandingPageQuery,
    useLazyPreviewAdminLandingPageQuery,
} = adminLandingPageSlice;

// Selectors
export const {
    selectAll: selectAllAdminLandingPageRows,
    selectById: selectAdminLandingPageRowById,
    selectIds: selectAdminLandingPageRowIds,
} = adminLandingPageAdapter.getSelectors<RootState>(
    (state) =>
        adminLandingPageSlice.endpoints.getAdminLandingPageRows.select()(state).data || initialState
);

export default adminLandingPageSlice;
