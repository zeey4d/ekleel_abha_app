// store/features/admin/adminProductsSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminProduct {
    product_id: number;
    model: string;
    sku?: string;
    upc?: string;
    ean?: string;
    jan?: string;
    isbn?: string;
    mpn?: string;
    location?: string;
    price: number;
    quantity: number;
    status: number;
    image?: string;
    manufacturer_id?: number;
    manufacturer_name?: string;
    shipping?: number;
    points?: number;
    tax_class_id?: number;
    date_available?: string;
    weight?: number;
    weight_class_id?: number;
    length?: number;
    width?: number;
    height?: number;
    length_class_id?: number;
    subtract?: number;
    minimum?: number;
    sort_order?: number;
    viewed?: number;
    date_added: string;
    date_modified: string;
    import_batch?: string | null;
    maximum?: number;
    stock_status_id?: number;

    // English description fields
    name_en?: string;
    description_en?: string;
    tag_en?: string;
    meta_title_en?: string;
    meta_description_en?: string;
    meta_keyword_en?: string;
    video_en?: string;
    html_product_tab_en?: string;
    tab_title_en?: string;

    // Arabic description fields
    name_ar?: string;
    description_ar?: string;
    tag_ar?: string;
    meta_title_ar?: string;
    meta_description_ar?: string;
    meta_keyword_ar?: string;
    video_ar?: string;
    html_product_tab_ar?: string;
    tab_title_ar?: string;

    // Related data from show endpoint
    categories?: Array<{
        category_id: number;
        name_en?: string;
        name_ar?: string;
    }>;
    images?: Array<{
        product_image_id: number;
        image: string;
        sort_order: number;
    }>;
}

export interface AdminProductsParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: number | null;
    category_id?: number;
}

export interface CreateProductPayload {
    // Core product fields (required)
    model: string;
    price: number;
    quantity: number;
    status: boolean;

    // Core product fields (optional)
    sku?: string;
    upc?: string;
    ean?: string;
    jan?: string;
    isbn?: string;
    mpn?: string;
    location?: string;
    stock_status_id?: number;
    image?: string | File;  // Can be string path or File for upload
    additional_images?: File[];  // Array of files for additional images
    manufacturer_id?: number;
    shipping?: number;
    points?: number;
    tax_class_id?: number;
    date_available?: string;
    weight?: number;
    weight_class_id?: number;
    length?: number;
    width?: number;
    height?: number;
    length_class_id?: number;
    subtract?: number;
    minimum?: number;
    sort_order?: number;
    import_batch?: string | null;
    maximum?: number;
    store_id?: number;

    // English fields (name_en is required)
    name_en: string;
    description_en?: string;
    tag_en?: string;
    meta_title_en?: string;
    meta_description_en?: string;
    meta_keyword_en?: string;
    video_en?: string;
    html_product_tab_en?: string;
    tab_title_en?: string;

    // Arabic fields (all optional)
    name_ar?: string;
    description_ar?: string;
    tag_ar?: string;
    meta_title_ar?: string;
    meta_description_ar?: string;
    meta_keyword_ar?: string;
    video_ar?: string;
    html_product_tab_ar?: string;
    tab_title_ar?: string;

    // Category IDs
    category_ids?: number[];
}

export interface UpdateProductPayload {
    id: number;
    data: {
        // Core product fields (optional - 'sometimes' validation in controller)
        model?: string;
        price?: number;
        quantity?: number;
        status?: boolean;

        // Other product fields (optional)
        sku?: string;
        upc?: string;
        ean?: string;
        jan?: string;
        isbn?: string;
        mpn?: string;
        location?: string;
        stock_status_id?: number;
        image?: string | File;  // Can be string path or File for upload
        additional_images?: File[];  // Array of files for additional images
        manufacturer_id?: number;
        shipping?: number;
        points?: number;
        tax_class_id?: number;
        date_available?: string;
        weight?: number;
        weight_class_id?: number;
        length?: number;
        width?: number;
        height?: number;
        length_class_id?: number;
        subtract?: number;
        minimum?: number;
        sort_order?: number;
        import_batch?: string | null;
        maximum?: number;

        // English fields (optional - 'sometimes' validation in controller)
        name_en?: string;
        description_en?: string;
        tag_en?: string;
        meta_title_en?: string;
        meta_description_en?: string;
        meta_keyword_en?: string;
        video_en?: string;
        html_product_tab_en?: string;
        tab_title_en?: string;

        // Arabic fields (optional)
        name_ar?: string;
        description_ar?: string;
        tag_ar?: string;
        meta_title_ar?: string;
        meta_description_ar?: string;
        meta_keyword_ar?: string;
        video_ar?: string;
        html_product_tab_ar?: string;
        tab_title_ar?: string;

        // Category IDs
        category_ids?: number[];
    };
}

// Helper function to convert payload to FormData
function createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (key === 'image' && value instanceof File) {
            formData.append('image', value);
        } else if (key === 'additional_images' && Array.isArray(value)) {
            value.forEach((file: File) => {
                if (file instanceof File) {
                    formData.append('additional_images[]', file);
                }
            });
        } else if (key === 'category_ids' && Array.isArray(value)) {
            value.forEach((id: number) => {
                formData.append('category_ids[]', id.toString());
            });
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
    if (data.image instanceof File) return true;
    if (Array.isArray(data.additional_images) && data.additional_images.some((f: any) => f instanceof File)) return true;
    return false;
}

export interface BulkUpdateStatusPayload {
    ids: number[];
    status: boolean;
}

export interface BulkUpdatePricePayload {
    ids: number[];
    price: number;
}

export interface BulkUpdateStockPayload {
    ids: number[];
    quantity: number;
}

export interface BulkDeletePayload {
    ids: number[];
}

export interface AdminProductsState extends EntityState<AdminProduct, number> {
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

// Entity Adapter
const adminProductsAdapter = createEntityAdapter<AdminProduct, number>({
    selectId: (product) => product.product_id,
    sortComparer: (a, b) =>
        new Date(b.date_added).getTime() - new Date(a.date_added).getTime(),
});

const initialState: AdminProductsState = adminProductsAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminProductsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all products (admin) - with bilingual descriptions
        getAdminProducts: builder.query<AdminProductsState, AdminProductsParams>({
            query: (params) => ({
                url: '/admin/products',
                params,
            }),
            transformResponse: (response: any): AdminProductsState => {
                // Response structure: { success: true, data: { data: [...], current_page, last_page, ... } }
                const paginatedData = response.data;
                const products = paginatedData.data || [];
                const state = adminProductsAdapter.setAll(initialState, products);
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
                        ...result.ids.map((id) => ({ type: 'AdminProduct' as const, id })),
                        { type: 'AdminProduct' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminProduct' as const, id: 'LIST' }],
        }),

        // Get single product (admin) - with bilingual descriptions, categories, and images
        getAdminProduct: builder.query<AdminProduct, number>({
            query: (id) => `/admin/products/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminProduct' as const, id }],
        }),

        // Create product with bilingual descriptions and image upload support
        createAdminProduct: builder.mutation<AdminProduct, CreateProductPayload>({
            query: (data) => {
                const useFormData = hasFiles(data);
                return {
                    url: '/admin/products',
                    method: 'POST',
                    body: useFormData ? createFormData(data) : data,
                    // Don't set Content-Type header for FormData - browser will set it with boundary
                    formData: useFormData,
                };
            },
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminProduct' as const, id: 'LIST' }],
        }),

        // Update product with bilingual descriptions and image upload support
        updateAdminProduct: builder.mutation<AdminProduct, UpdateProductPayload>({
            query: ({ id, data }) => {
                const useFormData = hasFiles(data);
                const body = useFormData ? createFormData(data) : data;

                // For FormData with PUT, we need to use POST with _method override
                if (useFormData) {
                    (body as FormData).append('_method', 'PUT');
                    return {
                        url: `/admin/products/${id}`,
                        method: 'POST',
                        body,
                        formData: true,
                    };
                }

                return {
                    url: `/admin/products/${id}`,
                    method: 'PUT',
                    body,
                };
            },
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminProduct' as const, id },
                { type: 'AdminProduct' as const, id: 'LIST' },
            ],
        }),

        // Delete product
        deleteAdminProduct: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({
                url: `/admin/products/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminProduct' as const, id },
                { type: 'AdminProduct' as const, id: 'LIST' },
            ],
        }),

        // Bulk delete products
        bulkDeleteAdminProducts: builder.mutation<{ success: boolean; message: string }, BulkDeletePayload>({
            query: (data) => ({
                url: '/admin/products/bulk-delete',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminProduct' as const, id: 'LIST' }],
        }),

        // Bulk update product status
        bulkUpdateAdminProductsStatus: builder.mutation<{ success: boolean; message: string }, BulkUpdateStatusPayload>({
            query: (data) => ({
                url: '/admin/products/bulk-update-status',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminProduct' as const, id: 'LIST' }],
        }),

        // Bulk update product price
        bulkUpdateAdminProductsPrice: builder.mutation<{ success: boolean; message: string }, BulkUpdatePricePayload>({
            query: (data) => ({
                url: '/admin/products/bulk-update-price',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminProduct' as const, id: 'LIST' }],
        }),

        // Bulk update product stock
        bulkUpdateAdminProductsStock: builder.mutation<{ success: boolean; message: string }, BulkUpdateStockPayload>({
            query: (data) => ({
                url: '/admin/products/bulk-update-stock',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'AdminProduct' as const, id: 'LIST' }],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminProductsQuery,
    useLazyGetAdminProductsQuery,
    useGetAdminProductQuery,
    useCreateAdminProductMutation,
    useUpdateAdminProductMutation,
    useDeleteAdminProductMutation,
    useBulkDeleteAdminProductsMutation,
    useBulkUpdateAdminProductsStatusMutation,
    useBulkUpdateAdminProductsPriceMutation,
    useBulkUpdateAdminProductsStockMutation,
} = adminProductsSlice;

// Selectors
export const {
    selectAll: selectAllAdminProducts,
    selectById: selectAdminProductById,
    selectIds: selectAdminProductIds,
} = adminProductsAdapter.getSelectors<RootState>(
    (state) =>
        adminProductsSlice.endpoints.getAdminProducts.select({})(state).data || initialState
);

export default adminProductsSlice;
