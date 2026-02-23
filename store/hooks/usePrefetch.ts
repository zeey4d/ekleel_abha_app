
import { productsSlice } from "@/store/features/products/productsSlice";
import { categoriesSlice } from "@/store/features/categories/categoriesSlice";
import { brandsSlice } from "@/store/features/brands/brandsSlice";

/**
 * Custom hook to aggregate prefetching capabilities.
 * Use this to prefetch data on hover, focus, or before navigation.
 */
export const useAppPrefetch = () => {
  const prefetchProduct = productsSlice.usePrefetch('getProductById');
  const prefetchCategory = categoriesSlice.usePrefetch('getCategoryById');
  const prefetchBrand = brandsSlice.usePrefetch('getBrandById');
  const prefetchTopicProducts = productsSlice.usePrefetch('getProducts');

  return {
    /**
     * Prefetch a single product detailed data
     * @param id Product ID
     */
    prefetchProduct,
    
    /**
     * Prefetch a single category data
     * @param id Category ID
     */
    prefetchCategory,

    /**
     * Prefetch a single brand data
     * @param id Brand ID
     */
    prefetchBrand,

    /**
     * Prefetch a list of products (e.g., for a specific category or filter)
     * @param args Search/Filter arguments
     */
    prefetchTopicProducts,
  };
};
