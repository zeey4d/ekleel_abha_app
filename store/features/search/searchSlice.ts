// src/features/search/searchSlice.ts
import { createSelector, createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";
import { RootState } from "@/store/store";

// --- Types ---
export interface Product {
  id: string | number;
  name_en?: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  price: number;
  final_price: number;
  stock_quantity?: number;
  quantity: number;
  rating?: number;
  review_count?: number;
  image?: string;
  main_image?: string;
  images?: string[];
  thumbnail?: string;
  model?: string;
  name: string; // Laravel controller returns this as the primary name
  on_sale: boolean;
  status: boolean;
  date_added: string;
  [key: string]: any; // Additional product properties
}

export interface FacetValue {
  value: string;
  count: number;
  [key: string]: any; // Additional facet properties
}

export interface Facet {
  field: string;
  values: FacetValue[];
  stats?: {
    count: number;
    min?: number;
    max?: number;
    avg?: number;
    sum?: number;
  };
}

export interface SearchFacets {
  [key: string]: Facet | undefined;
  categories?: Facet;
  brand?: Facet;
  price_range?: Facet;
  on_sale?: Facet;
  status?: Facet;
}

export interface SearchPagination {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface SearchParams {
  q?: string;
  page?: number;
  per_page?: number;
  categories?: string[];
  category_ids?: (string | number)[];
  brand?: string[];
  price_range?: string[];
  on_sale?: boolean | string | null;
  status?: boolean | string | null;
  sort_by?: 'price_asc' | 'price_desc' | 'date_added_desc' | 'date_added_asc' | 'relevance';
  min_price?: number | null;
  max_price?: number | null;
}

export interface AutocompleteParams {
  q: string;
  limit?: number;
}

export interface SearchResponse {
  success: boolean;
  data: {
    products: Product[];
    facets: SearchFacets;
    pagination: SearchPagination;
    search_time_ms?: number;
  };
}

export interface AutocompleteResponse {
  success: boolean;
  suggestions: Array<{
    id: string | number;
    name_en?: string;
    name_ar?: string;
    price: number;
    image?: string;
    main_image?: string;
  }>;
}

export interface SearchState extends EntityState<Product, string | number> {
  loading: boolean;
  error: string | null;
  facets: SearchFacets;
  pagination: SearchPagination;
  searchTimeMs: number;
  lastSearchQuery: string | null;
  suggestions: Array<{
    id: string | number;
    name_en?: string;
    name_ar?: string;
    price: number;
    image?: string;
    main_image?: string;
  }>;
}

// --- Entity Adapter for Search Results Normalization ---
const searchResultsAdapter = createEntityAdapter<Product, string | number>({
  selectId: (product: Product) => product.id,
  // Sort by relevance (maintain search order)
  sortComparer: false,
});

const initialState: SearchState = searchResultsAdapter.getInitialState({
  loading: false,
  error: null,
  facets: {},
  pagination: {
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
  },
  searchTimeMs: 0,
  lastSearchQuery: null,
  suggestions: [],
});

// --- RTK Query API Slice Injection ---
export const searchSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Main Search with Filters and Facets ---
    searchProducts: builder.query<SearchState, SearchParams>({
      query: ({
        q = "*",
        page = 1,
        per_page = 20,
        categories = [],
        category_ids = [],
        brand = [],
        price_range = [],
        on_sale = null,
        status = null,
        sort_by = "relevance",
        min_price = null,
        max_price = null,
      }) => {
        const params: Record<string, any> = {};

        // Search query
        if (q) params.q = q;

        // Pagination
        params.page = page;
        params.per_page = per_page;

        // Categories
        if (categories && categories.length > 0) {
          params.categories = categories;
        }

        // Category IDs
        if (category_ids && category_ids.length > 0) {
          params.category_ids = category_ids;
        }

        // Brands
        if (brand && brand.length > 0) {
          params.brand = brand;
        }

        // Price ranges
        if (price_range && price_range.length > 0) {
          params.price_range = price_range;
        }

        // Min/Max price
        if (min_price !== null) params.min_price = min_price;
        if (max_price !== null) params.max_price = max_price;

        // On sale filter
        if (on_sale !== null) params.on_sale = on_sale;

        // Status filter
        if (status !== null) params.status = status;

        // Sort by
        if (sort_by) params.sort_by = sort_by;

        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(`${key}[]`, v.toString()));
          } else {
            searchParams.append(key, value.toString());
          }
        });

        // FIX: Correct endpoint to match SearchController route
        return `/search/products?${searchParams.toString()}`;
      },
      // FIX: Unwrap the 'data' property here (matching pattern from cmsSlice)
      transformResponse: (response: SearchResponse): SearchState => {
        console.log('🔍 Search Raw Response:', response);

        if (!response.success) {
          console.error('❌ Search failed:', response);
          throw new Error('Search failed');
        }

        const data = response.data;
        const products = data?.products || [];

        console.log('🔍 Search Products:', products.length, 'items');
        console.log('🔍 Search Facets:', data?.facets);
        console.log('🔍 Search Pagination:', data?.pagination);

        // Normalize the products array using the adapter
        const normalizedState = searchResultsAdapter.setAll(
          initialState,
          products
        );

        const finalState = {
          ...normalizedState,
          facets: data?.facets || {},
          pagination: data?.pagination || initialState.pagination,
          searchTimeMs: data?.search_time_ms || 0,
        };

        console.log('✅ Final Search State:', finalState);

        return finalState;
      },
      providesTags: (result, error, arg) => {
        const tags: { type: "Search" | "Product"; id: string }[] = [{ type: "Search", id: "RESULTS" }];

        if (result && result.ids) {
          result.ids.forEach((id) => {
            tags.push({ type: "Product", id: id.toString() });
          });
        }

        return tags;
      },
      // Keep search results cached for 1 minute
      keepUnusedDataFor: 60,
    }),

    // --- Autocomplete Search ---
    autocomplete: builder.query<AutocompleteResponse['suggestions'], AutocompleteParams>({
      query: ({ q, limit = 5 }) => {
        const params = new URLSearchParams();
        params.append("q", q);
        params.append("limit", limit.toString());

        return `/search/autocomplete?${params.toString()}`;
      },
      transformResponse: (responseData: AutocompleteResponse): AutocompleteResponse['suggestions'] => {
        if (!responseData.success) {
          throw new Error('Autocomplete failed');
        }
        return responseData.suggestions || [];
      },
      providesTags: (result, error, arg) => [
        { type: "Search" as const, id: `AUTOCOMPLETE_${arg.q}` },
      ],
      // Keep autocomplete results cached for 2 minutes
      keepUnusedDataFor: 120,
    }),
  }),
});

// Export auto-generated hooks
export const {
  useSearchProductsQuery,
  useAutocompleteQuery,
  useLazySearchProductsQuery,
  useLazyAutocompleteQuery,
} = searchSlice;

// --- Selectors ---

// Selector for the search results
const selectSearchResult = (queryArgs: SearchParams) =>
  searchSlice.endpoints.searchProducts.select(queryArgs);

// Creates a selector that returns the normalized data
export const selectSearchData = (queryArgs: SearchParams) =>
  createSelector([selectSearchResult(queryArgs)], (searchResult) => {
    return searchResult.data ?? initialState;
  });

// Export selectors from the adapter - Using a default state selector
export const {
  selectAll: selectAllSearchResults,
  selectById: selectSearchResultById,
  selectIds: selectSearchResultIds,
} = searchResultsAdapter.getSelectors<RootState>(
  (state: RootState) => {
    // Since we can't determine which specific search result to return without queryArgs,
    // we return a default state or the last cached result if available
    // This is a limitation when using entity adapters with parameterized queries
    return initialState;
  }
);

// --- Custom Memoized Selectors ---

// Select search results for specific query
export const selectSearchResultsForQuery = (queryArgs: SearchParams) =>
  createSelector(
    [selectSearchData(queryArgs)],
    (searchState) => searchState.ids.map(id => searchState.entities[id]).filter(Boolean) as Product[]
  );

// Select search results by ID for specific query
export const selectSearchResultByIdForQuery = (queryArgs: SearchParams, id: string | number) =>
  createSelector(
    [selectSearchData(queryArgs)],
    (searchState) => searchState.entities[id] as Product | undefined
  );

// Select search results IDs for specific query
export const selectSearchResultIdsForQuery = (queryArgs: SearchParams) =>
  createSelector(
    [selectSearchData(queryArgs)],
    (searchState) => searchState.ids
  );

// Select search facets
export const selectSearchFacets = (queryArgs: SearchParams) =>
  createSelector([selectSearchResult(queryArgs)], (searchResult) => {
    return searchResult.data?.facets || {};
  });

// Select search pagination
export const selectSearchPagination = (queryArgs: SearchParams) =>
  createSelector([selectSearchResult(queryArgs)], (searchResult) => {
    return searchResult.data?.pagination || initialState.pagination;
  });

// Select search time
export const selectSearchTime = (queryArgs: SearchParams) =>
  createSelector([selectSearchResult(queryArgs)], (searchResult) => {
    return searchResult.data?.searchTimeMs || 0;
  });

// Select search loading state
export const selectSearchLoading = (queryArgs: SearchParams) =>
  createSelector([selectSearchResult(queryArgs)], (searchResult) => {
    return searchResult.isLoading;
  });

// Select search error state
export const selectSearchError = (queryArgs: SearchParams) =>
  createSelector([selectSearchResult(queryArgs)], (searchResult) => {
    return searchResult.error;
  });

// Select if search has results
export const selectHasSearchResults = (queryArgs: SearchParams) =>
  createSelector([selectSearchResult(queryArgs)], (searchResult) => {
    return (searchResult.data?.ids?.length || 0) > 0;
  });

// Select total search results count
export const selectSearchResultsCount = (queryArgs: SearchParams) =>
  createSelector([selectSearchResult(queryArgs)], (searchResult) => {
    return searchResult.data?.pagination?.total || 0;
  });

// Select category facets with counts
export const selectCategoryFacets = (queryArgs: SearchParams) =>
  createSelector([selectSearchFacets(queryArgs)], (facets) => {
    return facets.categories?.values || [];
  });

// Select brand facets
export const selectBrandFacets = (queryArgs: SearchParams) =>
  createSelector([selectSearchFacets(queryArgs)], (facets) => {
    return facets.brand?.values || [];
  });

// Select price range facets
export const selectPriceRangeFacets = (queryArgs: SearchParams) =>
  createSelector([selectSearchFacets(queryArgs)], (facets) => {
    return facets.price_range?.values || [];
  });

// Select on sale facet
export const selectOnSaleFacet = (queryArgs: SearchParams) =>
  createSelector([selectSearchFacets(queryArgs)], (facets) => {
    return facets.on_sale?.values || [];
  });

// Select available categories from facets
export const selectAvailableCategories = (queryArgs: SearchParams) =>
  createSelector([selectCategoryFacets(queryArgs)], (categoryFacets) => {
    return categoryFacets.map((facet) => ({
      name: facet.value,
      count: facet.count,
    }));
  });

// Select available price ranges from facets
export const selectAvailablePriceRanges = (queryArgs: SearchParams) =>
  createSelector([selectPriceRangeFacets(queryArgs)], (priceRangeFacets) => {
    return priceRangeFacets.map((facet) => ({
      range: facet.value,
      count: facet.count,
    }));
  });

// Select autocomplete suggestions
export const selectAutocompleteSuggestions = (q: string, limit = 5) =>
  createSelector(
    [(state: RootState) => searchSlice.endpoints.autocomplete.select({ q, limit })(state)],
    (result) => result.data || []
  );

// Select autocomplete loading state
export const selectAutocompleteLoading = (q: string, limit = 5) =>
  createSelector(
    [(state: RootState) => searchSlice.endpoints.autocomplete.select({ q, limit })(state)],
    (result) => result.isLoading
  );

export default searchSlice;