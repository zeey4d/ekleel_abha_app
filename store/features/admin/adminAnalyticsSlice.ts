// store/features/admin/adminAnalyticsSlice.ts
import { apiSlice } from '../api/apiSlice';

// --- Types --- //

export interface ChartDataset {
    name: string;
    data: number[];
}

export interface ChartData {
    title: string;
    type: string;
    labels: string[];
    datasets: ChartDataset[];
}

// ── Dashboard Types ── //
export interface DashboardStats {
    total_sales: number;
    total_orders: number;
    total_customers: number;
    total_products: number;
    pending_orders: number;
    low_stock_products: {
        count: number;
        list: Array<{
            product_id: number;
            name: string;
            model: string;
            quantity: number;
            image: string | null;
        }>;
    };
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
    sales_chart: {
        labels: string[];
        datasets: ChartDataset[];
    };
    charts: {
        area_chart: ChartData;
        pie_chart: {
            title: string;
            type: string;
            sales_by_category: PieChartData;
            orders_by_status: PieChartData;
            orders_by_payment: PieChartData;
            orders_by_city: PieChartData;
        };
        radial_chart: {
            title: string;
            type: string;
            gauges: RadialGauge[];
        };
    };
}

// ── Charts Endpoint Types ── //
export interface PieChartData {
    labels: string[];
    data: number[];
}

export interface RadialGauge {
    name: string;
    value: number;
    target: number | null;
    percent: number | null;
    growth: number | null;
    unit: string;
}

// ── Sales Report Types ── //
export interface SalesReport {
    period: string;
    total_sales: number;
    total_orders: number;
    average_order_value: number;
    total_tax: number;
    total_shipping: number;
    total_coupon_discount: number;
    sales_over_time: {
        labels: string[];
        datasets: ChartDataset[];
    };
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
    charts: {
        area_chart: ChartData;
        bar_chart: ChartData;
        radar_chart: ChartData;
    };
}

// ── Customer Report Types ── //
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
    top_cities: Array<{
        city: string;
        count: number;
    }>;
    registration_trend: {
        labels: string[];
        data: number[];
    };
    charts: {
        line_chart: ChartData;
        radial_chart: {
            title: string;
            type: string;
            gauges: RadialGauge[];
        };
        cities_chart: ChartData;
    };
}

// ── Product Report Types ── //
export interface ProductReport {
    total_products: number;
    active_products: number;
    out_of_stock: number;
    low_stock: number;
    products_by_category: {
        labels: string[];
        data: number[];
        items: Array<{
            category_id: number;
            category_name: string;
            count: number;
        }>;
    };
    most_viewed: {
        labels: string[];
        data: number[];
        items: Array<{
            product_id: number;
            name: string;
            views: number;
        }>;
    };
    stock_distribution: Array<{
        name: string;
        value: number;
    }>;
    charts: {
        bar_chart: ChartData;
        radar_chart: ChartData;
    };
}

// ── Marketing Report Types ── //
export interface MarketingReport {
    total_discounts: number;
    total_coupons_used: number;
    affiliate_revenue: number;
    total_commissions: number;
    top_coupons: Array<{
        name: string;
        code: string;
        uses: number;
        total_discount: number;
    }>;
    marketing_campaigns: Array<{
        name: string;
        code: string;
        orders: number;
        revenue: number;
    }>;
    marketing_trend: {
        labels: string[];
        data_discount: number[];
        data_count: number[];
    };
    charts: {
        area_chart: ChartData;
        bar_chart: ChartData;
        pie_chart: {
            title: string;
            type: string;
            labels: string[];
            data: number[];
        };
        radial_chart: {
            title: string;
            type: string;
            gauges: RadialGauge[];
        };
    };
}

// ── Returns Report Types ── //
export interface ReturnsReport {
    total_returns: number;
    total_returned_qty: number;
    return_rate: number;
    opened_count: number;
    unopened_count: number;
    returns_by_reason: Array<{
        reason: string;
        count: number;
    }>;
    returns_by_status: Array<{
        status: string;
        count: number;
    }>;
    returns_by_action: Array<{
        action: string;
        count: number;
    }>;
    most_returned_products: Array<{
        product_id: number;
        name: string;
        count: number;
        total_qty: number;
    }>;
    top_return_customers: Array<{
        customer_id: number;
        name: string;
        email: string;
        return_count: number;
        total_qty: number;
    }>;
    returns_trend: {
        labels: string[];
        data: number[];
        qty: number[];
    };
    charts: {
        area_chart: ChartData;
        bar_chart: ChartData;
        pie_chart: {
            title: string;
            type: string;
            by_reason: PieChartData;
            by_status: PieChartData;
            opened_vs_unopened: PieChartData;
        };
        radial_chart: {
            title: string;
            type: string;
            gauges: RadialGauge[];
        };
    };
}

// ── Searches Report Types ── //
export interface SearchesReport {
    total_search_count: number;
    total_popular_keywords: number;
    total_nohits_keywords: number;
    zero_result_rate: number;
    popular_queries: Array<{
        keyword: string;
        count: number;
    }>;
    nohits_queries: Array<{
        keyword: string;
        count: number;
    }>;
    analytics_rules: Array<{
        name: string;
        type: string;
    }>;
    charts: {
        popular_bar_chart: ChartData;
        nohits_bar_chart: ChartData;
        pie_chart: {
            title: string;
            type: string;
            labels: string[];
            data: number[];
        };
        radial_chart: {
            title: string;
            type: string;
            gauges: RadialGauge[];
        };
    };
}

export interface AnalyticsParams {
    date_from?: string;
    date_to?: string;
    period?: 'day' | 'week' | 'month' | 'year';
    limit?: number;
}

export interface ExportParams extends AnalyticsParams {
    format: 'csv' | 'excel' | 'pdf';
}

// API Slice
export const adminAnalyticsSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get dashboard statistics
        getDashboardStats: builder.query<DashboardStats, AnalyticsParams | void>({
            query: (params) => ({
                url: '/admin/analytics/dashboard',
                params: params || undefined,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminAnalytics' as const, id: 'DASHBOARD' }],
        }),

        // Get sales report
        getSalesReport: builder.query<SalesReport, AnalyticsParams | void>({
            query: (params) => ({
                url: '/admin/analytics/sales',
                params: params || undefined,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminAnalytics' as const, id: 'SALES' }],
        }),

        // Get customer report
        getCustomerReport: builder.query<CustomerReport, AnalyticsParams | void>({
            query: (params) => ({
                url: '/admin/analytics/customers',
                params: params || undefined,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminAnalytics' as const, id: 'CUSTOMERS' }],
        }),

        // Get product report
        getProductReport: builder.query<ProductReport, AnalyticsParams | void>({
            query: (params) => ({
                url: '/admin/analytics/products',
                params: params || undefined,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminAnalytics' as const, id: 'PRODUCTS' }],
        }),

        // Get marketing report
        getMarketingReport: builder.query<MarketingReport, AnalyticsParams | void>({
            query: (params) => ({
                url: '/admin/analytics/marketing',
                params: params || undefined,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminAnalytics' as const, id: 'MARKETING' }],
        }),

        // Get returns report
        getReturnsReport: builder.query<ReturnsReport, AnalyticsParams | void>({
            query: (params) => ({
                url: '/admin/analytics/returns',
                params: params || undefined,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminAnalytics' as const, id: 'RETURNS' }],
        }),

        // Get searches report
        getSearchesReport: builder.query<SearchesReport, AnalyticsParams | void>({
            query: (params) => ({
                url: '/admin/analytics/searches',
                params: params || undefined,
            }),
            transformResponse: (response: any) => response.data,
            providesTags: [{ type: 'AdminAnalytics' as const, id: 'SEARCHES' }],
        }),

        // Export sales report
        exportSalesReport: builder.mutation<Blob, ExportParams>({
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
    useGetMarketingReportQuery,
    useGetReturnsReportQuery,
    useGetSearchesReportQuery,
    useExportSalesReportMutation,
} = adminAnalyticsSlice;

export default adminAnalyticsSlice;
