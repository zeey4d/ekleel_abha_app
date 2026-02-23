
import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";
import { Product, GetProductsParams, GetProductsResponse } from "./productsSlice";

// --- Types ---
export interface InfiniteProductState extends EntityState<Product, string | number> {
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

// --- Entity Adapter ---
// No sortComparer ensures we respect server return order (important for various sort filters)
const infiniteProductsAdapter = createEntityAdapter<Product, string | number>({
  selectId: (product) => product.id,
});

const initialState: InfiniteProductState = infiniteProductsAdapter.getInitialState({
  pagination: undefined,
});

// --- API Slice Injection ---
export const infiniteProductsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInfiniteProducts: builder.query<InfiniteProductState, GetProductsParams>({
      query: ({
        category = null,
        min_price = null,
        max_price = null,
        sort = "newest",
        page = 1,
        per_page = 20,
        brand = null,
        search = null,
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
        if (search) params.append("search", search);

        return `/products?${params.toString()}`;
      },
      serializeQueryArgs: ({ queryArgs }) => {
        // Omit 'page' from the cache key so all pages merge into one entry
        const { page, ...others } = queryArgs;
        return others;
      },
      transformResponse: (responseData: GetProductsResponse): InfiniteProductState => {
        // Return a shape compatible with the adapter state
        // We temporarily create a state to extract entities, or just return the data structure needed for merge
        // But transformResponse must return the ResultType (InfiniteProductState)
        
        // This is tricky because merge receives (currentCache, newItems).
        // newItems comes from THIS transformResponse.
        
        const state = infiniteProductsAdapter.setAll(initialState, responseData.data);
        return {
            ...state,
            pagination: responseData.pagination
        };
      },
      merge: (currentCache, newItems, { arg }) => {
        // If it's the first page, replace the cache
        if (arg.page === 1) {
            // We can't just assign, we need to update the draft
            infiniteProductsAdapter.setAll(currentCache, Object.values(newItems.entities) as Product[]);
            currentCache.pagination = newItems.pagination;
        } else {
            // Append new items
            infiniteProductsAdapter.addMany(currentCache, Object.values(newItems.entities) as Product[]);
            currentCache.pagination = newItems.pagination;
        }
      },
      // Refetch if the page arg changes (handled by infinite scroll logic component usually calling refetch or changing page)
      // But since we use serializeQueryArgs, we need to be careful.
      // Changing 'page' arg WILL trigger a fetch because forceRefetch default behavior checks args. 
      // BUT serializeQueryArgs makes them share the key.
      // So we need forceRefetch to return true when page changes.
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      providesTags: (result) => 
        result
          ? [
              ...result.ids.map((id) => ({ type: "Product" as const, id })),
              { type: "Product" as const, id: "INFINITE_LIST" },
            ]
          : [{ type: "Product" as const, id: "INFINITE_LIST" }],
      
      // Keep for 5 minutes
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetInfiniteProductsQuery } = infiniteProductsSlice;

export default infiniteProductsSlice;
