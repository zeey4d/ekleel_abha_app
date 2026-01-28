<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\V1 as V1;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::prefix('v1')->group(function () {

    // ========================
    // AUTH MODULE
    // ========================



    Route::post('/auth/register', [V1\AuthController::class, 'register']);
    Route::post('/auth/register/verify', [V1\AuthController::class, 'verifyRegistrationOtp']);
    Route::post('/auth/register/resend-otp', [V1\AuthController::class, 'resendRegistrationOtp']);
    Route::post('/auth/login', [V1\AuthController::class, 'login']);
    Route::post('/auth/logout', [V1\AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('/auth/forgot-password', [V1\AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [V1\AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [V1\AuthController::class, 'me']);
        Route::put('/auth/me', [V1\AuthController::class, 'updateProfile']);
        Route::put('/auth/me/password', [V1\AuthController::class, 'changePassword']);
    });

    // ========================
    // SEARCH MODULE
    // ========================
    Route::prefix('search')->group(function () {
        Route::get('products', [V1\SearchController::class, 'search']);
        Route::get('autocomplete', [V1\SearchController::class, 'autocomplete']);
    });

    // ========================
    // PRODUCTS MODULE
    // ========================
    Route::get('/products/deals', [V1\ProductController::class, 'deals']);
    Route::get('/products/new', [V1\ProductController::class, 'newArrivals']);
    Route::get('/products', [V1\ProductController::class, 'index']);
    Route::get('/products/{id}', [V1\ProductController::class, 'show'])->where('id', '[0-9]+');
    Route::get('/products/top', [V1\ProductController::class, 'top']);
    Route::get('/products/related/{id}', [V1\ProductController::class, 'related']);
    Route::get('/products/similar/{id}', [V1\ProductController::class, 'similar']);

    // Admin Product Routes
    Route::middleware(['auth:sanctum', 'token.can:admin'])->prefix('admin')->group(function () {
        Route::post('/products', [V1\Admin\ProductController::class, 'store']);
        Route::put('/products/{id}', [V1\Admin\ProductController::class, 'update']);
        Route::delete('/products/{id}', [V1\Admin\ProductController::class, 'destroy']);
    });

    // ========================
    // CATEGORIES MODULE
    // ========================
    Route::get('/categories', [V1\CategoryController::class, 'tree']);
    Route::get('/categories/{id}', [V1\CategoryController::class, 'show']);

    // Admin Category Routes
    Route::middleware(['auth:sanctum', 'token.can:admin'])->prefix('admin')->group(function () {
        Route::post('/categories', [V1\Admin\CategoryController::class, 'store']);
        Route::put('/categories/{id}', [V1\Admin\CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [V1\Admin\CategoryController::class, 'destroy']);
    });

    // ========================
    // ADDRESSES MODULE
    // ========================
    Route::middleware(['auth:sanctum', 'token.can:user'])->prefix('users')->group(function () {
        Route::get('/addresses', [V1\AddressController::class, 'index']);
        Route::post('/addresses', [V1\AddressController::class, 'store']);
        Route::put('/addresses/{id}', [V1\AddressController::class, 'update']);
        Route::delete('/addresses/{id}', [V1\AddressController::class, 'destroy']);
    });

    // ========================
    // CART MODULE
    // ========================
    Route::middleware('auth:sanctum')->group(function () {
        // Authenticated user cart
        Route::get('/cart', [V1\CartController::class, 'show']);
        Route::post('/cart/items', [V1\CartController::class, 'addItem']);
        Route::put('/cart/items/{id}', [V1\CartController::class, 'updateItem']);
        Route::delete('/cart/items/{id}', [V1\CartController::class, 'removeItem']);
        Route::delete('/cart', [V1\CartController::class, 'clear']);
        Route::post('/cart/merge', [V1\CartController::class, 'mergeGuestCart']);
    });

    // Guest cart (optional — if you want to allow cart before login)
    // You can handle this via session_id or device_id in controller logic.
    Route::post('/cart/guest/items', [V1\CartController::class, 'addGuestItem']);
    Route::get('/cart/guest', [V1\CartController::class, 'showGuestCart']);
    
    // Unified Cart Add (Supports Guest Header & User Token)
    Route::post('/cart/add', [V1\CartController::class, 'addToCart']);

    // ========================
    // WISHLIST MODULE
    // ========================
    Route::middleware(['auth:sanctum', 'token.can:user'])->group(function () {
        Route::get('/wishlist', [V1\WishlistController::class, 'index']);
        Route::post('/wishlist', [V1\WishlistController::class, 'store']);
        Route::delete('/wishlist/{productId}', [V1\WishlistController::class, 'destroy']);
    });

    // ========================
    // ORDERS MODULE
    // ========================
    Route::middleware(['auth:sanctum', 'token.can:user'])->group(function () {
        Route::post('/checkout', [V1\OrderController::class, 'checkout']);
        Route::get('/orders', [V1\OrderController::class, 'index']);
        Route::get('/orders/{id}', [V1\OrderController::class, 'show']);
        Route::post('/orders/{id}/cancel', [V1\OrderController::class, 'cancel']);
        Route::post('/orders/{id}/return', [V1\OrderController::class, 'requestReturn']);
    });

    Route::get('/admin/payments', [V1\Admin\PaymentController::class, 'index']);
    // Admin Order Routes
    Route::middleware(['auth:sanctum', 'token.can:admin'])->prefix('admin')->group(function () {
        Route::get('/orders', [V1\Admin\OrderController::class, 'index']);
        Route::get('/orders/{id}', [V1\Admin\OrderController::class, 'show']);
        Route::put('/orders/{id}/status', [V1\Admin\OrderController::class, 'updateStatus']);
        // Admin Payments
        Route::post('/payments/{order_id}/capture', [V1\Admin\PaymentController::class, 'capturePayment']);
        Route::post('/payments/{order_id}/refund', [V1\Admin\PaymentController::class, 'refundPayment']);
        Route::post('/payments/{order_id}/rebill', [V1\Admin\PaymentController::class, 'rebillPayment']);
        Route::post('/payments/{order_id}/reverse', [V1\Admin\PaymentController::class, 'reversePayment']);
    });

    // ========================
    // PAYMENTS MODULE
    // ========================
    // Initiate payment for an order
    Route::post('/payment/checkout', [V1\PaymentController::class, 'requestPayment']);
    Route::middleware('auth:sanctum')->group(function () {
        // Post-payment actions (by order_id)
        Route::get('/payment/status/order/{order_id}', [V1\PaymentController::class, 'paymentStatusByOrder']);
        Route::get('/payment/callback', [V1\PaymentController::class, 'callback']);
    });
    
    // HyperPay Payment Flow (Standard)
    Route::post('/orders/create', [V1\PaymentController::class, 'initiateCheckout']);
    Route::get('/payment/verify', [V1\PaymentController::class, 'verifyPayment']);

    // Status & callback


    // ========================
    // REVIEWS MODULE
    // ========================
    Route::get('/reviews/product/{productId}', [V1\ReviewController::class, 'byProduct']);
    Route::middleware(['auth:sanctum', 'token.can:user'])->group(function () {
        Route::get('/reviews/user', [V1\ReviewController::class, 'byUser']);
        Route::post('/reviews', [V1\ReviewController::class, 'store']);
        Route::put('/reviews/{id}', [V1\ReviewController::class, 'update']);
        Route::delete('/reviews/{id}', [V1\ReviewController::class, 'destroy']);
        Route::post('/reviews/{id}/report', [V1\ReviewController::class, 'report']);
    });

    // ========================
    // SELLERS MODULE
    // ========================
    Route::get('/sellers', [V1\SellerController::class, 'index']);
    Route::get('/sellers/{id}', [V1\SellerController::class, 'show']);
    Route::get('/sellers/{id}/products', [V1\SellerController::class, 'products']);
    Route::post('/sellers/applications', [V1\SellerController::class, 'apply']);

    // ========================
    // COUPONS MODULE
    // ========================
    Route::get('/coupons/validate', [V1\CouponController::class, 'validate']);
    Route::get('/promotions', [V1\CouponController::class, 'promotions']);

    // Admin Coupon Routes
    Route::middleware(['auth:sanctum', 'token.can:admin'])->prefix('admin')->group(function () {
        Route::get('/coupons', [V1\Admin\CouponController::class, 'index']);
        Route::post('/coupons', [V1\Admin\CouponController::class, 'store']);
        Route::put('/coupons/{id}', [V1\Admin\CouponController::class, 'update']);
        Route::delete('/coupons/{id}', [V1\Admin\CouponController::class, 'destroy']);
    });

    // ========================
    // ANALYTICS MODULE (Admin Only)
    // ========================
    Route::middleware(['auth:sanctum', 'token.can:admin'])->prefix('admin')->group(function () {
        Route::get('/analytics/sales', [V1\Admin\AnalyticsController::class, 'sales']);
        Route::get('/analytics/products', [V1\Admin\AnalyticsController::class, 'products']);
        Route::get('/analytics/customers', [V1\Admin\AnalyticsController::class, 'customers']);
        Route::get('/analytics/traffic', [V1\Admin\AnalyticsController::class, 'traffic']);
        Route::get('/analytics/revenue', [V1\Admin\AnalyticsController::class, 'revenue']);
        //export
    });

    // ========================
    // NOTIFICATIONS MODULE
    // ========================
    Route::middleware(['auth:sanctum', 'token.can:user'])->group(function () {
        Route::get('/notifications', [V1\NotificationController::class, 'index']);
        Route::put('/notifications/{id}/read', [V1\NotificationController::class, 'markAsRead']);
        Route::delete('/notifications/{id}', [V1\NotificationController::class, 'destroy']);
        Route::put('/notifications/mark-all-read', [V1\NotificationController::class, 'markAllRead']);
    });

    // ========================
    // CMS MODULE
    // ========================
    Route::get('/pages/home', [V1\CmsController::class, 'home']);
    Route::get('/pages/about', [V1\CmsController::class, 'about']);
    Route::get('/pages/{slug}', [V1\CmsController::class, 'page']);
    Route::get('/pages/banners', [V1\CmsController::class, 'banners']);

    // ========================
    // SETTINGS MODULE
    // ========================
    Route::get('/settings', [V1\SettingController::class, 'index']);
    Route::get('/settings/shipping', [V1\SettingController::class, 'shipping']);
    Route::get('/settings/return-policy', [V1\SettingController::class, 'returnPolicy']);
    Route::get('/settings/privacy', [V1\SettingController::class, 'privacy']);



    // ========================
    // WEBHOOKS MODULE
    // ========================
    Route::post('/webhooks/stripe', [V1\WebhookController::class, 'stripe']);
    Route::post('/webhooks/paypal', [V1\WebhookController::class, 'paypal']);
    Route::post('/webhooks/shipping', [V1\WebhookController::class, 'shipping']);


    // ========================
    // BRANDS MODULE
    // ========================
    Route::get('/brands', [V1\BrandController::class, 'index']);
    Route::get('/brands/featured', [V1\BrandController::class, 'featured']);
    Route::get('/brands/{id}', [V1\BrandController::class, 'show']);
    Route::get('/brands/letter/{letter}', [V1\BrandController::class, 'byLetter']);


        // ========================
    // ADMIN MODULE
    // ========================
 
    // ========================
    // ADMIN MODULE
    // ========================
    // Route::middleware(['auth:sanctum', 'token.can:admin'])->prefix('admin')->group(function () {
    Route::prefix('admin')->group(function () {    
        // Dashboard & Users (keeping existing routes)
        Route::get('/dashboard', [V1\Admin\DashboardController::class, 'index']);
        Route::get('/users', [V1\Admin\UserController::class, 'index']);
        Route::put('/users/{id}/role', [V1\Admin\UserController::class, 'updateRole']);
        Route::delete('/users/{id}', [V1\Admin\UserController::class, 'destroy']);
        Route::get('/logs', [V1\Admin\LogController::class, 'index']);

        // ========================
        // ANALYTICS
        // ========================
        Route::prefix('analytics')->group(function () {
            Route::get('/dashboard', [V1\Admin\AdminAnalyticsController::class, 'dashboard']);
            Route::get('/sales', [V1\Admin\AdminAnalyticsController::class, 'sales']);
            Route::get('/customers', [V1\Admin\AdminAnalyticsController::class, 'customers']);
            Route::get('/products', [V1\Admin\AdminAnalyticsController::class, 'products']);
            Route::post('/sales/export', [V1\Admin\AdminAnalyticsController::class, 'exportSalesReport']);
        });
        // ========================
        // PRODUCTS
        // ========================
        Route::prefix('products')->group(function () {
            Route::get('/', [V1\Admin\AdminProductController::class, 'index']);
            Route::post('/', [V1\Admin\AdminProductController::class, 'store']);
            Route::get('/{id}', [V1\Admin\AdminProductController::class, 'show']);
            Route::put('/{id}', [V1\Admin\AdminProductController::class, 'update']);
            Route::delete('/{id}', [V1\Admin\AdminProductController::class, 'destroy']);
            Route::post('/bulk-delete', [V1\Admin\AdminProductController::class, 'bulkDestroy']);
            Route::post('/bulk-update-status', [V1\Admin\AdminProductController::class, 'bulkUpdateStatus']);
            Route::post('/bulk-update-price', [V1\Admin\AdminProductController::class, 'bulkUpdatePrice']);
            Route::post('/bulk-update-stock', [V1\Admin\AdminProductController::class, 'bulkUpdateStock']);
        });

        // ========================
        // CATEGORIES
        // ========================
        Route::prefix('categories')->group(function () {
            Route::get('/', [V1\Admin\AdminCategoryController::class, 'index']);
            Route::get('/list', [V1\Admin\AdminCategoryController::class, 'indexPaginated']);
            Route::post('/', [V1\Admin\AdminCategoryController::class, 'store']);
            Route::get('/{id}', [V1\Admin\AdminCategoryController::class, 'show']);
            Route::put('/{id}', [V1\Admin\AdminCategoryController::class, 'update']);
            Route::delete('/{id}', [V1\Admin\AdminCategoryController::class, 'destroy']);
            Route::post('/bulk-delete', [V1\Admin\AdminCategoryController::class, 'bulkDestroy']);
            Route::post('/bulk-update-status', [V1\Admin\AdminCategoryController::class, 'bulkUpdateStatus']);
            Route::post('/bulk-update-parent', [V1\Admin\AdminCategoryController::class, 'bulkUpdateParent']);
        });

        // ========================
        // CUSTOMERS
        // ========================
        Route::prefix('customers')->group(function () {
            Route::get('/', [V1\Admin\AdminCustomerController::class, 'index']);
            Route::post('/', [V1\Admin\AdminCustomerController::class, 'store']);
            Route::get('/{id}', [V1\Admin\AdminCustomerController::class, 'show']);
            Route::put('/{id}', [V1\Admin\AdminCustomerController::class, 'update']);
            Route::delete('/{id}', [V1\Admin\AdminCustomerController::class, 'destroy']);
            Route::delete('/{id}/force', [V1\Admin\AdminCustomerController::class, 'forceDestroy']);
            Route::post('/bulk-delete', [V1\Admin\AdminCustomerController::class, 'bulkDestroy']);
            Route::post('/bulk-update-status', [V1\Admin\AdminCustomerController::class, 'bulkUpdateStatus']);
            Route::post('/bulk-update-group', [V1\Admin\AdminCustomerController::class, 'bulkUpdateGroup']);
        });

        // ========================
        // ORDERS
        // ========================
        Route::prefix('orders')->group(function () {
            Route::get('/', [V1\Admin\AdminOrderController::class, 'index']);
            Route::get('/statistics', [V1\Admin\AdminOrderController::class, 'statistics']);
            Route::get('/{id}', [V1\Admin\AdminOrderController::class, 'show']);
            Route::put('/{id}/status', [V1\Admin\AdminOrderController::class, 'updateStatus']);
            Route::delete('/{id}', [V1\Admin\AdminOrderController::class, 'destroy']);
            Route::post('/bulk-delete', [V1\Admin\AdminOrderController::class, 'bulkDestroy']);
            Route::post('/bulk-update-status', [V1\Admin\AdminOrderController::class, 'bulkUpdateStatus']);
        });

        // ========================
        // COUPONS
        // ========================
        Route::prefix('coupons')->group(function () {
            Route::get('/', [V1\Admin\AdminCouponController::class, 'index']);
            Route::post('/', [V1\Admin\AdminCouponController::class, 'store']);
            Route::get('/{id}', [V1\Admin\AdminCouponController::class, 'show']);
            Route::put('/{id}', [V1\Admin\AdminCouponController::class, 'update']);
            Route::delete('/{id}', [V1\Admin\AdminCouponController::class, 'destroy']);
            Route::post('/bulk-delete', [V1\Admin\AdminCouponController::class, 'bulkDestroy']);
            Route::post('/bulk-update-status', [V1\Admin\AdminCouponController::class, 'bulkUpdateStatus']);
        });

        // ========================
        // REVIEWS
        // ========================
        Route::prefix('reviews')->group(function () {
            Route::get('/', [V1\Admin\AdminReviewController::class, 'index']);
            Route::get('/{id}', [V1\Admin\AdminReviewController::class, 'show']);
            Route::put('/{id}', [V1\Admin\AdminReviewController::class, 'update']);
            Route::delete('/{id}', [V1\Admin\AdminReviewController::class, 'destroy']);
            Route::post('/bulk-delete', [V1\Admin\AdminReviewController::class, 'bulkDestroy']);
            Route::post('/bulk-update-status', [V1\Admin\AdminReviewController::class, 'bulkUpdateStatus']);
        });

        // ========================
        // RETURNS
        // ========================
        Route::prefix('returns')->group(function () {
            Route::get('/', [V1\Admin\AdminReturnController::class, 'index']);
            Route::get('/{id}', [V1\Admin\AdminReturnController::class, 'show']);
            Route::put('/{id}/status', [V1\Admin\AdminReturnController::class, 'updateStatus']);
            Route::delete('/{id}', [V1\Admin\AdminReturnController::class, 'destroy']);
            Route::post('/bulk-delete', [V1\Admin\AdminReturnController::class, 'bulkDestroy']);
            Route::post('/bulk-update-status', [V1\Admin\AdminReturnController::class, 'bulkUpdateStatus']);
        });

        // ========================
        // BANNERS
        // ========================
        Route::prefix('banners')->group(function () {
            Route::get('/', [V1\Admin\AdminBannerController::class, 'index']);
            Route::post('/', [V1\Admin\AdminBannerController::class, 'store']);
            Route::get('/{id}', [V1\Admin\AdminBannerController::class, 'show']);
            Route::put('/{id}', [V1\Admin\AdminBannerController::class, 'update']);
            Route::delete('/{id}', [V1\Admin\AdminBannerController::class, 'destroy']);
            Route::post('/bulk-delete', [V1\Admin\AdminBannerController::class, 'bulkDestroy']);
            Route::post('/bulk-update-status', [V1\Admin\AdminBannerController::class, 'bulkUpdateStatus']);
        });

        // ========================
        // ATTRIBUTES
        // ========================
        Route::prefix('attributes')->group(function () {
            // Attribute Groups
            Route::get('/groups', [V1\Admin\AdminAttributeController::class, 'indexGroups']);
            Route::post('/groups', [V1\Admin\AdminAttributeController::class, 'storeGroup']);
            Route::put('/groups/{id}', [V1\Admin\AdminAttributeController::class, 'updateGroup']);
            Route::delete('/groups/{id}', [V1\Admin\AdminAttributeController::class, 'destroyGroup']);
            
            // Attributes
            Route::get('/', [V1\Admin\AdminAttributeController::class, 'index']);
            Route::post('/', [V1\Admin\AdminAttributeController::class, 'store']);
            Route::get('/{id}', [V1\Admin\AdminAttributeController::class, 'show']);
            Route::put('/{id}', [V1\Admin\AdminAttributeController::class, 'update']);
            Route::delete('/{id}', [V1\Admin\AdminAttributeController::class, 'destroy']);
        });

        // ========================
        // MANUFACTURERS
        // ========================
        Route::prefix('manufacturers')->group(function () {
            Route::get('/', [V1\Admin\AdminManufacturerController::class, 'index']);
            Route::post('/', [V1\Admin\AdminManufacturerController::class, 'store']);
            Route::get('/{id}', [V1\Admin\AdminManufacturerController::class, 'show']);
            Route::put('/{id}', [V1\Admin\AdminManufacturerController::class, 'update']);
            Route::delete('/{id}', [V1\Admin\AdminManufacturerController::class, 'destroy']);
            Route::post('/bulk-delete', [V1\Admin\AdminManufacturerController::class, 'bulkDestroy']);
        });

        // ========================
        // LANGUAGES
        // ========================
        Route::prefix('languages')->group(function () {
            Route::get('/', [V1\Admin\AdminLanguageController::class, 'index']);
            Route::post('/', [V1\Admin\AdminLanguageController::class, 'store']);
            Route::get('/{id}', [V1\Admin\AdminLanguageController::class, 'show']);
            Route::put('/{id}', [V1\Admin\AdminLanguageController::class, 'update']);
            Route::delete('/{id}', [V1\Admin\AdminLanguageController::class, 'destroy']);
            Route::post('/bulk-delete', [V1\Admin\AdminLanguageController::class, 'bulkDestroy']);
            Route::post('/bulk-update-status', [V1\Admin\AdminLanguageController::class, 'bulkUpdateStatus']);
        });

        // ========================
        // NOTIFICATIONS
        // ========================
        Route::prefix('notifications')->group(function () {
            Route::get('/', [V1\Admin\AdminNotificationController::class, 'index']);
            Route::post('/', [V1\Admin\AdminNotificationController::class, 'store']);
            Route::get('/statistics', [V1\Admin\AdminNotificationController::class, 'statistics']);
            Route::post('/send-test', [V1\Admin\AdminNotificationController::class, 'sendTest']);
            Route::get('/{id}', [V1\Admin\AdminNotificationController::class, 'show']);
            Route::delete('/{id}', [V1\Admin\AdminNotificationController::class, 'destroy']);
            Route::post('/bulk-delete', [V1\Admin\AdminNotificationController::class, 'bulkDestroy']);
        });

        // ========================
        // SETTINGS
        // ========================
        Route::prefix('settings')->group(function () {
            Route::get('/', [V1\Admin\AdminSettingsController::class, 'index']);
            Route::get('/store-info', [V1\Admin\AdminSettingsController::class, 'getStoreInfo']);
            Route::put('/store-info', [V1\Admin\AdminSettingsController::class, 'updateStoreInfo']);
            Route::post('/bulk-update', [V1\Admin\AdminSettingsController::class, 'bulkUpdate']);
            Route::post('/clear-cache', [V1\Admin\AdminSettingsController::class, 'clearCache']);
            Route::get('/{key}', [V1\Admin\AdminSettingsController::class, 'show']);
            Route::put('/{key}', [V1\Admin\AdminSettingsController::class, 'update']);
            Route::delete('/{key}', [V1\Admin\AdminSettingsController::class, 'destroy']);
        });

        // ========================
        // LOCATIONS
        // ========================
        // Countries
        Route::prefix('countries')->group(function () {
            Route::get('/', [V1\Admin\AdminCountryController::class, 'index']);
            Route::post('/', [V1\Admin\AdminCountryController::class, 'store']);
            Route::get('/{id}', [V1\Admin\AdminCountryController::class, 'show']);
            Route::put('/{id}', [V1\Admin\AdminCountryController::class, 'update']);
            Route::delete('/{id}', [V1\Admin\AdminCountryController::class, 'destroy']);
            Route::post('/bulk-delete', [V1\Admin\AdminCountryController::class, 'bulkDestroy']);
            Route::post('/bulk-update-status', [V1\Admin\AdminCountryController::class, 'bulkUpdateStatus']);
        });

        // Zones
        Route::prefix('zones')->group(function () {
            Route::get('/', [V1\Admin\AdminZoneController::class, 'index']);
            Route::post('/', [V1\Admin\AdminZoneController::class, 'store']);
            Route::get('/{id}', [V1\Admin\AdminZoneController::class, 'show']);
            Route::put('/{id}', [V1\Admin\AdminZoneController::class, 'update']);
            Route::delete('/{id}', [V1\Admin\AdminZoneController::class, 'destroy']);
            Route::post('/bulk-delete', [V1\Admin\AdminZoneController::class, 'bulkDestroy']);
            Route::post('/bulk-update-status', [V1\Admin\AdminZoneController::class, 'bulkUpdateStatus']);
        });

        // Cities
        Route::prefix('cities')->group(function () {
            Route::get('/', [V1\Admin\AdminCityController::class, 'index']);
            Route::post('/', [V1\Admin\AdminCityController::class, 'store']);
            Route::get('/{id}', [V1\Admin\AdminCityController::class, 'show']);
            Route::put('/{id}', [V1\Admin\AdminCityController::class, 'update']);
            Route::delete('/{id}', [V1\Admin\AdminCityController::class, 'destroy']);
            Route::post('/bulk-delete', [V1\Admin\AdminCityController::class, 'bulkDestroy']);
            Route::post('/bulk-update-status', [V1\Admin\AdminCityController::class, 'bulkUpdateStatus']);
        });

        // ========================
        // MEDIA
        // ========================
        Route::prefix('media')->group(function () {
            // Stats
            Route::get('/stats', [V1\Admin\AdminMediaController::class, 'stats']);
            
            // Folders
            Route::get('/folders', [V1\Admin\AdminMediaController::class, 'getFolders']);
            Route::post('/folders', [V1\Admin\AdminMediaController::class, 'createFolder']);
            Route::get('/folders/{id}', [V1\Admin\AdminMediaController::class, 'showFolder']);
            Route::put('/folders/{id}', [V1\Admin\AdminMediaController::class, 'updateFolder']);
            Route::delete('/folders/{id}', [V1\Admin\AdminMediaController::class, 'deleteFolder']);

            // Files
            Route::get('/', [V1\Admin\AdminMediaController::class, 'index']);
            Route::post('/upload', [V1\Admin\AdminMediaController::class, 'store']);
            Route::post('/bulk-upload', [V1\Admin\AdminMediaController::class, 'bulkUpload']);
            Route::post('/bulk-delete', [V1\Admin\AdminMediaController::class, 'bulkDestroy']);
            Route::post('/bulk-move', [V1\Admin\AdminMediaController::class, 'bulkMove']);
            Route::get('/{id}', [V1\Admin\AdminMediaController::class, 'show']);
            Route::put('/{id}', [V1\Admin\AdminMediaController::class, 'update']);
            Route::delete('/{id}', [V1\Admin\AdminMediaController::class, 'destroy']);
        });

        // ========================
        // SHIPPING (SMSA)
        // ========================
        Route::prefix('shipping')->group(function () {
            Route::get('/', [V1\Admin\AdminShippingController::class, 'index']);
            Route::get('/statistics', [V1\Admin\AdminShippingController::class, 'statistics']);
            Route::post('/smsa/create', [V1\Admin\AdminShippingController::class, 'createShipment']);
            Route::post('/smsa/bulk-create', [V1\Admin\AdminShippingController::class, 'bulkCreate']);
            Route::get('/smsa/label/{awb}', [V1\Admin\AdminShippingController::class, 'getLabel']);
            Route::get('/smsa/track/{awb}', [V1\Admin\AdminShippingController::class, 'track']);
            Route::get('/smsa/status/{awb}', [V1\Admin\AdminShippingController::class, 'status']);
            Route::get('/smsa/cities', [V1\Admin\AdminShippingController::class, 'getCities']);
            Route::get('/smsa/retails', [V1\Admin\AdminShippingController::class, 'getRetails']);
            Route::post('/smsa/charges', [V1\Admin\AdminShippingController::class, 'getShipCharges']);
            Route::post('/smsa/cancel/{awb}', [V1\Admin\AdminShippingController::class, 'cancel']);
            Route::get('/order/{orderId}', [V1\Admin\AdminShippingController::class, 'getByOrder']);
            Route::get('/{id}', [V1\Admin\AdminShippingController::class, 'show']);
        });

    });

});
