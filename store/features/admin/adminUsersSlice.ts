import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminUser {
    user_id: number;
    username: string;
    email: string;
    firstname: string;
    lastname: string;
    role_id: number;
    role_name?: string;
    status: number;
    image?: string;
    date_added: string;
}

export interface AdminRole {
    role_id: number;
    name: string;
    permissions: string[]; // Or a more complex structure if needed
    description?: string;
}

export interface AdminUsersParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: number;
    role_id?: number;
}

export interface CreateUserPayload {
    username: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    role_id: number;
    status: number;
    image?: string;
}

export interface UpdateUserPayload {
    id: number;
    data: Partial<Omit<CreateUserPayload, 'password'>> & { password?: string };
}

export interface BulkUpdateStatusPayload {
    ids: number[];
    status: number;
}

export interface AdminUsersState extends EntityState<AdminUser, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

// Entity Adapter
const adminUsersAdapter = createEntityAdapter<AdminUser, number>({
    selectId: (user) => user.user_id,
    sortComparer: (a, b) =>
        new Date(b.date_added).getTime() - new Date(a.date_added).getTime(),
});

const initialState: AdminUsersState = adminUsersAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminUsersSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all users (admin)
        getAdminUsers: builder.query<AdminUsersState, AdminUsersParams>({
            query: (params) => ({
                url: '/admin/users',
                params,
            }),
            transformResponse: (response: any): AdminUsersState => {
                const state = adminUsersAdapter.setAll(initialState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminUser' as const, id })),
                        { type: 'AdminUser' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminUser' as const, id: 'LIST' }],
        }),

        // Get single user (admin)
        getAdminUser: builder.query<AdminUser, number>({
            query: (id) => `/admin/users/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminUser' as const, id }],
        }),

        // Create user
        createAdminUser: builder.mutation<AdminUser, CreateUserPayload>({
            query: (data) => ({
                url: '/admin/users',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminUser' as const, id: 'LIST' }],
        }),

        // Update user
        updateAdminUser: builder.mutation<AdminUser, UpdateUserPayload>({
            query: ({ id, data }) => ({
                url: `/admin/users/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminUser' as const, id },
                { type: 'AdminUser' as const, id: 'LIST' },
            ],
        }),

        // Delete user
        deleteAdminUser: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminUser' as const, id },
                { type: 'AdminUser' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete users
        bulkDeleteAdminUsers: builder.mutation<{ message: string }, number[]>({
            query: (ids) => ({
                url: '/admin/users/bulk-delete',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: [{ type: 'AdminUser' as const, id: 'LIST' }],
        }),

        // Bulk update user status
        bulkUpdateAdminUsersStatus: builder.mutation<{ message: string }, BulkUpdateStatusPayload>({
            query: (data) => ({
                url: '/admin/users/bulk-update-status',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminUser' as const, id: 'LIST' }],
        }),

        // --- Roles ---

        // Get all roles
        getAdminRoles: builder.query<AdminRole[], void>({
            query: () => '/admin/roles',
            transformResponse: (response: any) => response.data,
            providesTags: ['AdminRole'],
        }),

        // Get single role
        getAdminRole: builder.query<AdminRole, number>({
            query: (id) => `/admin/roles/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminRole' as const, id }],
        }),

        // Create role
        createAdminRole: builder.mutation<AdminRole, Partial<AdminRole>>({
            query: (data) => ({
                url: '/admin/roles',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: ['AdminRole'],
        }),

        // Update role
        updateAdminRole: builder.mutation<AdminRole, { id: number; data: Partial<AdminRole> }>({
            query: ({ id, data }) => ({
                url: `/admin/roles/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminRole' as const, id },
                'AdminRole',
            ],
        }),

        // Delete role
        deleteAdminRole: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/roles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AdminRole'],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminUsersQuery,
    useLazyGetAdminUsersQuery,
    useGetAdminUserQuery,
    useCreateAdminUserMutation,
    useUpdateAdminUserMutation,
    useDeleteAdminUserMutation,
    useBulkDeleteAdminUsersMutation,
    useBulkUpdateAdminUsersStatusMutation,
    useGetAdminRolesQuery,
    useGetAdminRoleQuery,
    useCreateAdminRoleMutation,
    useUpdateAdminRoleMutation,
    useDeleteAdminRoleMutation,
} = adminUsersSlice;

// Selectors
export const {
    selectAll: selectAllAdminUsers,
    selectById: selectAdminUserById,
    selectIds: selectAdminUserIds,
} = adminUsersAdapter.getSelectors<RootState>(
    (state) =>
        adminUsersSlice.endpoints.getAdminUsers.select({})(state).data || initialState
);

export default adminUsersSlice;
