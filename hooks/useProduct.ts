/**
 * useProduct Hook
 * 
 * A custom hook for fetching and managing product data with localization support.
 * Separates data fetching logic from UI components for better testability and reusability.
 * 
 * @example
 * const { localizedProduct, isLoading, images } = useProduct(productId, { locale: 'ar' });
 */
import { useMemo, useCallback } from 'react';
import { useGetProductByIdQuery } from '@/store/features/products/productsSlice';
import { getLocalizedName, LocalizedEntity } from './useLocalizedEntityName';

// ============================================================================
// Types
// ============================================================================

export interface ProductImage {
  id?: number;
  url: string;
  alt?: string;
}

export interface UseProductOptions {
  /** Current locale for name/description localization */
  locale?: string;
  /** Skip fetching (useful for conditional queries) */
  skip?: boolean;
}

export interface UseProductResult<T> {
  /** Raw product data from API */
  product: T | undefined;
  /** Product with localized fields applied */
  localizedProduct: (T & { localizedName: string; localizedDescription: string }) | null;
  /** Array of product images */
  images: string[];
  /** Main product image */
  mainImage: string | null;
  /** Loading state */
  isLoading: boolean;
  /** Fetching state (for refetch) */
  isFetching: boolean;
  /** Error state */
  isError: boolean;
  /** Error object if any */
  error: unknown;
  /** Refetch function */
  refetch: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useProduct<T extends LocalizedEntity & {
  description?: string;
  description_ar?: string;
  description_en?: string;
  image?: string;
  images?: string[];
}>(
  productId: string | number,
  options: UseProductOptions = {}
): UseProductResult<T> {
  const { locale = 'ar', skip = false } = options;

  // Fetch product data using RTK Query
  const {
    data: product,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetProductByIdQuery(productId, { skip }) as any;

  // Memoized localized product
  const localizedProduct = useMemo(() => {
    if (!product) return null;

    const localizedName = getLocalizedName(product, locale);
    
    // Handle description localization
    let localizedDescription = product.description || '';
    if (locale === 'ar' && product.description_ar) {
      localizedDescription = product.description_ar;
    } else if (locale === 'en' && product.description_en) {
      localizedDescription = product.description_en;
    }

    return {
      ...product,
      localizedName,
      localizedDescription,
    };
  }, [product, locale]);

  // Memoized images array
  const images = useMemo<string[]>(() => {
    if (!product) return [];
    
    // Handle different image structures
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    
    if (product.image) {
      return [product.image];
    }
    
    return [];
  }, [product]);

  // Main image
  const mainImage = useMemo<string | null>(() => {
    if (!product) return null;
    return product.image || (images.length > 0 ? images[0] : null);
  }, [product, images]);

  return {
    product,
    localizedProduct,
    images,
    mainImage,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}

// ============================================================================
// Utility: Decode HTML entities (commonly needed for product names)
// ============================================================================

export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
