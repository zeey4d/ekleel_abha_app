// src/features/loyaltyPoint/loyaltyPointSlice.ts
import { createSelector } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// --- Types ---

export interface LoyaltyPointSummary {
    balance: number;
    total_earned: number;
    total_redeemed: number;
    pending_points: number;
    [key: string]: any;
}

export interface LoyaltyTransaction {
    id: number;
    customer_id: number;
    points: number;
    type: 'earn' | 'redeem' | 'adjustment';
    description?: string;
    order_id?: number;
    balance_after: number;
    created_at: string;
    [key: string]: any;
}

export interface LoyaltyHistoryFilters {
    type?: 'earn' | 'redeem' | 'adjustment';
    date_from?: string;
    date_to?: string;
    per_page?: number;
    page?: number;
}

export interface LoyaltyHistoryResponse {
    transactions: LoyaltyTransaction[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface LoyaltyCalculateResponse {
    order_amount: number;
    points_earned: number;
    rate_info: {
        spend_amount: number;
        earn_amount: number;
        description: string;
    };
}

export interface LoyaltyRedeemPayload {
    amount: number;
    order_id?: number;
}

export interface LoyaltyRedeemResponse {
    message: string;
    transaction: LoyaltyTransaction;
    new_balance: number;
}

// --- RTK Query API Slice Injection ---
export const loyaltyPointSlice = apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({

        // --- Get Loyalty Points Balance & Summary ---
        // GET /api/v1/loyalty-points/balance
        getLoyaltyBalance: builder.query<LoyaltyPointSummary, void>({
            query: () => '/loyalty-points/balance',
            transformResponse: (response: any): LoyaltyPointSummary => {
                return response.data || response;
            },
            providesTags: [{ type: 'LoyaltyPoint' as const, id: 'BALANCE' }],
            keepUnusedDataFor: 300, // 5 minutes
        }),

        // --- Get Loyalty Points History ---
        // GET /api/v1/loyalty-points/history?type=earn|redeem|adjustment&date_from=&date_to=&per_page=15
        getLoyaltyHistory: builder.query<LoyaltyHistoryResponse, LoyaltyHistoryFilters>({
            query: (filters = {}) => {
                const params = new URLSearchParams();
                if (filters.type) params.append('type', filters.type);
                if (filters.date_from) params.append('date_from', filters.date_from);
                if (filters.date_to) params.append('date_to', filters.date_to);
                if (filters.per_page) params.append('per_page', filters.per_page.toString());
                if (filters.page) params.append('page', filters.page.toString());
                const queryString = params.toString();
                return `/loyalty-points/history${queryString ? `?${queryString}` : ''}`;
            },
            transformResponse: (response: any): LoyaltyHistoryResponse => {
                const data = response.data || {};
                return {
                    transactions: data.transactions || [],
                    pagination: data.pagination || {
                        current_page: 1,
                        last_page: 1,
                        per_page: 15,
                        total: 0,
                    },
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.transactions.map((t) => ({ type: 'LoyaltyPoint' as const, id: t.id })),
                        { type: 'LoyaltyPoint' as const, id: 'HISTORY' },
                    ]
                    : [{ type: 'LoyaltyPoint' as const, id: 'HISTORY' }],
            keepUnusedDataFor: 300,
        }),

        // --- Calculate Potential Loyalty Points ---
        // GET /api/v1/loyalty-points/calculate?amount=500
        calculateLoyaltyPoints: builder.query<LoyaltyCalculateResponse, number>({
            query: (amount) => `/loyalty-points/calculate?amount=${amount}`,
            transformResponse: (response: any): LoyaltyCalculateResponse => {
                return response.data || response;
            },
            keepUnusedDataFor: 600, // 10 minutes — rate info is fairly static
        }),

        // --- Redeem Loyalty Points ---
        // POST /api/v1/loyalty-points/redeem  { amount, order_id? }
        redeemLoyaltyPoints: builder.mutation<LoyaltyRedeemResponse, LoyaltyRedeemPayload>({
            query: (body) => ({
                url: '/loyalty-points/redeem',
                method: 'POST',
                body,
            }),
            transformResponse: (response: any): LoyaltyRedeemResponse => {
                return {
                    message: response.message || 'Loyalty points redeemed successfully',
                    transaction: response.data?.transaction || response.transaction,
                    new_balance: response.data?.new_balance ?? response.new_balance,
                };
            },
            invalidatesTags: [
                { type: 'LoyaltyPoint' as const, id: 'BALANCE' },
                { type: 'LoyaltyPoint' as const, id: 'HISTORY' },
            ],
        }),
    }),
});

// --- Export auto-generated hooks ---
export const {
    useGetLoyaltyBalanceQuery,
    useGetLoyaltyHistoryQuery,
    useCalculateLoyaltyPointsQuery,
    useRedeemLoyaltyPointsMutation,
} = loyaltyPointSlice;

// --- Memoized Selectors ---

// Selector for loyalty balance
export const selectLoyaltyBalance = createSelector(
    [(state: RootState) => loyaltyPointSlice.endpoints.getLoyaltyBalance.select()(state)],
    (result) => result.data || null
);

// Selector for current points balance (just the number)
export const selectCurrentPoints = createSelector(
    [selectLoyaltyBalance],
    (summary) => summary?.balance ?? 0
);

// Selector for loyalty history transactions
export const selectLoyaltyTransactions = createSelector(
    [(state: RootState, filters: LoyaltyHistoryFilters) =>
        loyaltyPointSlice.endpoints.getLoyaltyHistory.select(filters)(state)],
    (result) => result.data?.transactions || []
);

// Selector for loyalty history pagination
export const selectLoyaltyHistoryPagination = (state: RootState, filters: LoyaltyHistoryFilters) => {
    const result = loyaltyPointSlice.endpoints.getLoyaltyHistory.select(filters)(state);
    return result.data?.pagination || null;
};

export default loyaltyPointSlice;
