/**
 * Helper to convert backend/web URLs to app routes
 * Handles URLs like:
 * - http://localhost:8081/en/categories/133
 * - /en/products/55
 * - /brands/12
 */
export const getAppRoute = (url: string | null | undefined) => {
  if (!url) return '/(tabs)/(home)';
  
  // Remove domain if present
  let path = url.replace(/^https?:\/\/[^\/]+/, '');
  
  // Remove language prefix if present (e.g. /en/...)
  path = path.replace(/^\/(?:en|ar)/, '');

  if (path.includes('/categories/')) {
    const id = path.split('/categories/')[1];
    return `/(tabs)/(home)/(context)/categories/${id}`;
  }
  
  if (path.includes('/products/')) {
    const id = path.split('/products/')[1];
    return `/(tabs)/(home)/(context)/products/${id}`;
  }

  if (path.includes('/brands/')) {
      const id = path.split('/brands/')[1];
      return `/(tabs)/(home)/(context)/brands/${id}`;
  }

  return '/(tabs)/(home)';
};
