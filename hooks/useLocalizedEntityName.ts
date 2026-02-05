import { useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Base interface for any entity that supports localization.
 * Extend this for specific entity types (Brand, Category, Product).
 */
export interface LocalizedEntity {
  id: number | string;
  name: string;
  name_ar?: string;
  name_en?: string;
}

/**
 * Generic type for RTK Query hook return value.
 * Describes the shape of data returned by useGet*ByIdQuery hooks.
 */
interface UseQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

/**
 * Type for any RTK Query hook that fetches an entity by ID.
 * Examples: useGetBrandByIdQuery, useGetCategoryByIdQuery, useGetProductByIdQuery
 */
type EntityQueryHook<TEntity extends LocalizedEntity, TArg = number> = (
  arg: TArg
) => UseQueryResult<TEntity>;

// ============================================================================
// Hook
// ============================================================================

/**
 * A reusable hook that fetches an entity and returns its localized name.
 *
 * @template TEntity - The entity type (must extend LocalizedEntity)
 * @template TArg - The argument type for the query (default: number)
 *
 * @param id - The entity ID to fetch
 * @param locale - The current locale ('ar' | 'en')
 * @param useQueryHook - The RTK Query hook to use (e.g., useGetBrandByIdQuery)
 *
 * @returns An object containing:
 *   - `name`: The localized entity name
 *   - `isLoading`: Whether the query is loading
 *   - `entity`: The full entity data (if needed)
 *
 * @example
 * // Usage in a BrandDetailsScreen:
 * import { useLocalizedEntityName } from '@/hooks/useLocalizedEntityName';
 * import { useGetBrandByIdQuery } from '@/store/features/brands/brandsSlice';
 *
 * export default function BrandDetailsScreen() {
 *   const { id } = useLocalSearchParams<{ id: string }>();
 *   const locale = 'ar'; // or from i18n context
 *
 *   const { name, isLoading } = useLocalizedEntityName(
 *     Number(id),
 *     locale,
 *     useGetBrandByIdQuery
 *   );
 *
 *   return (
 *     <View>
 *       <Stack.Screen options={{ title: name }} />
 *       {isLoading ? <Skeleton /> : <Text>{name}</Text>}
 *     </View>
 *   );
 * }
 */
export function useLocalizedEntityName<
  TEntity extends LocalizedEntity,
  TArg = number
>(
  id: TArg,
  locale: string,
  useQueryHook: EntityQueryHook<TEntity, TArg>
): {
  name: string;
  isLoading: boolean;
  entity: TEntity | undefined;
} {
  // 1. Fetch entity data using the provided RTK Query hook
  const { data: entity, isLoading } = useQueryHook(id);

  // 2. Compute localized name using useMemo for performance
  const name = useMemo<string>(() => {
    if (!entity) return '';

    // Return Arabic name if locale is 'ar' and name_ar exists
    if (locale === 'ar' && entity.name_ar) {
      return entity.name_ar;
    }

    // Return English name if locale is 'en' and name_en exists
    if (locale === 'en' && entity.name_en) {
      return entity.name_en;
    }

    // Fallback to the default 'name' field
    return entity.name;
  }, [entity, locale]);

  // 3. Return the computed values
  return {
    name,
    isLoading,
    entity,
  };
}

// ============================================================================
// Utility: Standalone localization helper (no fetch)
// ============================================================================

/**
 * A pure utility function to get localized name from an already-fetched entity.
 * Use this when you already have the entity data and don't need to fetch.
 *
 * @param entity - The entity object
 * @param locale - The current locale ('ar' | 'en')
 * @returns The localized name string
 *
 * @example
 * const localizedName = getLocalizedName(brand, 'ar');
 */
export function getLocalizedName<T extends LocalizedEntity>(
  entity: T | null | undefined,
  locale: string
): string {
  if (!entity) return '';

  if (locale === 'ar' && entity.name_ar) {
    return entity.name_ar;
  }

  if (locale === 'en' && entity.name_en) {
    return entity.name_en;
  }

  return entity.name;
}
