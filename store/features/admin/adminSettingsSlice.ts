// store/features/admin/adminSettingsSlice.ts
import { apiSlice } from '../api/apiSlice';

// Existing Types (kept for backward compatibility, update as needed)
export interface StoreSettings {
    config_name?: string;
    config_owner?: string;
    config_telephone?: string;
    config_address?: string;
    config_open?: string;
    config_logo?: string;
    config_icon?: string;
    config_meta_title?: string;
    config_meta_description?: string;
    config_meta_keyword?: string;
    config_theme?: string;
    config_language?: string;
    config_admin_language?: string;
    config_country_id?: number | string;
    config_zone_id?: number | string;
    config_currency?: string;
    config_length_class_id?: number | string;
    config_weight_class_id?: number | string;
    [key: string]: any;
}

export interface LocalSettings {
    country_id?: number;
    zone_id?: number;
    language_id?: number;
    admin_language_id?: number;
    currency?: string;
    length_class_id?: number;
    weight_class_id?: number;
    [key: string]: any;
}

export interface OptionSettings {
    invoice_prefix?: string;
    account_terms_id?: number;
    checkout_guest?: number;
    checkout_terms_id?: number;
    order_status_id?: number;
    processing_status?: string;
    complete_status?: string;
    fraud_status_id?: number;
    api_id?: number;
    [key: string]: any;
}

export interface ImageSettings {
    logo_width?: number;
    logo_height?: number;
    product_thumb_width?: number;
    product_thumb_height?: number;
    product_popup_width?: number;
    product_popup_height?: number;
    category_thumb_width?: number;
    category_thumb_height?: number;
    [key: string]: any;
}

export interface MailSettings {
    config_email?: string;
    config_mail_engine?: string;
    config_mail_parameter?: string;
    config_mail_smtp_hostname?: string;
    config_mail_smtp_username?: string;
    config_mail_smtp_password?: string;
    config_mail_smtp_port?: number | string;
    config_mail_smtp_timeout?: number | string;
    config_mail_alert?: string[];
    config_mail_alert_email?: string;
    [key: string]: any;
}

export interface ServerSettings {
    maintenance_mode?: number;
    seo_url?: number;
    robots?: string;
    file_max_size?: number;
    file_ext_allowed?: string;
    file_mime_allowed?: string;
    encryption?: string;
    [key: string]: any;
}

export interface ShippingFlatSettings {
    shipping_flat_cost?: number;
    shipping_flat_geo_zone_id?: number;
    shipping_flat_sort_order?: number;
    shipping_flat_status?: number | boolean;
    shipping_flat_tax_class_id?: number;
    [key: string]: any;
}

export interface ShippingFreeSettings {
    shipping_free_geo_zone_id?: number;
    shipping_free_sort_order?: number;
    shipping_free_status?: number | boolean;
    shipping_free_total?: number;
    [key: string]: any;
}

export interface ShippingSmsaSettings {
    shipping_smsa_4_rate?: string | number;
    shipping_smsa_4_status?: number | boolean;
    shipping_smsa_5_rate?: string | number;
    shipping_smsa_5_status?: number | boolean;
    shipping_smsa_6_rate?: string | number;
    shipping_smsa_6_status?: number | boolean;
    shipping_smsa_address_1?: string;
    shipping_smsa_address_2?: string;
    shipping_smsa_city?: string;
    shipping_smsa_country?: string;
    shipping_smsa_mode?: number | string;
    shipping_smsa_name?: string;
    shipping_smsa_passkey?: string;
    shipping_smsa_postcode?: string;
    shipping_smsa_sort_order?: number | string;
    shipping_smsa_status?: number | boolean;
    shipping_smsa_tax_class_id?: number | string;
    shipping_smsa_telephone?: string;
    [key: string]: any;
}

export interface AdminSettings {
    store?: StoreSettings;
    local?: LocalSettings;
    option?: OptionSettings;
    image?: ImageSettings;
    mail?: MailSettings;
    server?: ServerSettings;
    shipping_flat?: ShippingFlatSettings;
    shipping_free?: ShippingFreeSettings;
    shipping_smsa?: ShippingSmsaSettings;
    [key: string]: any;
}

// New Service Config Types
export interface LoyaltyConfig {
    rate_percent?: number | string;
    expiry_days?: number | string;
    enabled?: boolean | number;
    min_order?: number | string;
    max_redeem_percent?: number | string;
}

export interface OtpConfig {
    otp_digits?: number | string;
    otp_ttl?: number | string;
    sms_provider?: string;
    sms_enabled?: boolean | number;
}

export interface PaytabsConfig {
    profile_id?: string;
    server_key?: string;
    client_key?: string;
    region?: string;
    base_url?: string;
    enabled?: boolean | number;
}

export interface TapConfig {
    secret_key?: string;
    public_key?: string;
    base_url?: string;
    currency?: string;
    frontend_redirect?: string;
    enabled?: boolean | number;
}

export interface SmsaConfig {
    passkey?: string;
    base_url?: string;
    enabled?: boolean | number;
}

export interface ServiceSettings {
    loyalty?: LoyaltyConfig;
    otp?: OtpConfig;
    paytabs?: PaytabsConfig;
    tap?: TapConfig;
    smsa?: SmsaConfig;
}

// Payload Types
export interface UpdateSettingsPayload {
    category?: string;
    settings: Record<string, any>;
}

export interface BulkUpdatePayload {
    group: string;
    settings: Record<string, any>;
    store_id?: number;
}

export interface SettingsUpdatePayload {
    key: string;
    value: any;
    group: string;
    store_id?: number;
}

// API Slice
export const adminSettingsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all settings, optionally filtered by group/code and store_id
        getAdminSettings: builder.query<AdminSettings, { group?: string; code?: string; store_id?: number } | void>({
            query: (params) => ({
                url: '/admin/settings',
                params: params || undefined,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminSettings' as const, id: 'ALL' }],
        }),

        // Get single setting by key
        getSetting: builder.query<any, { key: string; store_id?: number }>({
            query: ({ key, store_id }) => ({
                url: `/admin/settings/${key}`,
                params: { store_id }
            }),
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, { key }) => [{ type: 'AdminSettings' as const, id: key }],
        }),

        // Update single setting
        updateSetting: builder.mutation<any, SettingsUpdatePayload>({
            query: ({ key, ...body }) => ({
                url: `/admin/settings/${key}`,
                method: 'PUT',
                body,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { key }) => [
                { type: 'AdminSettings' as const, id: key },
                { type: 'AdminSettings' as const, id: 'ALL' }
            ],
        }),

        // Bulk update settings
        bulkUpdateSettings: builder.mutation<any, BulkUpdatePayload>({
            query: (body) => ({
                url: '/admin/settings/bulk-update',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'AdminSettings' as const, id: 'ALL' }],
        }),

        // Delete setting
        deleteSetting: builder.mutation<any, { key: string; store_id?: number }>({
            query: ({ key, store_id }) => ({
                url: `/admin/settings/${key}`,
                method: 'DELETE',
                params: { store_id }
            }),
            invalidatesTags: (result, error, { key }) => [
                { type: 'AdminSettings' as const, id: key },
                { type: 'AdminSettings' as const, id: 'ALL' }
            ],
        }),

        // Kept for backward compatibility
        getAdminSettingsByCategory: builder.query<any, string>({
            query: (category) => ({
                url: '/admin/settings',
                params: { group: category }
            }),
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, category) => [
                { type: 'AdminSettings' as const, id: category },
            ],
        }),

        updateAdminSettings: builder.mutation<any, UpdateSettingsPayload>({
            query: ({ category, settings }) => {
                // Global sanitization: prevent any NULL/undefined/NaN from reaching the backend's NOT NULL constraints
                const sanitizedSettings = Object.fromEntries(
                    Object.entries(settings).map(([key, value]) => [
                        key,
                        value === undefined || value === null || (typeof value === 'number' && Number.isNaN(value)) ? '' : value
                    ])
                );

                return {
                    url: '/admin/settings/bulk-update',
                    method: 'POST',
                    body: {
                        group: category || 'config',
                        settings: sanitizedSettings,
                    },
                };
            },
            invalidatesTags: (result, error, { category }) => [
                { type: 'AdminSettings' as const, id: category },
                { type: 'AdminSettings' as const, id: 'ALL' },
            ],
        }),

        // Store info specific endpoints
        getStoreInfo: builder.query<StoreSettings, { store_id?: number } | void>({
            query: (params) => ({
                url: '/admin/settings/store-info',
                params: params || undefined,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminSettings' as const, id: 'StoreInfo' }],
        }),

        updateStoreInfo: builder.mutation<any, Partial<StoreSettings> & { store_id?: number }>({
            query: (body) => ({
                url: '/admin/settings/store-info',
                method: 'PUT',
                body,
            }),
            invalidatesTags: [
                { type: 'AdminSettings' as const, id: 'StoreInfo' },
                { type: 'AdminSettings' as const, id: 'ALL' }
            ],
        }),

        // Clear cache
        clearCache: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: '/admin/settings/clear-cache',
                method: 'POST',
            }),
        }),

        // --- Service Settings Endpoints ---
        getServiceSettings: builder.query<ServiceSettings, void>({
            query: () => '/admin/settings/services',
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminSettings' as const, id: 'Services' }],
        }),

        updateServiceSettings: builder.mutation<any, ServiceSettings>({
            query: (body) => {
                // Recursively strip out any undefined/null/NaN properties to pass strict MySQL NOT NULL rules via PHP validation
                const sanitizePayload = (obj: any): any => {
                    if (obj === null || obj === undefined || (typeof obj === 'number' && Number.isNaN(obj))) return '';
                    if (typeof obj !== 'object') return obj;

                    const sanitized: Record<string, any> = {};
                    for (const [k, v] of Object.entries(obj)) {
                        sanitized[k] = sanitizePayload(v);
                    }
                    return sanitized;
                };

                return {
                    url: '/admin/settings/services',
                    method: 'PUT',
                    body: sanitizePayload(body),
                };
            },
            invalidatesTags: [
                { type: 'AdminSettings' as const, id: 'Services' },
                { type: 'AdminSettings' as const, id: 'Loyalty' },
                { type: 'AdminSettings' as const, id: 'Otp' },
                { type: 'AdminSettings' as const, id: 'Paytabs' },
                { type: 'AdminSettings' as const, id: 'Tap' },
                { type: 'AdminSettings' as const, id: 'Smsa' }
            ],
        }),

        getLoyaltyConfig: builder.query<LoyaltyConfig, void>({
            query: () => '/admin/settings/services/loyalty',
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminSettings' as const, id: 'Loyalty' }],
        }),

        updateLoyaltyConfig: builder.mutation<any, LoyaltyConfig>({
            query: (body) => ({
                url: '/admin/settings/services/loyalty',
                method: 'PUT',
                body,
            }),
            invalidatesTags: [{ type: 'AdminSettings' as const, id: 'Loyalty' }, { type: 'AdminSettings' as const, id: 'Services' }],
        }),

        getOtpConfig: builder.query<OtpConfig, void>({
            query: () => '/admin/settings/services/otp',
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminSettings' as const, id: 'Otp' }],
        }),

        updateOtpConfig: builder.mutation<any, OtpConfig>({
            query: (body) => ({
                url: '/admin/settings/services/otp',
                method: 'PUT',
                body,
            }),
            invalidatesTags: [{ type: 'AdminSettings' as const, id: 'Otp' }, { type: 'AdminSettings' as const, id: 'Services' }],
        }),

        getPaytabsConfig: builder.query<PaytabsConfig, void>({
            query: () => '/admin/settings/services/paytabs',
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminSettings' as const, id: 'Paytabs' }],
        }),

        updatePaytabsConfig: builder.mutation<any, PaytabsConfig>({
            query: (body) => ({
                url: '/admin/settings/services/paytabs',
                method: 'PUT',
                body,
            }),
            invalidatesTags: [{ type: 'AdminSettings' as const, id: 'Paytabs' }, { type: 'AdminSettings' as const, id: 'Services' }],
        }),

        getTapConfig: builder.query<TapConfig, void>({
            query: () => '/admin/settings/services/tap',
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminSettings' as const, id: 'Tap' }],
        }),

        updateTapConfig: builder.mutation<any, TapConfig>({
            query: (body) => ({
                url: '/admin/settings/services/tap',
                method: 'PUT',
                body,
            }),
            invalidatesTags: [{ type: 'AdminSettings' as const, id: 'Tap' }, { type: 'AdminSettings' as const, id: 'Services' }],
        }),

        getSmsaConfig: builder.query<SmsaConfig, void>({
            query: () => '/admin/settings/services/smsa',
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminSettings' as const, id: 'Smsa' }],
        }),

        updateSmsaConfig: builder.mutation<any, SmsaConfig>({
            query: (body) => ({
                url: '/admin/settings/services/smsa',
                method: 'PUT',
                body,
            }),
            invalidatesTags: [{ type: 'AdminSettings' as const, id: 'Smsa' }, { type: 'AdminSettings' as const, id: 'Services' }],
        }),

        // Following are kept from original implementation if needed by frontend
        testEmailSettings: builder.mutation<{ message: string }, { email: string }>({
            query: (data) => ({
                url: '/admin/settings/test-email',
                method: 'POST',
                body: data,
            }),
        }),

        backupDatabase: builder.mutation<Blob, void>({
            query: () => ({
                url: '/admin/settings/backup-database',
                method: 'POST',
                responseHandler: (response) => response.blob(),
            }),
        }),

        getSystemInfo: builder.query<any, void>({
            query: () => '/admin/settings/system-info',
            transformResponse: (response: any) => response.data,
        }),
    }),
});

// Export hooks
export const {
    useGetAdminSettingsQuery,
    useGetSettingQuery,
    useUpdateSettingMutation,
    useBulkUpdateSettingsMutation,
    useDeleteSettingMutation,
    useGetAdminSettingsByCategoryQuery,
    useUpdateAdminSettingsMutation,
    useGetStoreInfoQuery,
    useUpdateStoreInfoMutation,
    useClearCacheMutation,
    useGetServiceSettingsQuery,
    useUpdateServiceSettingsMutation,
    useGetLoyaltyConfigQuery,
    useUpdateLoyaltyConfigMutation,
    useGetOtpConfigQuery,
    useUpdateOtpConfigMutation,
    useGetPaytabsConfigQuery,
    useUpdatePaytabsConfigMutation,
    useGetTapConfigQuery,
    useUpdateTapConfigMutation,
    useGetSmsaConfigQuery,
    useUpdateSmsaConfigMutation,
    useTestEmailSettingsMutation,
    useBackupDatabaseMutation,
    useGetSystemInfoQuery,
} = adminSettingsSlice;

export default adminSettingsSlice;
