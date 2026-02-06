/**
 * useBrand Hook
 * 
 * A custom hook for fetching brand data and products from a specific brand.
 * Handles data fetching, localization, and memoization in one place.
 * 
 * @example
 * const { brand, products, isLoading } = useBrand(brandId, { locale: 'ar' });
 */
import { useMemo } from 'react';
import { useGetBrandByIdQuery } from '@/store/features/brands/brandsSlice';
import { useSearchProductsQuery } from '@/store/features/search/searchSlice';
import { getLocalizedName, LocalizedEntity } from './useLocalizedEntityName';

// ============================================================================
// Types
// ============================================================================

export interface Brand extends LocalizedEntity {
  id: number;
  name: string;
  name_ar?: string;
  name_en?: string;
  image?: string;
  description?: string;
  description_ar?: string;
  description_en?: string;
}

export interface UseBrandOptions {
  /** Current locale for name localization */
  locale?: string;
  /** Number of products per page */
  perPage?: number;
  /** Skip fetching products */
  skipProducts?: boolean;
}

export interface UseBrandResult<TProduct> {
  /** Raw brand data */
  brand: Brand | undefined;
  /** Brand with localized fields */
  localizedBrand: (Brand & { localizedName: string; localizedDescription: string }) | null;
  /** Products from this brand */
  products: TProduct[];
  /** Search facets (excluding brand) */
  facets: any;
  /** Total products count */
  totalProducts: number;
  /** Brand loading state */
  isLoading: boolean;
  /** Products loading state */
  isProductsLoading: boolean;
  /** Fetching state */
  isFetching: boolean;
  /** Error state */
  isError: boolean;
  /** Brand not found */
  notFound: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useBrand<TProduct extends { id: number | string } = any>(
  brandId: number,
  options: UseBrandOptions = {}
): UseBrandResult<TProduct> {
  const { locale = 'ar', perPage = 12, skipProducts = false } = options;

  // Fetch brand details
  const {
    data: brand,
    isLoading: isBrandLoading,
    isError,
  } = useGetBrandByIdQuery(brandId) as any;

  // Fetch products from this brand
  // Skip if brand not loaded yet or skipProducts is true
  const {
    data: searchData,
    isLoading: isProductsLoading,
    isFetching,
  } = useSearchProductsQuery(
    {
      brand: brand ? [brand.name] : [],
      per_page: perPage,
      sort_by: 'date_added_desc',
    },
    { skip: !brand || skipProducts }
  ) as any;

  // Memoized localized brand
  const localizedBrand = useMemo(() => {
    if (!brand) return null;

    const localizedName = getLocalizedName(brand, locale);
    
    // Handle description localization
    let localizedDescription = brand.description || '';
    if (locale === 'ar' && brand.description_ar) {
      localizedDescription = brand.description_ar;
    } else if (locale === 'en' && brand.description_en) {
      localizedDescription = brand.description_en;
    }

    return {
      ...brand,
      localizedName,
      localizedDescription,
    };
  }, [brand, locale]);

  // Memoized products array
  const products = useMemo<TProduct[]>(() => {
    if (!searchData?.ids) return [];
    return searchData.ids
      .map((id: number | string) => searchData.entities[id])
      .filter(Boolean);
  }, [searchData?.ids, searchData?.entities]);

  // Facets without brand (since we're already filtering by brand)
  const facets = useMemo(() => {
    if (!searchData?.facets) return undefined;
    const { brand: _, ...rest } = searchData.facets;
    return rest;
  }, [searchData?.facets]);

  // Total products count
  const totalProducts = useMemo(() => {
    return searchData?.pagination?.total || products.length;
  }, [searchData?.pagination?.total, products.length]);

  return {
    brand,
    localizedBrand,
    products,
    facets,
    totalProducts,
    isLoading: isBrandLoading,
    isProductsLoading,
    isFetching,
    isError,
    notFound: !isBrandLoading && !brand,
  };
}
