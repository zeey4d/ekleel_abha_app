// store/features/admin/adminCategoriesSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminCategory {
    category_id: number;
    parent_id: number;
    top: number;
    column: number;
    sort_order: number;
    status: number;
    date_added: string;
    date_modified: string;
    image?: string;
    code?: string;
    // English fields
    name_en: string;
    description_en?: string;
    meta_title_en?: string;
    meta_description_en?: string;
    meta_keyword_en?: string;
    // Arabic fields
    name_ar?: string;
    description_ar?: string;
    meta_title_ar?: string;
    meta_description_ar?: string;
    meta_keyword_ar?: string;
    // Additional fields
    subcategories_count?: number;
    products_count?: number;
}

export interface AdminCategoriesParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: number | null;
    parent_id?: number | null;
}

export interface CreateCategoryPayload {
    // Core fields
    status: boolean;
    parent_id?: number;
    image?: string | File;  // Can be string path or File for upload
    top?: number;
    column?: number;
    sort_order?: number;
    code?: string;
    store_id?: number;
    // English fields
    name_en: string;
    description_en?: string;
    meta_title_en?: string;
    meta_description_en?: string;
    meta_keyword_en?: string;
    // Arabic fields
    name_ar?: string;
    description_ar?: string;
    meta_title_ar?: string;
    meta_description_ar?: string;
    meta_keyword_ar?: string;
}

export interface UpdateCategoryPayload {
    id: number;
    data: {
        // Core fields
        status?: boolean;
        parent_id?: number;
        image?: string | File;  // Can be string path or File for upload
        top?: number;
        column?: number;
        sort_order?: number;
        code?: string;
        // English fields
        name_en?: string;
        description_en?: string;
        meta_title_en?: string;
        meta_description_en?: string;
        meta_keyword_en?: string;
        // Arabic fields
        name_ar?: string;
        description_ar?: string;
        meta_title_ar?: string;
        meta_description_ar?: string;
        meta_keyword_ar?: string;
    };
}

export interface BulkUpdateStatusPayload {
    ids: number[];
    status: boolean;
}

export interface BulkUpdateParentPayload {
    ids: number[];
    parent_id: number;
}

export interface BulkDeletePayload {
    ids: number[];
}

export interface CategoryBanner {
    banner_id: number;
    name: string;
    banner_type_id: number;
    status: number;
    type_name: string;
    type_code: string;
    type_width: number;
    type_height: number;
    sort_order: number;
    title_en?: string;
    image_en?: string;
    link_en?: string;
    title_ar?: string;
    image_ar?: string;
    link_ar?: string;
}

export interface GetCategoryBannersResponse {
    success: boolean;
    data: {
        category_id: number;
        banners: CategoryBanner[];
    };
}

export interface SyncCategoryBannersPayload {
    categoryId: number;
    banners: { banner_id: number; sort_order?: number }[];
}

export interface AddCategoryBannerPayload {
    categoryId: number;
    banner_id: number;
    sort_order?: number;
}

export interface RemoveCategoryBannerPayload {
    categoryId: number;
    bannerId: number;
}

export interface AdminCategoriesState extends EntityState<AdminCategory, number> {
    loading: boolean;
    error: string | null;
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

// Helper function to convert payload to FormData
function createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === 'image' && value instanceof File) {
            formData.append('image', value);
        } else if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0');
        } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
        } else {
            formData.append(key, String(value));
        }
    });

    return formData;
}

// Check if payload contains files
function hasFiles(data: Record<string, any>): boolean {
    return data.image instanceof File;
}

// Entity Adapter
const adminCategoriesAdapter = createEntityAdapter<AdminCategory, number>({
    selectId: (category) => category.category_id,
    sortComparer: (a, b) => a.sort_order - b.sort_order,
});

const initialState: AdminCategoriesState = adminCategoriesAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminCategoriesSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all categories (non-paginated) - used for tree views, dropdowns, etc.
        getAdminCategories: builder.query<AdminCategoriesState, AdminCategoriesParams>({
            query: (params) => ({
                url: '/admin/categories',
                params,
            }),
            transformResponse: (response: any): AdminCategoriesState => {
                // Response structure: { success: true, data: [...] }
                const categories = Array.isArray(response.data) ? response.data :
                    (Array.isArray(response) ? response : []);

                const state = adminCategoriesAdapter.setAll(initialState, categories);
                return {
                    ...state,
                    pagination: undefined,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminCategory' as const, id })),
                        { type: 'AdminCategory' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminCategory' as const, id: 'LIST' }],
        }),

        // Get paginated categories - used for admin listings with pagination
        getAdminCategoriesPaginated: builder.query<AdminCategoriesState, AdminCategoriesParams>({
            query: (params) => ({
                url: '/admin/categories/list',
                params,
            }),
            transformResponse: (response: any): AdminCategoriesState => {
                // Response structure: { success: true, data: { data: [...], current_page, last_page, ... } }
                const paginatedData = response.data;
                const categories = paginatedData.data || [];
                const state = adminCategoriesAdapter.setAll(initialState, categories);
                return {
                    ...state,
                    pagination: {
                        current_page: paginatedData.current_page,
                        last_page: paginatedData.last_page,
                        per_page: paginatedData.per_page,
                        total: paginatedData.total,
                        from: paginatedData.from,
                        to: paginatedData.to,
                    },
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminCategory' as const, id })),
                        { type: 'AdminCategory' as const, id: 'PAGINATED_LIST' },
                    ]
                    : [{ type: 'AdminCategory' as const, id: 'PAGINATED_LIST' }],
        }),

        // Get single category (admin)
        getAdminCategory: builder.query<AdminCategory, number>({
            query: (id) => `/admin/categories/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminCategory' as const, id }],
        }),

        // Create category (with FormData support for image uploads)
        createAdminCategory: builder.mutation<AdminCategory, CreateCategoryPayload>({
            query: (data) => {
                const useFormData = hasFiles(data);
                const body = useFormData ? createFormData(data) : data;

                return {
                    url: '/admin/categories',
                    method: 'POST',
                    body,
                    formData: useFormData,
                };
            },
            transformResponse: (response: any) => response.data,
            invalidatesTags: [
                { type: 'AdminCategory' as const, id: 'LIST' },
                { type: 'AdminCategory' as const, id: 'PAGINATED_LIST' },
            ],
        }),

        // Update category (with FormData support for image uploads)
        updateAdminCategory: builder.mutation<AdminCategory, UpdateCategoryPayload>({
            query: ({ id, data }) => {
                const useFormData = hasFiles(data);
                const body = useFormData ? createFormData(data) : data;

                // For FormData with PUT, we need to use POST with _method override
                if (useFormData) {
                    (body as FormData).append('_method', 'PUT');
                    return {
                        url: `/admin/categories/${id}`,
                        method: 'POST',
                        body,
                        formData: true,
                    };
                }

                return {
                    url: `/admin/categories/${id}`,
                    method: 'PUT',
                    body,
                };
            },
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminCategory' as const, id },
                { type: 'AdminCategory' as const, id: 'LIST' },
                { type: 'AdminCategory' as const, id: 'PAGINATED_LIST' },
            ],
        }),

        // Delete category
        deleteAdminCategory: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/admin/categories/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminCategory' as const, id },
                { type: 'AdminCategory' as const, id: 'LIST' },
                { type: 'AdminCategory' as const, id: 'PAGINATED_LIST' },
            ],
        }),

        // Bulk delete categories
        bulkDeleteAdminCategories: builder.mutation<{ success: boolean; message: string }, BulkDeletePayload>({
            query: (data) => ({
                url: '/admin/categories/bulk-delete',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [
                { type: 'AdminCategory' as const, id: 'LIST' },
                { type: 'AdminCategory' as const, id: 'PAGINATED_LIST' },
            ],
        }),

        // Bulk update category status
        bulkUpdateAdminCategoriesStatus: builder.mutation<{ success: boolean; message: string }, BulkUpdateStatusPayload>({
            query: (data) => ({
                url: '/admin/categories/bulk-update-status',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [
                { type: 'AdminCategory' as const, id: 'LIST' },
                { type: 'AdminCategory' as const, id: 'PAGINATED_LIST' },
            ],
        }),

        // Bulk update category parent
        bulkUpdateAdminCategoriesParent: builder.mutation<{ success: boolean; message: string }, BulkUpdateParentPayload>({
            query: (data) => ({
                url: '/admin/categories/bulk-update-parent',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [
                { type: 'AdminCategory' as const, id: 'LIST' },
                { type: 'AdminCategory' as const, id: 'PAGINATED_LIST' },
            ],
        }),

        // --- Category Banners (CLP) ---
        getAdminCategoryBanners: builder.query<GetCategoryBannersResponse, number>({
            query: (categoryId) => `/admin/categories/${categoryId}/banners`,
            providesTags: (result, error, id) => [{ type: 'AdminCategoryBanners' as const, id }],
        }),

        syncAdminCategoryBanners: builder.mutation<{ success: boolean; message: string; data: any }, SyncCategoryBannersPayload>({
            query: ({ categoryId, banners }) => ({
                url: `/admin/categories/${categoryId}/banners`,
                method: 'PUT',
                body: { banners },
            }),
            invalidatesTags: (result, error, { categoryId }) => [
                { type: 'AdminCategoryBanners' as const, id: categoryId },
            ],
        }),

        addAdminCategoryBanner: builder.mutation<{ success: boolean; message: string }, AddCategoryBannerPayload>({
            query: ({ categoryId, banner_id, sort_order }) => ({
                url: `/admin/categories/${categoryId}/banners`,
                method: 'POST',
                body: { banner_id, sort_order },
            }),
            invalidatesTags: (result, error, { categoryId }) => [
                { type: 'AdminCategoryBanners' as const, id: categoryId },
            ],
        }),

        removeAdminCategoryBanner: builder.mutation<{ success: boolean; message: string }, RemoveCategoryBannerPayload>({
            query: ({ categoryId, bannerId }) => ({
                url: `/admin/categories/${categoryId}/banners/${bannerId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { categoryId }) => [
                { type: 'AdminCategoryBanners' as const, id: categoryId },
            ],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminCategoriesQuery,
    useLazyGetAdminCategoriesQuery,
    useGetAdminCategoriesPaginatedQuery,
    useLazyGetAdminCategoriesPaginatedQuery,
    useGetAdminCategoryQuery,
    useCreateAdminCategoryMutation,
    useUpdateAdminCategoryMutation,
    useDeleteAdminCategoryMutation,
    useBulkDeleteAdminCategoriesMutation,
    useBulkUpdateAdminCategoriesStatusMutation,
    useBulkUpdateAdminCategoriesParentMutation,
    // CLP Banner Hooks
    useGetAdminCategoryBannersQuery,
    useLazyGetAdminCategoryBannersQuery,
    useSyncAdminCategoryBannersMutation,
    useAddAdminCategoryBannerMutation,
    useRemoveAdminCategoryBannerMutation,
} = adminCategoriesSlice;

// Selectors
export const {
    selectAll: selectAllAdminCategories,
    selectById: selectAdminCategoryById,
    selectIds: selectAdminCategoryIds,
} = adminCategoriesAdapter.getSelectors<RootState>(
    (state) =>
        adminCategoriesSlice.endpoints.getAdminCategories.select({})(state).data || initialState
);

export default adminCategoriesSlice;


