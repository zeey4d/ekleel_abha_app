import React, { useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, Trash2 } from 'lucide-react-native';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  useGetNotificationsQuery, 
  useMarkAllNotificationsAsReadMutation, 
  useMarkNotificationAsReadMutation, 
  useDeleteNotificationMutation,
  selectAllNotifications, 
  selectUnreadCount 
} from '@/store/features/notifications/notificationsSlice';
import { useNotificationsBootstrap } from '@/store/features/notifications/useNotificationsBootstrap';
import { Notification } from '@/store/types';

// Simple Notification Item Component
const NotificationItem = React.memo(({ item, onRead, onDelete }: { 
  item: Notification; 
  onRead: (id: string | number) => void;
  onDelete: (id: string | number) => void;
}) => {
  const { t } = useTranslation();
  
  return (
    <TouchableOpacity 
      style={[styles.itemContainer, !item.read && styles.unreadItem]}
      onPress={() => onRead(item.id)}
    >
      <View style={styles.iconContainer}>
        <Bell size={24} color={item.read ? '#9CA3AF' : '#4F46E5'} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, !item.read && styles.unreadText]}>{item.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.date}>{new Date(item.date_added).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={(e) => {
          e.stopPropagation();
          onDelete(item.id);
        }}
      >
        <Trash2 size={20} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // 1. Bootstrap Push Notifications
  useNotificationsBootstrap();

  // 2. Fetch Data
  const { 
    isLoading, 
    isFetching, 
    refetch 
  } = useGetNotificationsQuery({ page: 1, limit: 15 });

  // 3. Selectors
  const notifications = useAppSelector(selectAllNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);

  // 4. Mutations
  const [markAllRead] = useMarkAllNotificationsAsReadMutation();
  const [markRead] = useMarkNotificationAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleMarkAllRead = useCallback(() => {
    markAllRead();
  }, [markAllRead]);

  const renderItem = useCallback(({ item }: { item: Notification }) => (
    <NotificationItem 
      item={item} 
      onRead={(id) => markRead(id)} 
      onDelete={(id) => deleteNotification(id)} 
    />
  ), [markRead, deleteNotification]);

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Bell size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>{t('notifications.empty', 'No notifications yet')}</Text>
      <Text style={styles.emptySubtext}>
        {t('notifications.empty_sub', 'We will notify you when something important happens')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('notifications.title', 'Notifications')}</Text>
          {unreadCount > 0 && (
            <Text style={styles.subtitle}>
              {unreadCount} {t('notifications.unread', 'unread')}
            </Text>
          )}
        </View>
        <TouchableOpacity 
          onPress={handleMarkAllRead}
          disabled={unreadCount === 0}
          style={[styles.markAllButton, unreadCount === 0 && styles.disabledButton]}
        >
          <CheckCheck size={20} color={unreadCount === 0 ? '#9CA3AF' : '#4F46E5'} />
          <Text style={[styles.markAllText, unreadCount === 0 && styles.disabledText]}>
            {t('notifications.mark_all_read', 'Mark all read')}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.listContent, 
            notifications.length === 0 && styles.flexGrow
          ]}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={EmptyState}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // gray-50
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F46E5',
    marginLeft: 6,
  },
  disabledText: {
    color: '#9CA3AF',
  },
  listContent: {
    padding: 16,
  },
  flexGrow: {
    flexGrow: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadItem: {
    backgroundColor: '#F0F9FF', // light blue tint
    borderColor: '#BAE6FD',
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  unreadText: {
    color: '#000000',
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  deleteButton: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});
