/**
 * Hooks Index
 * 
 * Central export point for all custom hooks in the application.
 * Import from '@/hooks' instead of individual files.
 * 
 * @example
 * import { useProduct, useCategory, useBrand, useLocalizedEntityName } from '@/hooks';
 */

// Entity-specific hooks
export { useProduct, decodeHtmlEntities } from './useProduct';
export type { UseProductOptions, UseProductResult } from './useProduct';

export { useCategory } from './useCategory';
export type { UseCategoryOptions, UseCategoryResult } from './useCategory';

export { useBrand } from './useBrand';
export type { UseBrandOptions, UseBrandResult, Brand } from './useBrand';

// Utility hooks
export { 
  useLocalizedEntityName, 
  getLocalizedName,
} from './useLocalizedEntityName';
export type { LocalizedEntity } from './useLocalizedEntityName';

export { useLanguage } from './useLanguage';
export { useAuthGuard } from './useAuthGuard';
