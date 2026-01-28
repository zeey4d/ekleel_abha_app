// store/features/admin/adminSettingsSlice.ts
import { apiSlice } from '../api/apiSlice';

// Types
export interface StoreSettings {
    store_name: string;
    store_owner: string;
    store_email: string;
    store_telephone: string;
    store_address: string;
    store_logo?: string;
    store_icon?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keyword?: string;
    theme?: string;
    default_language_id: number;
    default_currency: string;
    timezone?: string;
}

export interface LocalSettings {
    country_id: number;
    zone_id: number;
    language_id: number;
    admin_language_id: number;
    currency: string;
    length_class_id: number;
    weight_class_id: number;
}

export interface OptionSettings {
    invoice_prefix: string;
    account_terms_id?: number;
    checkout_guest: number;
    checkout_terms_id?: number;
    order_status_id: number;
    processing_status: string;
    complete_status: string;
    fraud_status_id?: number;
    api_id?: number;
}

export interface ImageSettings {
    logo_width: number;
    logo_height: number;
    product_thumb_width: number;
    product_thumb_height: number;
    product_popup_width: number;
    product_popup_height: number;
    category_thumb_width: number;
    category_thumb_height: number;
}

export interface MailSettings {
    mail_protocol: string;
    mail_parameter?: string;
    smtp_hostname?: string;
    smtp_username?: string;
    smtp_password?: string;
    smtp_port?: number;
    smtp_timeout?: number;
}

export interface ServerSettings {
    maintenance_mode: number;
    seo_url: number;
    robots?: string;
    file_max_size: number;
    file_ext_allowed?: string;
    file_mime_allowed?: string;
    encryption?: string;
}

export interface AdminSettings {
    store: StoreSettings;
    local: LocalSettings;
    option: OptionSettings;
    image: ImageSettings;
    mail: MailSettings;
    server: ServerSettings;
}

export interface UpdateSettingsPayload {
    category: 'store' | 'local' | 'option' | 'image' | 'mail' | 'server';
    settings: Record<string, any>;
}

// API Slice
export const adminSettingsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all settings
        getAdminSettings: builder.query<AdminSettings, void>({
            query: () => '/admin/settings',
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminSettings' as const, id: 'ALL' }],
        }),

        // Get settings by category
        getAdminSettingsByCategory: builder.query<any, string>({
            query: (category) => `/admin/settings/${category}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, category) => [
                { type: 'AdminSettings' as const, id: category },
            ],
        }),

        // Update settings
        updateAdminSettings: builder.mutation<AdminSettings, UpdateSettingsPayload>({
            query: ({ category, settings }) => ({
                url: `/admin/settings/${category}`,
                method: 'PUT',
                body: settings,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { category }) => [
                { type: 'AdminSettings' as const, id: category },
                { type: 'AdminSettings' as const, id: 'ALL' },
            ],
        }),

        // Clear cache
        clearCache: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: '/admin/settings/clear-cache',
                method: 'POST',
            }),
        }),

        // Test email settings
        testEmailSettings: builder.mutation<{ message: string }, { email: string }>({
            query: (data) => ({
                url: '/admin/settings/test-email',
                method: 'POST',
                body: data,
            }),
        }),

        // Backup database
        backupDatabase: builder.mutation<Blob, void>({
            query: () => ({
                url: '/admin/settings/backup-database',
                method: 'POST',
                responseHandler: (response) => response.blob(),
            }),
        }),

        // Get system info
        getSystemInfo: builder.query<any, void>({
            query: () => '/admin/settings/system-info',
            transformResponse: (response: any) => response.data,
        }),
    }),
});

// Export hooks
export const {
    useGetAdminSettingsQuery,
    useGetAdminSettingsByCategoryQuery,
    useUpdateAdminSettingsMutation,
    useClearCacheMutation,
    useTestEmailSettingsMutation,
    useBackupDatabaseMutation,
    useGetSystemInfoQuery,
} = adminSettingsSlice;

export default adminSettingsSlice;
