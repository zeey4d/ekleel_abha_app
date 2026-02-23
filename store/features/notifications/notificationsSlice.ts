import { createSelector, createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState, AppDispatch } from '@/store/store';

import { Notification, GetNotificationsParams, NotificationStates, PaginatedResponse } from '@/store/types';






// export interface PaginatedResponse<T> {
//    T[];
//   meta: {
//     current_page: number;
//     per_page: number;
//     total: number;
//     total_pages: number;
//   };
//   [key: string]: any; // Additional response properties
// }
// --- Entity Adapter for Notifications ---
const notificationsAdapter = createEntityAdapter<Notification, string | number>({
  selectId: (notification: Notification) => notification.id,
  sortComparer: (a: Notification, b: Notification) => 
    new Date(b.date_added).getTime() - new Date(a.date_added).getTime(),
});

const initialNotificationsState: NotificationStates = notificationsAdapter.getInitialState({
  loading: false,
  error: null,
  unreadCount: 0,
  pagination: undefined,
});

// --- RTK Query API Slice Injection ---
export const notificationsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Get User Notifications ---
    getNotifications: builder.query<NotificationStates, GetNotificationsParams>({
      query: ({ page = 1, limit = 15, type, read }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        if (type) params.append('type', type);
        if (read !== undefined) params.append('read', read.toString());
        
        return `/notifications?${params.toString()}`;
      },
      transformResponse: (responseData: PaginatedResponse<Notification>): NotificationStates => {
        // Normalize the array response
        const state = notificationsAdapter.setAll(
          initialNotificationsState, 
          responseData.data
        );
        
        // Calculate unread count
        const unreadCount = responseData.data.filter(n => !n.read).length;
        
        return {
          ...state,
          unreadCount,
          pagination: responseData.meta,
        };
      },
      providesTags: (result, error, arg) => 
        result 
          ? [...result.ids.map((id) => ({ type: 'Notification' as const, id })), { type: 'Notification' as const, id: 'LIST' }] 
          : [{ type: 'Notification' as const, id: 'LIST' }],
      keepUnusedDataFor: 300, // Keep for 5 minutes
    }),
    
    // --- Mark Notification as Read ---
    markNotificationAsRead: builder.mutation<Notification, string | number>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      // Optimistic update for marking as read
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsSlice.util.updateQueryData('getNotifications', { page: 1, limit: 15 }, (draft: NotificationStates) => {
            const notification = draft.entities[id];
            if (notification && !notification.read) {
              notification.read = true;
              notification.date_read = new Date().toISOString();
              draft.unreadCount = Math.max(0, draft.unreadCount - 1);
            }
          })
        );
        
        try {
          const { data: updatedNotification } = await queryFulfilled;
          
          // Update the notification with the server response
          dispatch(
            notificationsSlice.util.updateQueryData('getNotifications', { page: 1, limit: 15 }, (draft: NotificationStates) => {
              if (draft.entities[id]) {
                Object.assign(draft.entities[id]!, updatedNotification);
              }
            })
          );
        } catch (err) {
          patchResult.undo();
          console.error('Failed to mark notification as read:', err);
        }
      },
      invalidatesTags: (result, error, id) => 
        [{ type: 'Notification' as const, id }, { type: 'Notification' as const, id: 'LIST' }],
    }),
    
    // --- Mark All Notifications as Read ---
    markAllNotificationsAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'PUT',
      }),
      // Optimistic update for marking all as read
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsSlice.util.updateQueryData('getNotifications', { page: 1, limit: 15 }, (draft: NotificationStates) => {
            // Mark all as read
            Object.values(draft.entities).forEach(notification => {
              if (notification && !notification.read) {
                notification.read = true;
                notification.date_read = new Date().toISOString();
              }
            });
            draft.unreadCount = 0;
          })
        );
        
        try {
          await queryFulfilled;
        } catch (err) {
          patchResult.undo();
          console.error('Failed to mark all notifications as read:', err);
        }
      },
      invalidatesTags: [{ type: 'Notification' as const, id: 'LIST' }],
    }),
    
    // --- Delete Notification ---
    deleteNotification: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      // Optimistic update for deletion
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsSlice.util.updateQueryData('getNotifications', { page: 1, limit: 15 }, (draft: NotificationStates) => {
            const notification = draft.entities[id];
            if (notification) {
              notificationsAdapter.removeOne(draft, id);
              if (!notification.read) {
                draft.unreadCount = Math.max(0, draft.unreadCount - 1);
              }
            }
          })
        );
        
        try {
          await queryFulfilled;
        } catch (err) {
          patchResult.undo();
          console.error('Failed to delete notification:', err);
        }
      },
      invalidatesTags: (result, error, id) => 
        [{ type: 'Notification' as const, id }, { type: 'Notification' as const, id: 'LIST' }],
    }),
  }),
});

// Export auto-generated hooks
export const {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
} = notificationsSlice;

// --- Memoized Selectors ---
// Selector for notifications
export const {
  selectAll: selectAllNotifications,
  selectById: selectNotificationById,
  selectIds: selectNotificationIds,
} = notificationsAdapter.getSelectors<RootState>((state) => 
  notificationsSlice.endpoints.getNotifications.select({ page: 1, limit: 15 })(state).data || initialNotificationsState
);

// Selector for unread notifications
export const selectUnreadNotifications = createSelector(
  [selectAllNotifications],
  (notifications) => notifications.filter(notification => !notification.read)
);

// Selector for unread count
export const selectUnreadCount = createSelector(
  [notificationsSlice.endpoints.getNotifications.select({ page: 1, limit: 15 })],
  (result) => result.data?.unreadCount || 0
);

// Selector for notifications by type
export const selectNotificationsByType = createSelector(
  [selectAllNotifications, (state, type: Notification['type']) => type],
  (notifications, type) => 
    notifications.filter(notification => notification.type === type)
);

// Selector for pagination
export const selectNotificationsPagination = (state: RootState) => {
  const result = notificationsSlice.endpoints.getNotifications.select({ page: 1, limit: 15 })(state);
  return result.data?.pagination || null;
};

export default notificationsSlice;

/**
 * Injects a real-time push notification into the RTK cache.
 * - Deduplicates by ID
 * - Uses EntityAdapter.addOne (respects sortComparer)
 * - Increments unreadCount
 * - Increments pagination.total
 */
export function injectPushNotification(
  dispatch: AppDispatch,
  notification: Notification,
  queryParams: GetNotificationsParams = { page: 1, limit: 15 }
): void {
  dispatch(
    notificationsSlice.util.updateQueryData(
      'getNotifications',
      queryParams,
      (draft: NotificationStates) => {
        // Deduplicate — if ID already in cache, skip
        if (draft.entities[notification.id]) return;

        // Insert via adapter (auto-sorted by date_added desc)
        notificationsAdapter.addOne(draft, notification);

        // Update unread count
        if (!notification.read) {
          draft.unreadCount += 1;
        }

        // Update pagination total
        if (draft.pagination) {
          draft.pagination.total += 1;
        }
      }
    )
  );
}