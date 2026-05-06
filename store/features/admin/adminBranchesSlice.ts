// store/features/admin/adminBranchesSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminBranch {
    location_id: number;
    name: string;
    address: string;
    telephone: string;
    fax: string | null;
    geocode: string | null;
    image: string | null;
    image_url: string | null;
    open: string | null;
    comment: string | null;
}

export interface AdminBranchesParams {
    page?: number;
    per_page?: number;
    search?: string;
}

export interface CreateAdminBranchPayload {
    name: string;
    address: string;
    telephone: string;
    fax?: string;
    geocode?: string;
    image?: string;
    open?: string;
    comment?: string;
}

export interface UpdateAdminBranchPayload extends Partial<CreateAdminBranchPayload> {
    location_id: number;
}

export interface AdminBranchesState extends EntityState<AdminBranch, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

// Entity Adapter
const adminBranchesAdapter = createEntityAdapter<AdminBranch, number>({
    selectId: (branch) => branch.location_id,
    sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const initialState: AdminBranchesState = adminBranchesAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminBranchesSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all branches
        getAdminBranches: builder.query<AdminBranchesState, AdminBranchesParams>({
            query: (params) => ({
                url: '/admin/branches',
                params,
            }),
            transformResponse: (response: any): AdminBranchesState => {
                const state = adminBranchesAdapter.setAll(initialState, response.data.data);
                return {
                    ...state,
                    pagination: response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminBranch' as const, id })),
                        { type: 'AdminBranch' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminBranch' as const, id: 'LIST' }],
        }),

        // Get single branch
        getAdminBranch: builder.query<AdminBranch, number>({
            query: (id) => `/admin/branches/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminBranch' as const, id }],
        }),

        // Create branch
        createAdminBranch: builder.mutation<AdminBranch, CreateAdminBranchPayload>({
            query: (data) => ({
                url: '/admin/branches',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminBranch' as const, id: 'LIST' }],
        }),

        // Update branch
        updateAdminBranch: builder.mutation<AdminBranch, UpdateAdminBranchPayload>({
            query: ({ location_id, ...data }) => ({
                url: `/admin/branches/${location_id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { location_id }) => [
                { type: 'AdminBranch' as const, id: location_id },
                { type: 'AdminBranch' as const, id: 'LIST' },
            ],
        }),

        // Delete branch
        deleteAdminBranch: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/branches/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminBranch' as const, id },
                { type: 'AdminBranch' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete branches
        bulkDeleteAdminBranches: builder.mutation<{ message: string }, number[]>({
            query: (ids) => ({
                // Often mapped as bulk-destroy or bulk-delete in Laravel routing
                url: '/admin/branches/bulk-destroy',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: [{ type: 'AdminBranch' as const, id: 'LIST' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminBranchesQuery,
    useLazyGetAdminBranchesQuery,
    useGetAdminBranchQuery,
    useCreateAdminBranchMutation,
    useUpdateAdminBranchMutation,
    useDeleteAdminBranchMutation,
    useBulkDeleteAdminBranchesMutation,
} = adminBranchesSlice;

// Selectors
export const {
    selectAll: selectAllAdminBranches,
    selectById: selectAdminBranchById,
    selectIds: selectAdminBranchIds,
} = adminBranchesAdapter.getSelectors<RootState>(
    (state) =>
        adminBranchesSlice.endpoints.getAdminBranches.select({})(state).data || initialState
);

export default adminBranchesSlice;
