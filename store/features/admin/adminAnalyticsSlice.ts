// store/features/admin/adminAnalyticsSlice.ts
import { apiSlice } from '../api/apiSlice';

// Types
export interface DashboardStats {
    total_sales: number;
    total_orders: number;
    total_customers: number;
    total_products: number;
    pending_orders: number;
    low_stock_products: number;
    recent_orders: Array<{
        order_id: number;
        customer_name: string;
        total: number;
        status: string;
        date_added: string;
    }>;
    top_products: Array<{
        product_id: number;
        name: string;
        total_sold: number;
        revenue: number;
    }>;
    sales_chart: Array<{
        date: string;
        sales: number;
        orders: number;
    }>;
}

export interface SalesReport {
    period: string;
    total_sales: number;
    total_orders: number;
    average_order_value: number;
    total_tax: number;
    total_shipping: number;
    sales_by_day: Array<{
        date: string;
        sales: number;
        orders: number;
    }>;
    sales_by_product: Array<{
        product_id: number;
        product_name: string;
        quantity: number;
        total: number;
    }>;
    sales_by_category: Array<{
        category_id: number;
        category_name: string;
        total: number;
    }>;
}

export interface CustomerReport {
    total_customers: number;
    new_customers: number;
    active_customers: number;
    customers_by_group: Array<{
        group_id: number;
        group_name: string;
        count: number;
    }>;
    top_customers: Array<{
        customer_id: number;
        name: string;
        email: string;
        total_orders: number;
        total_spent: number;
    }>;
}

export interface ProductReport {
    total_products: number;
    active_products: number;
    out_of_stock: number;
    low_stock: number;
    products_by_category: Array<{
        category_id: number;
        category_name: string;
        count: number;
    }>;
    most_viewed: Array<{
        product_id: number;
        name: string;
        views: number;
    }>;
}

export interface AnalyticsParams {
    date_from?: string;
    date_to?: string;
    period?: 'day' | 'week' | 'month' | 'year';
}

// API Slice
export const adminAnalyticsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get dashboard statistics
        getDashboardStats: builder.query<DashboardStats, AnalyticsParams | undefined>({
            query: (params) => ({
                url: '/admin/analytics/dashboard',
                params: params || undefined,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminAnalytics' as const, id: 'DASHBOARD' }],
        }),

        // Get sales report
        getSalesReport: builder.query<SalesReport, AnalyticsParams>({
            query: (params) => ({
                url: '/admin/analytics/sales',
                params,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminAnalytics' as const, id: 'SALES' }],
        }),

        // Get customer report
        getCustomerReport: builder.query<CustomerReport, AnalyticsParams>({
            query: (params) => ({
                url: '/admin/analytics/customers',
                params,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminAnalytics' as const, id: 'CUSTOMERS' }],
        }),

        // Get product report
        getProductReport: builder.query<ProductReport, AnalyticsParams>({
            query: (params) => ({
                url: '/admin/analytics/products',
                params,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminAnalytics' as const, id: 'PRODUCTS' }],
        }),

        // Export sales report
        exportSalesReport: builder.mutation<Blob, AnalyticsParams & { format: 'csv' | 'excel' | 'pdf' }>({
            query: (params) => ({
                url: '/admin/analytics/sales/export',
                method: 'POST',
                body: params,
                responseHandler: (response) => response.blob(),
            }),
        }),
    }),
});

// Export hooks
export const {
    useGetDashboardStatsQuery,
    useGetSalesReportQuery,
    useGetCustomerReportQuery,
    useGetProductReportQuery,
    useExportSalesReportMutation,
} = adminAnalyticsSlice;

export default adminAnalyticsSlice;
