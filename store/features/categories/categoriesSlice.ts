// src/features/categories/categoriesSlice.ts
import { createSelector, createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";
import { RootState } from '@/store/store';

import {
  Category,
  ProductParams,
  GetProductsByCategoryArgs,
  GetCategoryTreeParams,
  CategoryState,
  CategoryApiResponse,
  CategoryDetailResponse
} from '@/store/types';


// --- Entity Adapter for Categories ---
const categoriesAdapter = createEntityAdapter<Category, number>({
  selectId: (category: Category) => category.id,
  sortComparer: (a: Category, b: Category) => (a.sort_order || 0) - (b.sort_order || 0), // Sorted by sort_order
});

const initialCategoriesState: CategoryState = categoriesAdapter.getInitialState({
  loading: false,
  error: null,
  tree: null, // For hierarchical category structure
});

// --- RTK Query API Slice Injection ---
export const categoriesSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Get Category Tree ---
    getCategoryTree: builder.query<CategoryState, GetCategoryTreeParams>({
      query: ({ parent_id = 0, include_products = false }) => {
        const params = new URLSearchParams();
        params.append('parent_id', parent_id.toString());
        params.append('include_products', include_products.toString());
        return `/categories?${params.toString()}`;
      },
      transformResponse: (response: CategoryApiResponse): CategoryState => {
        const categoriesData = response.data;

        if (!categoriesData) {
          return {
            ...initialCategoriesState,
            tree: [],
          };
        }

        // Flatten the tree structure for normalization
        const flatCategories: Category[] = [];

        const flattenTree = (categories: Category[]) => {
          categories.forEach(category => {
            flatCategories.push({ ...category });
            if (category.children) {
              flattenTree(category.children);
            }
          });
        };

        flattenTree(categoriesData);

        const state = categoriesAdapter.setAll(
          initialCategoriesState,
          flatCategories
        );

        // Store the tree structure separately
        return {
          ...state,
          tree: categoriesData,
        };
      },
      providesTags: (result, error, arg) =>
        result
          ? [
            ...result.ids.map((id) => ({ type: "Category" as const, id })),
            { type: "Category" as const, id: "TREE" },
          ]
          : [{ type: "Category" as const, id: "TREE" }],
    }),

    // --- Get Category by ID (details + products + filters) ---
    getCategoryById: builder.query<CategoryDetailResponse['data'], number | GetProductsByCategoryArgs>({
      query: (arg) => {
        const id = typeof arg === 'number' ? arg : arg.id;
        const params = typeof arg === 'object' ? arg.params : {};

        const { page = 1, limit = 15, sort = 'best_selling', min_price, max_price, attributes } = params || {};
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        queryParams.append('sort', sort);

        if (min_price !== undefined) queryParams.append('min_price', min_price.toString());
        if (max_price !== undefined) queryParams.append('max_price', max_price.toString());
        if (attributes) queryParams.append('attributes', attributes);

        return `/categories/${id}?${queryParams.toString()}`;
      },
      transformResponse: (response: CategoryDetailResponse) => response.data,
      providesTags: (result, error, arg) => {
        const id = typeof arg === 'number' ? arg : arg.id;
        return [{ type: "Category", id }];
      },
    }),

    // --- Get Products by Category (with pagination, sorting, filtering) ---
    getProductsByCategory: builder.query<CategoryDetailResponse, GetProductsByCategoryArgs>({
      query: ({ id, params = {} }) => {
        const { page = 1, limit = 15, sort = 'best_selling', min_price, max_price, attributes } = params;
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        queryParams.append('sort', sort);

        if (min_price !== undefined) queryParams.append('min_price', min_price.toString());
        if (max_price !== undefined) queryParams.append('max_price', max_price.toString());
        if (attributes) queryParams.append('attributes', attributes);

        return `/categories/${id}?${queryParams.toString()}`;
      },
      // The controller show() returns: { data: { ...category, products, filters }, meta: { ...pagination } }
      // We return the full response so callers can access both data and meta
      providesTags: (result, error, { id }) => [
        { type: "Category", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    // --- Get Category Children ---
    getCategoryChildren: builder.query<Category[], { id: number; include_products?: boolean }>({
      query: ({ id, include_products = false }) => {
        const params = new URLSearchParams();
        params.append('include_products', include_products.toString());
        return `/categories/${id}/children?${params.toString()}`;
      },
      transformResponse: (response: { data: Category[] }) => response.data,
      providesTags: (result, error, { id }) => [
        { type: "Category", id: `children-${id}` }
      ],
    }),

    // --- Get Category IDs ---
    getCategoryIds: builder.query<number[], void>({
      query: () => `/categories/ids`,
      transformResponse: (responseData: { data: number[]; total: number }): number[] => {
        return responseData.data || [];
      },
      providesTags: [{ type: "Category" as const, id: "IDS" }],
      keepUnusedDataFor: 60,
    }),
  }),
});

// Export auto-generated hooks
export const {
  useGetCategoryTreeQuery,
  useGetCategoryByIdQuery,
  useGetCategoryIdsQuery,
  useGetProductsByCategoryQuery,
  useGetCategoryChildrenQuery,
} = categoriesSlice;

// --- Memoized Selectors ---
// Selector for categories
export const {
  selectAll: selectAllCategories,
  selectById: selectCategoryById,
  selectIds: selectCategoryIds,
} = categoriesAdapter.getSelectors<RootState>(
  (state) =>
    categoriesSlice.endpoints.getCategoryTree.select({ parent_id: 0, include_products: false })(state).data ||
    initialCategoriesState
);

// Selector for root categories (top-level)
export const selectRootCategories = createSelector(
  [selectAllCategories],
  (categories) =>
    categories.filter(
      (category) => category.parent_id === 0
    )
);

// Selector for building category tree from flat list
export const selectCategoryTree = createSelector(
  [selectAllCategories],
  (categories) => {
    if (categories.length === 0) return [];

    const categoryMap: Record<number, Category & { children: Category[] }> = {};

    // Create map of categories by ID
    categories.forEach((category) => {
      categoryMap[category.id] = { ...category, children: [] };
    });

    // Build tree structure
    const tree: (Category & { children: Category[] })[] = [];
    categories.forEach((category) => {
      const categoryWithChildren = categoryMap[category.id];

      if (category.parent_id !== 0 && categoryMap[category.parent_id]) {
        // Add to parent's children
        categoryMap[category.parent_id].children.push(categoryWithChildren);
      } else {
        // Root category
        tree.push(categoryWithChildren);
      }
    });

    return tree;
  }
);

// Selector for getting children of a category
export const selectCategoryChildren = createSelector(
  [selectAllCategories, (state, parentId: number) => parentId],
  (categories, parentId) =>
    categories.filter((category) => category.parent_id === parentId)
);

export default categoriesSlice;