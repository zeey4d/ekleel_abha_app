/**
 * useCategory Hook
 * 
 * A custom hook for fetching category data, subcategories, and products within a category.
 * Provides memoized data and handles all the data fetching logic in one place.
 * 
 * @example
 * const { category, products, subCategories, isLoading } = useCategory(categoryId, { locale: 'ar' });
 */
import { useMemo } from 'react';
import {
  useGetCategoryByIdQuery,
  useGetCategoryChildrenQuery,
} from '@/store/features/categories/categoriesSlice';
import { useSearchProductsQuery } from '@/store/features/search/searchSlice';
import { getLocalizedName, LocalizedEntity } from './useLocalizedEntityName';

// ============================================================================
// Types
// ============================================================================

export interface UseCategoryOptions {
  /** Current locale for name localization */
  locale?: string;
  /** Number of products per page */
  perPage?: number;
  /** Skip fetching products */
  skipProducts?: boolean;
}

export interface UseCategoryResult<TCategory, TProduct> {
  /** Raw category data */
  category: TCategory | undefined;
  /** Category with localized name */
  localizedCategory: (TCategory & { localizedName: string }) | null;
  /** Array of subcategories */
  subCategories: TCategory[];
  /** Products in this category */
  products: TProduct[];
  /** Search facets for filtering */
  facets: any;
  /** Total products count */
  totalProducts: number;
  /** Category loading state */
  isLoading: boolean;
  /** Products loading state */
  isProductsLoading: boolean;
  /** Fetching state (background refetch) */
  isFetching: boolean;
  /** Error state */
  isError: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useCategory<
  TCategory extends LocalizedEntity = LocalizedEntity,
  TProduct extends { id: number | string } = any
>(
  categoryId: number,
  options: UseCategoryOptions = {}
): UseCategoryResult<TCategory, TProduct> {
  const { locale = 'ar', perPage = 12, skipProducts = false } = options;

  // Fetch category details
  const {
    data: category,
    isLoading: isCategoryLoading,
    isError,
  } = useGetCategoryByIdQuery(categoryId) as any;

  // Fetch subcategories
  const { data: subCategoriesData } = useGetCategoryChildrenQuery({ id: categoryId }) as any;

  // Fetch products in this category
  const {
    data: searchData,
    isLoading: isProductsLoading,
    isFetching,
  } = useSearchProductsQuery(
    {
      category_ids: [categoryId],
      per_page: perPage,
    },
    { skip: skipProducts }
  ) as any;

  // Memoized localized category
  const localizedCategory = useMemo(() => {
    if (!category) return null;

    return {
      ...category,
      localizedName: getLocalizedName(category, locale),
    };
  }, [category, locale]);

  // Memoized subcategories array
  const subCategories = useMemo<TCategory[]>(() => {
    return subCategoriesData || [];
  }, [subCategoriesData]);

  // Memoized products array with proper filtering
  const products = useMemo<TProduct[]>(() => {
    if (!searchData?.ids) return [];
    return searchData.ids
      .map((id: number | string) => searchData.entities[id])
      .filter(Boolean);
  }, [searchData?.ids, searchData?.entities]);

  // Total products count
  const totalProducts = useMemo(() => {
    return searchData?.pagination?.total || products.length;
  }, [searchData?.pagination?.total, products.length]);

  return {
    category,
    localizedCategory,
    subCategories,
    products,
    facets: searchData?.facets,
    totalProducts,
    isLoading: isCategoryLoading,
    isProductsLoading,
    isFetching,
    isError,
  };
}
