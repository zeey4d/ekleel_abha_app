// src/features/products/productsSlice.ts
import { createSelector, createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";
import { RootState } from "@/store/store";

// --- Types ---
export interface Product {
  id: string | number;
  name: string;
  name_ar?: string;
  name_en?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  model?: string;
  price: number;
  final_price: number;
  is_on_sale: boolean;
  discount_percentage: number;
  quantity: number;
  image?: string;
  manufacturer?: string;
  in_stock: boolean;
  average_rating: number;
  review_count: number;
  date_added?: string;
  sku?: string;
  brand?: {
    id: number;
    name: string;
    image?: string;
  } | string;
  images?: string[]; // Array of strings for gallery
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  categories?: Array<{
    id: number;
    name: string;
  }>;
  viewed?: number;
  total_sold?: number;
  [key: string]: any; // Additional product properties
}

export interface GetProductsParams {
  category?: number | null;
  min_price?: number | null;
  max_price?: number | null;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'best_selling';
  page?: number;
  per_page?: number;
  brand?: string | null;
}

export interface GetProductsResponse {
  data: Product[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
  filters?: {
    category?: {
      id: number;
      name: string;
    };
    price_range?: {
      min: number;
      max: number;
    };
  };
}

export interface ProductState extends EntityState<Product, string | number> {
  loading: boolean;
  error: string | null;
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
  filters?: {
    category?: {
      id: number;
      name: string;
    };
    price_range?: {
      min: number;
      max: number;
    };
  };
}

// --- Entity Adapter for Normalization ---
const productsAdapter = createEntityAdapter<Product, string | number>({
  selectId: (product: Product) => product.id,
  // Sort by date_added descending (newest first)
  sortComparer: (a: Product, b: Product) => {
    if (a.date_added && b.date_added) {
      return new Date(b.date_added).getTime() - new Date(a.date_added).getTime();
    }
    return 0;
  },
});

const initialState: ProductState = productsAdapter.getInitialState({
  loading: false,
  error: null,
  pagination: undefined,
  filters: undefined,
});

// --- RTK Query API Slice Injection ---
export const productsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Get All Products with Filters ---
    getProducts: builder.query<ProductState, GetProductsParams>({
      query: ({
        category = null,
        min_price = null,
        max_price = null,
        sort = "newest",
        page = 1,
        per_page = 20,
        brand = null,
      }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          per_page: per_page.toString(),
          sort,
        });

        if (category !== null) params.append("category", category.toString());
        if (min_price !== null) params.append("min_price", min_price.toString());
        if (max_price !== null) params.append("max_price", max_price.toString());
        if (brand) params.append("brand", brand);

        return `/products?${params.toString()}`;
      },
      transformResponse: (responseData: GetProductsResponse): ProductState => {
        // Normalize the array response
        const state = productsAdapter.setAll(initialState, responseData.data);

        // Add pagination and filters info
        return {
          ...state,
          pagination: responseData.pagination,
          filters: responseData.filters,
        };
      },
      providesTags: (result, error, arg) =>
        result
          ? [
            ...result.ids.map((id) => ({ type: "Product" as const, id })),
            { type: "Product" as const, id: "LIST" },
          ]
          : [{ type: "Product" as const, id: "LIST" }],
    }),

    // --- Get Single Product by ID ---
    getProductById: builder.query<Product, string | number>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product" as const, id }],
      keepUnusedDataFor: 300, // Keep for 5 minutes
    }),

    // --- Get Related Products ---
    getRelatedProducts: builder.query<Product[], string | number>({
      query: (productId) => `/products/related/${productId}`,
      transformResponse: (responseData: { data: Product[] }): Product[] => {
        return responseData.data;
      },
      providesTags: (result, error, productId) => [
        { type: "Product" as const, id: `RELATED_${productId}` },
      ],
      keepUnusedDataFor: 300,
    }),

    // --- Get Similar Products ---
    getSimilarProducts: builder.query<Product[], string | number>({
      query: (productId) => `/products/similar/${productId}`,
      transformResponse: (responseData: { data: Product[] }): Product[] => {
        return responseData.data;
      },
      providesTags: (result, error, productId) => [
        { type: "Product" as const, id: `SIMILAR_${productId}` },
      ],
      keepUnusedDataFor: 300,
    }),

    // --- Get Top Selling Products ---
    getTopProducts: builder.query<Product[], { per_page?: number }>({
      query: ({ per_page = 20 }) => `/products/top?per_page=${per_page}`,
      transformResponse: (responseData: any): Product[] => {
        return Array.isArray(responseData.data) ? responseData.data : [];
      },
      providesTags: [{ type: "Product" as const, id: "TOP" }],
      keepUnusedDataFor: 3600,
    }),

    // --- Get New Arrival Products ---
    getNewProducts: builder.query<Product[], { per_page?: number }>({
      query: ({ per_page = 20 }) => `/products/new?per_page=${per_page}`,
      transformResponse: (responseData: any): Product[] => {
        return Array.isArray(responseData.data) ? responseData.data : [];
      },
      providesTags: [{ type: "Product" as const, id: "NEW" }],
      keepUnusedDataFor: 3600,
    }),

    // --- Get Products on Deal ---
    getDealsProducts: builder.query<Product[], { per_page?: number; category?: number }>({
      query: ({ per_page = 10, category }) => {
        const params = new URLSearchParams({ limit: per_page.toString() });
        if (category) params.append('category', category.toString());
        return `/products/deals?${params.toString()}`;
      },
      transformResponse: (responseData: { data: Product[]; meta?: any }): Product[] => {
        return responseData.data || [];
      },
      providesTags: [{ type: "Product" as const, id: "DEALS" }],
      keepUnusedDataFor: 3600,
    }),
  }),
});

// Export auto-generated hooks
export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetRelatedProductsQuery,
  useGetSimilarProductsQuery,
  useGetTopProductsQuery,
  useGetNewProductsQuery,
  useGetDealsProductsQuery,
} = productsSlice;

// --- Memoized Selectors ---
// Selector for the normalized result of getProducts
const selectProductsResult = productsSlice.endpoints.getProducts.select({});

// Creates a selector that returns the normalized data object { ids: [...], entities: {...} }
const selectProductsData = createSelector(
  [selectProductsResult],
  (productsResult) => productsResult.data ?? initialState
);

// Export selectors from the adapter
export const {
  selectAll: selectAllProducts,
  selectById: selectProductById,
  selectIds: selectProductIds,
} = productsAdapter.getSelectors<RootState>(
  (state) => selectProductsData(state) ?? initialState
);

// --- Custom Memoized Selectors ---
// Select best sellers (top products)
export const selectBestSellers = (state: RootState) => {
  const topProductsResult =
    productsSlice.endpoints.getTopProducts.select({ per_page: 10 })(state);
  return topProductsResult?.data || [];
};

// Select today's deals
export const selectTodayDeals = (state: RootState) => {
  const dealsResult = productsSlice.endpoints.getDealsProducts.select({ per_page: 10 })(state);
  return dealsResult?.data || [];
};

// Select new arrivals
export const selectNewArrivals = (state: RootState) => {
  const newProductsResult =
    productsSlice.endpoints.getNewProducts.select({ per_page: 10 })(state);
  return newProductsResult?.data || [];
};

// Select products on sale
export const selectProductsOnSale = createSelector(
  [selectAllProducts],
  (products) =>
    products.filter(
      (product) =>
        product.is_on_sale
    )
);

// Select related products for a given product ID
export const selectRelatedProducts = (productId: string | number) =>
  createSelector(
    [
      (state: RootState) =>
        productsSlice.endpoints.getRelatedProducts.select(productId)(state),
    ],
    (result) => result.data || []
  );

// Select similar products for a given product ID
export const selectSimilarProducts = (productId: string | number) =>
  createSelector(
    [
      (state: RootState) =>
        productsSlice.endpoints.getSimilarProducts.select(productId)(state),
    ],
    (result) => result.data || []
  );

// Select product loading state
export const selectProductLoading = (productId: string | number) =>
  createSelector(
    [
      (state: RootState) =>
        productsSlice.endpoints.getProductById.select(productId)(state),
    ],
    (result) => result.isLoading
  );

// Select product error state
export const selectProductError = (productId: string | number) =>
  createSelector(
    [
      (state: RootState) =>
        productsSlice.endpoints.getProductById.select(productId)(state),
    ],
    (result) => result.error
  );

// Select pagination info
export const selectProductsPagination = (state: RootState) => {
  const productsResult = selectProductsResult(state);
  return productsResult.data?.pagination;
};

export default productsSlice;