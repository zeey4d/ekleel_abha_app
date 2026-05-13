import { createSelector } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { cookieManager } from '@/lib/cookieManager';

// ==============================
// Types
// ==============================

export interface AdminLoginCredentials {
    username: string;
    password: string;
}

export interface AdminUserGroup {
    id: number;
    name: string;
    permissions?: string[];
    user_count?: number;
    is_super_admin?: boolean;
    permissions_by_module?: Record<string, string[]>;
    users?: any[];
}

export interface AdminUserProfile {
    id: number;
    username: string;
    name: string;
    firstname?: string;
    lastname?: string;
    email: string;
    image: string | null;
    group: {
        id: number;
        name: string;
    };
    permissions: string[];
    ip?: string;
    date_added?: string;
}

export interface AdminLoginResponse {
    message: string;
    access_token: string;
    token_type: string;
    user: AdminUserProfile;
}

export interface AdminGroupListResponse {
    data: AdminUserGroup[];
    available_modules: Record<string, string[]>;
}

export interface UpdateGroupPermissionsPayload {
    id: number;
    name?: string;
    permissions: string[];
}

export interface UpdateUserGroupPayload {
    id: number;
    user_group_id: number;
    force_logout?: boolean;
}

export interface AdminAuthUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    group_id?: number;
    status?: string | number;
}

export interface AdminAuthUsersResponse {
    data: any[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const handleAuthError = (err: any, action: string) => {
    console.error(`Admin ${action} failed:`, typeof err === 'object' ? JSON.stringify(err, Object.getOwnPropertyNames(err), 2) : err);
    return err;
};

// ==============================
// RTK Query Slice
// ==============================

export const adminAuthSlice = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        // Login
        adminLogin: builder.mutation<AdminLoginResponse, AdminLoginCredentials>({
            query: (credentials) => ({
                url: '/admin/auth/login',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    cookieManager.setAdminToken(data.access_token);
                    dispatch(adminAuthSlice.util.prefetch('getAdminMe', undefined, { force: true }));
                } catch (err) {
                    handleAuthError(err, 'Login');
                    throw err;
                }
            },
            invalidatesTags: ['AdminUser'],
        }),

        // Logout
        adminLogout: builder.mutation<void, void>({
            query: () => ({
                url: '/admin/auth/logout',
                method: 'POST',
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (err) {
                    handleAuthError(err, 'Logout');
                } finally {
                    cookieManager.removeAdminToken();
                    dispatch(apiSlice.util.resetApiState());
                }
            },
        }),

        // Get Current Admin Profile
        getAdminMe: builder.query<AdminUserProfile, void>({
            query: () => '/admin/auth/me',
            providesTags: ['AdminUser'],
            keepUnusedDataFor: 60,
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (err: any) {
                    console.error('[AUTH_DEBUG] getAdminMe failed, but skipping token deletion:', err);
                    // if (err?.error?.status === 401) {
                    //     cookieManager.removeAdminToken();
                    // }
                }
            },
        }),

        // Refresh Permissions
        refreshAdminPermissions: builder.mutation<{ message: string; permissions: string[] }, void>({
            query: () => ({
                url: '/admin/auth/refresh-permissions',
                method: 'POST',
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        adminAuthSlice.util.updateQueryData('getAdminMe', undefined, (draft) => {
                            if (draft) draft.permissions = data.permissions;
                        })
                    );
                } catch (err) {
                    handleAuthError(err, 'Refresh Permissions');
                }
            },
            invalidatesTags: ['AdminUser'],
        }),

        // List Groups
        getAdminGroupsList: builder.query<AdminGroupListResponse, void>({
            query: () => '/admin/user-groups',
            providesTags: ['AdminRole'],
        }),

        // Show Group
        getAdminGroupDetail: builder.query<AdminUserGroup, number>({
            query: (id) => `/admin/user-groups/${id}`,
            providesTags: (result, error, id) => [{ type: 'AdminRole' as const, id }],
        }),

        // Update Group Permissions
        updateAdminGroupPermissions: builder.mutation<Record<string, unknown>, UpdateGroupPermissionsPayload>({
            query: ({ id, ...body }) => ({
                url: `/admin/user-groups/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminRole' as const, id },
                'AdminRole',
            ],
        }),

        // Update User Group
        updateAdminUserGroup: builder.mutation<Record<string, unknown>, UpdateUserGroupPayload>({
            query: ({ id, ...body }) => ({
                url: `/admin/admin-users/${id}/group`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminUser' as const, id },
                { type: 'AdminUser' as const, id: 'LIST' },
            ],
        }),

        // List Admin Users
        getAdminAuthUsers: builder.query<AdminAuthUsersResponse, AdminAuthUsersParams>({
            query: (params) => ({
                url: '/admin/admin-users',
                params,
            }),
            providesTags: [{ type: 'AdminUser' as const, id: 'LIST' }],
        }),
        // Get Admin User Detail
        getAdminUserDetail: builder.query<any, number>({
            query: (id) => `/admin/admin-users/${id}`,
            providesTags: (result, error, id) => [{ type: 'AdminUser' as const, id }],
        }),

        // Create Admin User
        createAdminUser: builder.mutation<any, any>({
            query: (body) => ({
                url: '/admin/admin-users',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'AdminUser' as const, id: 'LIST' }],
        }),

        // Update Admin User
        updateAdminUser: builder.mutation<any, { id: number; data: any }>({
            query: ({ id, data }) => ({
                url: `/admin/admin-users/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminUser' as const, id },
                { type: 'AdminUser' as const, id: 'LIST' },
            ],
        }),

        // Delete Admin User
        deleteAdminUser: builder.mutation<any, number>({
            query: (id) => ({
                url: `/admin/admin-users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminUser' as const, id },
                { type: 'AdminUser' as const, id: 'LIST' },
            ],
        }),

        // Bulk Update Admin Users Status
        bulkUpdateAdminUsersStatus: builder.mutation<any, { ids: number[]; status: boolean | number }>({
            query: (body) => ({
                url: '/admin/admin-users/bulk-update-status',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'AdminUser' as const, id: 'LIST' }],
        }),

        // Create Admin Group
        createAdminGroup: builder.mutation<any, { name: string; permissions: string[] }>({
            query: (body) => ({
                url: '/admin/user-groups',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['AdminRole'],
        }),

        // Delete Admin Group
        deleteAdminGroup: builder.mutation<any, number>({
            query: (id) => ({
                url: `/admin/user-groups/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AdminRole'],
        }),
    }),
});

// ==============================
// Hooks
// ==============================
export const {
    useAdminLoginMutation,
    useAdminLogoutMutation,
    useGetAdminMeQuery,
    useRefreshAdminPermissionsMutation,
    useGetAdminGroupsListQuery,
    useGetAdminGroupDetailQuery,
    useUpdateAdminGroupPermissionsMutation,
    useUpdateAdminUserGroupMutation,
    useGetAdminAuthUsersQuery,
    useLazyGetAdminAuthUsersQuery,
    useGetAdminUserDetailQuery,
    useCreateAdminUserMutation,
    useUpdateAdminUserMutation,
    useDeleteAdminUserMutation,
    useBulkUpdateAdminUsersStatusMutation,
    useCreateAdminGroupMutation,
    useDeleteAdminGroupMutation,
} = adminAuthSlice;

// ==============================
// Selectors
// ==============================
export const selectCurrentAdminUser = createSelector(
    [adminAuthSlice.endpoints.getAdminMe.select()],
    (result) => result.data ?? null
);

export const selectIsAdminAuthenticated = createSelector(
    [adminAuthSlice.endpoints.getAdminMe.select(), () => cookieManager.getAdminToken()],
    (result, token) => !!token && !cookieManager.isAdminTokenExpired() && !!result.data && !result.isError
);

export const selectAdminAuthLoading = createSelector(
    [adminAuthSlice.endpoints.getAdminMe.select()],
    (result) => result.isLoading
);

export const selectAdminAuthError = createSelector(
    [adminAuthSlice.endpoints.getAdminMe.select()],
    (result) => result.error
);

export default adminAuthSlice;
