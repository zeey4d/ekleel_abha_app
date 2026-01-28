import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface TaxClass {
    tax_class_id: number;
    title: string;
    description: string;
    date_added: string;
    date_modified: string;
}

export interface TaxRate {
    tax_rate_id: number;
    geo_zone_id: number;
    name: string;
    rate: number;
    type: 'P' | 'F';
    date_added: string;
    date_modified: string;
    geo_zone_name?: string;
}

export interface TaxRule {
    tax_rule_id: number;
    tax_class_id: number;
    tax_rate_id: number;
    based: string;
    priority: number;
}

export interface TaxesParams {
    page?: number;
    per_page?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface TaxClassesState extends EntityState<TaxClass, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

export interface TaxRatesState extends EntityState<TaxRate, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

// Adapters
const taxClassesAdapter = createEntityAdapter<TaxClass, number>({
    selectId: (taxClass) => taxClass.tax_class_id,
    sortComparer: (a, b) => a.title.localeCompare(b.title),
});

const taxRatesAdapter = createEntityAdapter<TaxRate, number>({
    selectId: (taxRate) => taxRate.tax_rate_id,
    sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const initialTaxClassesState: TaxClassesState = taxClassesAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

const initialTaxRatesState: TaxRatesState = taxRatesAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminTaxesSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Tax Classes
        getTaxClasses: builder.query<TaxClassesState, TaxesParams>({
            query: (params) => ({
                url: '/admin/tax-classes',
                params,
            }),
            transformResponse: (response: any) => {
                const state = taxClassesAdapter.setAll(initialTaxClassesState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'TaxClass' as const, id })),
                        { type: 'TaxClass' as const, id: 'LIST' },
                    ]
                    : [{ type: 'TaxClass' as const, id: 'LIST' }],
        }),

        getTaxClass: builder.query<TaxClass, number>({
            query: (id) => `/admin/tax-classes/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'TaxClass' as const, id }],
        }),

        createTaxClass: builder.mutation<TaxClass, Partial<TaxClass>>({
            query: (data) => ({
                url: '/admin/tax-classes',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'TaxClass' as const, id: 'LIST' }],
        }),

        updateTaxClass: builder.mutation<TaxClass, { id: number; data: Partial<TaxClass> }>({
            query: ({ id, data }) => ({
                url: `/admin/tax-classes/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'TaxClass' as const, id },
                { type: 'TaxClass' as const, id: 'LIST' },
            ],
        }),

        deleteTaxClass: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/tax-classes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'TaxClass' as const, id: 'LIST' }],
        }),

        // Tax Rates
        getTaxRates: builder.query<TaxRatesState, TaxesParams>({
            query: (params) => ({
                url: '/admin/tax-rates',
                params,
            }),
            transformResponse: (response: any) => {
                const state = taxRatesAdapter.setAll(initialTaxRatesState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'TaxRate' as const, id })),
                        { type: 'TaxRate' as const, id: 'LIST' },
                    ]
                    : [{ type: 'TaxRate' as const, id: 'LIST' }],
        }),

        getTaxRate: builder.query<TaxRate, number>({
            query: (id) => `/admin/tax-rates/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'TaxRate' as const, id }],
        }),

        createTaxRate: builder.mutation<TaxRate, Partial<TaxRate>>({
            query: (data) => ({
                url: '/admin/tax-rates',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'TaxRate' as const, id: 'LIST' }],
        }),

        updateTaxRate: builder.mutation<TaxRate, { id: number; data: Partial<TaxRate> }>({
            query: ({ id, data }) => ({
                url: `/admin/tax-rates/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'TaxRate' as const, id },
                { type: 'TaxRate' as const, id: 'LIST' },
            ],
        }),

        deleteTaxRate: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/tax-rates/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'TaxRate' as const, id: 'LIST' }],
        }),
    }),
});

export const {
    useGetTaxClassesQuery,
    useGetTaxClassQuery,
    useCreateTaxClassMutation,
    useUpdateTaxClassMutation,
    useDeleteTaxClassMutation,
    useGetTaxRatesQuery,
    useGetTaxRateQuery,
    useCreateTaxRateMutation,
    useUpdateTaxRateMutation,
    useDeleteTaxRateMutation,
} = adminTaxesSlice;

export const {
    selectAll: selectAllTaxClasses,
    selectById: selectTaxClassById,
} = taxClassesAdapter.getSelectors<RootState>(
    (state) => adminTaxesSlice.endpoints.getTaxClasses.select({})(state).data || initialTaxClassesState
);

export const {
    selectAll: selectAllTaxRates,
    selectById: selectTaxRateById,
} = taxRatesAdapter.getSelectors<RootState>(
    (state) => adminTaxesSlice.endpoints.getTaxRates.select({})(state).data || initialTaxRatesState
);

export default adminTaxesSlice;
