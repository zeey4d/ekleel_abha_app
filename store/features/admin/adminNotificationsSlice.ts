// store/features/admin/adminNotificationsSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminNotification {
    notification_id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: number;
    created_at: string;
    link?: string;
    data?: any;
}

export interface AdminNotificationsParams {
    page?: number;
    per_page?: number;
    is_read?: number;
    type?: string;
}

export interface CreateNotificationPayload {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    link?: string;
    data?: any;
}

export interface AdminNotificationsState extends EntityState<AdminNotification, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
    unreadCount: number;
}

// Entity Adapter
const adminNotificationsAdapter = createEntityAdapter<AdminNotification, number>({
    selectId: (notification) => notification.notification_id,
    sortComparer: (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
});

const initialState: AdminNotificationsState = adminNotificationsAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
    unreadCount: 0,
});

// API Slice
export const adminNotificationsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all notifications (admin)
        getAdminNotifications: builder.query<AdminNotificationsState, AdminNotificationsParams>({
            query: (params) => ({
                url: '/admin/notifications',
                params,
            }),
            transformResponse: (response: any): AdminNotificationsState => {
                const state = adminNotificationsAdapter.setAll(initialState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
                    unreadCount: response.data.unread_count || 0,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminNotification' as const, id })),
                        { type: 'AdminNotification' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminNotification' as const, id: 'LIST' }],
        }),

        // Get unread count
        getUnreadNotificationsCount: builder.query<number, void>({
            query: () => '/admin/notifications/unread-count',
            transformResponse: (response: any) => response.data.count,
            providesTags: [{ type: 'AdminNotification' as const, id: 'UNREAD_COUNT' }],
        }),

        // Mark notification as read
        markNotificationAsRead: builder.mutation<AdminNotification, number>({
            query: (id) => ({
                url: `/admin/notifications/${id}/read`,
                method: 'PUT',
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, id) => [
                { type: 'AdminNotification' as const, id },
                { type: 'AdminNotification' as const, id: 'LIST' },
                { type: 'AdminNotification' as const, id: 'UNREAD_COUNT' },
            ],
        }),

        // Mark all notifications as read
        markAllNotificationsAsRead: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: '/admin/notifications/mark-all-read',
                method: 'PUT',
            }),
            invalidatesTags: [
                { type: 'AdminNotification' as const, id: 'LIST' },
                { type: 'AdminNotification' as const, id: 'UNREAD_COUNT' },
            ],
        }),

        // Delete notification
        deleteAdminNotification: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/notifications/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminNotification' as const, id },
                { type: 'AdminNotification' as const, id: 'LIST' },
            ],
        }),

        // // Delete all read notifications
        // deleteAllReadNotifications: builder.mutation<{ message: string }, void>({
        //     query: () => ({
        //         url: '/admin/notifications/delete-all-read',
        //         method: 'DELETE',
        //     }),
        //     invalidatesTags: [{ type: 'AdminNotification' as const, id: 'LIST' }],
        // }),
    }),
});

// Export hooks
export const {
    useGetAdminNotificationsQuery,
    useGetUnreadNotificationsCountQuery,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
    useDeleteAdminNotificationMutation,
    // useDeleteAllReadNotificationsMutation,
} = adminNotificationsSlice;

// Selectors
export const {
    selectAll: selectAllAdminNotifications,
    selectById: selectAdminNotificationById,
    selectIds: selectAdminNotificationIds,
} = adminNotificationsAdapter.getSelectors<RootState>(
    (state) =>
        adminNotificationsSlice.endpoints.getAdminNotifications.select({})(state).data || initialState
);

// Custom selector for unread notifications
export const selectUnreadNotifications = (state: RootState) => {
    const notifications = selectAllAdminNotifications(state);
    return notifications.filter(n => n.is_read === 0);
};

export default adminNotificationsSlice;
