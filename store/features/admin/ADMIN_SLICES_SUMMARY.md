# Admin Redux Slices - Summary

This document provides an overview of all admin Redux slices created based on the controllers in `server_api\Http\Controllers\Api\V1\Admin`.

## Created Slices

### 1. **adminProductsSlice.ts**
- **Controller**: `AdminProductController.php`
- **Features**:
  - Full CRUD operations for products
  - Bulk operations: delete, update status, update price, update stock
  - Product filtering by search, status, category
  - Entity adapter for normalized state
  - Pagination support

### 2. **adminCategoriesSlice.ts**
- **Controller**: `AdminCategoryController.php`
- **Features**:
  - Full CRUD operations for categories
  - Hierarchical category support (parent_id)
  - Bulk operations: delete, update status
  - Category path building
  - Subcategories and products count

### 3. **adminOrdersSlice.ts**
- **Controller**: `AdminOrderController.php`
- **Features**:
  - Order listing with advanced filtering
  - Order details with products, totals, and history
  - Update order status with notifications
  - Bulk operations: delete, update status
  - Order statistics (total orders, revenue, average order value)

### 4. **adminCustomersSlice.ts**
- **Controller**: `AdminCustomerController.php`
- **Features**:
  - Full CRUD operations for customers
  - Soft delete and force delete (permanent)
  - Bulk operations: delete, update status, update group
  - Customer details with addresses, orders count, total spent
  - Customer group management

### 5. **adminCouponsSlice.ts**
- **Controller**: `AdminCouponController.php`
- **Features**:
  - Full CRUD operations for coupons
  - Support for Fixed (F) and Percentage (P) discounts
  - Product and category restrictions
  - Usage history tracking
  - Bulk operations: delete, update status

### 6. **adminBannersSlice.ts**
- **Controller**: `AdminBannerController.php`
- **Features**:
  - Full CRUD operations for banners
  - Multi-language banner images support
  - Image sorting and linking
  - Bulk operations: delete, update status

### 7. **adminManufacturersSlice.ts**
- **Controller**: `AdminManufacturerController.php`
- **Features**:
  - Full CRUD operations for manufacturers/brands
  - Products count per manufacturer
  - Sort order management
  - Bulk operations: delete, update status

### 8. **adminReviewsSlice.ts**
- **Controller**: `AdminReviewController.php`
- **Features**:
  - Full CRUD operations for product reviews
  - Filtering by product, customer, rating, status
  - Review moderation (approve/reject)
  - Bulk operations: delete, update status

### 9. **adminCitiesSlice.ts**
- **Controller**: `AdminCityController.php`
- **Features**:
  - Full CRUD operations for cities
  - Zone-based filtering
  - Bulk operations: delete, update status

### 10. **adminCountriesSlice.ts**
- **Controller**: `AdminCountryController.php`
- **Features**:
  - Full CRUD operations for countries
  - ISO code management (2 and 3 letter codes)
  - Address format configuration
  - Postcode requirement settings
  - Bulk operations: delete, update status

### 11. **adminZonesSlice.ts**
- **Controller**: `AdminZoneController.php`
- **Features**:
  - Full CRUD operations for zones/states
  - Country-based filtering
  - Zone code management
  - Bulk operations: delete, update status

### 12. **adminLanguagesSlice.ts**
- **Controller**: `AdminLanguageController.php`
- **Features**:
  - Full CRUD operations for languages
  - Locale and directory configuration
  - Language images/flags
  - Sort order management
  - Bulk operations: delete, update status

### 13. **adminAttributesSlice.ts**
- **Controller**: `AdminAttributeController.php`
- **Features**:
  - Full CRUD operations for attributes
  - Attribute groups management
  - Hierarchical structure (attributes belong to groups)
  - Sort order management

### 14. **adminAnalyticsSlice.ts**
- **Controller**: `AdminAnalyticsController.php`
- **Features**:
  - Dashboard statistics
  - Sales reports (by day, product, category)
  - Customer reports (by group, top customers)
  - Product reports (by category, most viewed)
  - Export functionality (CSV, Excel, PDF)

### 15. **adminNotificationsSlice.ts**
- **Controller**: `AdminNotificationController.php`
- **Features**:
  - Notification listing with filtering
  - Read/unread tracking
  - Unread count
  - Mark as read (single and bulk)
  - Delete notifications (single and bulk)
  - Delete all read notifications

### 16. **adminReturnsSlice.ts**
- **Controller**: `AdminReturnController.php`
- **Features**:
  - Return/refund request management
  - Return status updates with notifications
  - Return details with product and customer info
  - Bulk operations: delete, update status
  - Date range filtering

### 17. **adminSettingsSlice.ts**
- **Controller**: `AdminSettingsController.php`
- **Features**:
  - Store settings (name, logo, contact info)
  - Local settings (country, language, currency)
  - Option settings (checkout, order status)
  - Image settings (dimensions)
  - Mail settings (SMTP configuration)
  - Server settings (maintenance mode, SEO)
  - System utilities (clear cache, backup database, test email)
  - System information

## Common Features Across All Slices

1. **RTK Query Integration**: All slices use RTK Query for API calls
2. **Entity Adapters**: Most slices use entity adapters for normalized state management
3. **Pagination Support**: All list endpoints support pagination
4. **TypeScript**: Fully typed with interfaces for all data structures
5. **Cache Invalidation**: Proper tag-based cache invalidation
6. **Optimistic Updates**: Where applicable (e.g., status updates)
7. **Error Handling**: Consistent error handling patterns
8. **Selectors**: Pre-built selectors for common queries

## Usage Example

```typescript
import {
  useGetAdminProductsQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
  useBulkUpdateAdminProductsStatusMutation,
} from '@/store/features/admin';

function AdminProductsPage() {
  const { data, isLoading, error } = useGetAdminProductsQuery({
    page: 1,
    per_page: 20,
    search: 'laptop',
    status: 1,
  });

  const [createProduct] = useCreateAdminProductMutation();
  const [updateProduct] = useUpdateAdminProductMutation();
  const [deleteProduct] = useDeleteAdminProductMutation();
  const [bulkUpdateStatus] = useBulkUpdateAdminProductsStatusMutation();

  // Use the hooks...
}
```

## API Endpoints Structure

All admin endpoints follow this pattern:
- **List**: `GET /admin/{resource}?page=1&per_page=15&search=...`
- **Show**: `GET /admin/{resource}/{id}`
- **Create**: `POST /admin/{resource}`
- **Update**: `PUT /admin/{resource}/{id}`
- **Delete**: `DELETE /admin/{resource}/{id}`
- **Bulk Delete**: `POST /admin/{resource}/bulk-destroy`
- **Bulk Update Status**: `POST /admin/{resource}/bulk-update-status`

## Notes

- All slices are located in `store/features/admin/`
- Import from `store/features/admin` for convenience
- Each slice exports its own hooks, types, and selectors
- Entity adapters provide normalized state management
- All mutations invalidate relevant cache tags automatically
