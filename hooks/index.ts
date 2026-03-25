/**
 * Hooks Index
 * 
 * Central export point for all custom hooks in the application.
 * Import from '@/hooks' instead of individual files.
 * 
 * @example
 * import { useProduct, useCategory, useBrand, useLocalizedEntityName } from '@/hooks';
 */

// Entity-specific hooks removed as they do not exist


// Utility hooks
export { 
  useLocalizedEntityName, 
  getLocalizedName,
} from './useLocalizedEntityName';
export type { LocalizedEntity } from './useLocalizedEntityName';

export { useLanguage } from './useLanguage';
