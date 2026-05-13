<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\V1 as V1;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/not-found', fn()=> abort(404));

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
        Route::post('track-click', [V1\SearchController::class, 'trackClick']);
    });

    // ========================
    // PRODUCTS MODULE
    // ========================
    Route::get('/products/ids', [V1\ProductController::class, 'ids']);
    Route::get('/products/deals', [V1\ProductController::class, 'deals']);
    Route::get('/products/new', [V1\ProductController::class, 'newArrivals']);
    Route::get('/products', [V1\ProductController::class, 'index']);
    Route::get('/products/{id}', [V1\ProductController::class, 'show'])->where('id', '[0-9]+');
    Route::get('/products/top', [V1\ProductController::class, 'top']);
    Route::get('/products/related/{id}', [V1\ProductController::class, 'related']);
    Route::get('/products/similar/{id}', [V1\ProductController::class, 'similar']);



    // ========================
    // CATEGORIES MODULE
    // ========================
    Route::get('/categories/ids', [V1\CategoryController::class, 'ids']);
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
        Route::get('/addresses/{id}', [V1\AddressController::class, 'show']);
        Route::post('/addresses', [V1\AddressController::class, 'store']);
        Route::put('/addresses/{id}', [V1\AddressController::class, 'update']);
        Route::delete('/addresses/{id}', [V1\AddressController::class, 'destroy']);
    });

    // ========================
    // BRANCHES / STORE LOCATIONS
    // ========================
    Route::get('/branches', [V1\AddressController::class, 'branches']);

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

    // ========================
    // LOYALTY POINTS MODULE
    // ========================
    Route::middleware(['auth:sanctum', 'token.can:user'])->prefix('loyalty-points')->group(function () {
        Route::get('/balance', [V1\LoyaltyPointController::class, 'balance']);
        Route::get('/history', [V1\LoyaltyPointController::class, 'history']);
        Route::get('/calculate', [V1\LoyaltyPointController::class, 'calculate']);
        Route::post('/redeem', [V1\LoyaltyPointController::class, 'redeem']);
    });


    // HyperPay admin routes have been moved to the admin protected block below.

    // ========================
    // PAYMENTS MODULE
    // ========================
    // Initiate payment for an order
    // Route::post('/payment/hyperpay/checkout', [V1\PaymentHyperpayController::class, 'requestPayment']);
    // Route::middleware('auth:sanctum')->group(function () {
    //     // Post-payment actions (by order_id)
    //     Route::get('/payment/hyperpay/status/order/{order_id}', [V1\PaymentHyperpayController::class, 'paymentStatusByOrder']);
    //     Route::get('/payment/hyperpay/callback', [V1\PaymentHyperpayController::class, 'callback']);
    // });
    
    // // HyperPay Payment Flow (Standard)
    // Route::post('/payment/hyperpay/orders/create', [V1\PaymentHyperpayController::class, 'initiateCheckout']);
    // Route::get('/payment/hyperpay/verify', [V1\PaymentHyperpayController::class, 'verifyPayment']);

    // // ========================
    // // PAYTABS MODULE
    // // ========================
    Route::post('/payment/paytabs/checkout', [V1\PaymentPaytabsController::class, 'initiateCheckout']);
    Route::post('/payment/paytabs/callback', [V1\PaymentPaytabsController::class, 'callback']);
    Route::match(['get', 'post'], '/payment/paytabs/verify', [V1\PaymentPaytabsController::class, 'verifyPayment']);

    // ========================
    // TAP PAYMENTS MODULE
    // ========================
    Route::post('/payment/tap/checkout', [V1\PaymentTapController::class, 'initiateCheckout']);
    Route::match(['get', 'post'], '/payment/tap/callback', [V1\PaymentTapController::class, 'callback']);
    Route::post('/payment/tap/webhook', [V1\PaymentTapController::class, 'webhook']);
    Route::get('/payment/tap/charge/{chargeId}', [V1\PaymentTapController::class, 'getChargeStatus']);
    Route::middleware(['auth:sanctum', 'token.can:admin'])->group(function () {
        Route::post('/payment/tap/refund', [V1\PaymentTapController::class, 'refund']);
    });

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
        Route::get('/analytics/sales', [V1\Admin\AdminAnalyticsController::class, 'sales']);
        Route::get('/analytics/products', [V1\Admin\AdminAnalyticsController::class, 'products']);
        Route::get('/analytics/customers', [V1\Admin\AdminAnalyticsController::class, 'customers']);
        Route::get('/analytics/traffic', [V1\Admin\AdminAnalyticsController::class, 'traffic']);
        Route::get('/analytics/revenue', [V1\Admin\AdminAnalyticsController::class, 'revenue']);
        //export
    });

    // ========================
    // ORDERS
    // ========================
    // Route::get('/orders', [V1\Admin\OrderController::class, 'index']);
    // Route::get('/orders/{id}', [V1\Admin\OrderController::class, 'show']);
    // Route::put('/orders/{id}/status', [V1\Admin\OrderController::class, 'updateStatus']);

    // ========================
    // NOTIFICATIONS MODULE
    // ========================
    Route::middleware(['auth:sanctum', 'token.can:user'])->group(function () {
        Route::get('/notifications', [V1\NotificationController::class, 'index']);
        Route::get('/notifications/summary', [V1\NotificationController::class, 'summary']);
        Route::put('/notifications/{id}/read', [V1\NotificationController::class, 'markAsRead']);
        Route::delete('/notifications/{id}', [V1\NotificationController::class, 'destroy']);
        Route::put('/notifications/mark-all-read', [V1\NotificationController::class, 'markAllRead']);
    });

    // ========================
    // CMS MODULE
    // ========================
    Route::get('/pages/home', [V1\CmsController::class, 'home']);
    Route::get('/pages/about', [V1\CmsController::class, 'about']);
    Route::get('/pages/banners', [V1\CmsController::class, 'banners']);
    Route::get('/pages/{slug}', [V1\CmsController::class, 'page']);

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
    Route::get('/brands/ids', [V1\BrandController::class, 'ids']);
    Route::get('/brands', [V1\BrandController::class, 'index']);
    Route::get('/brands/featured', [V1\BrandController::class, 'featured']);
    Route::get('/brands/{id}', [V1\BrandController::class, 'show']);
    Route::get('/brands/letter/{letter}', [V1\BrandController::class, 'byLetter']);


        // ========================
    // ADMIN AUTH (Public — no auth required)
    // ========================
    Route::prefix('admin/auth')->group(function () {
        Route::post('/login', [V1\Admin\AdminAuthController::class, 'login']);
    });

    // ========================
    // ADMIN MODULE (Protected — requires admin token + permissions)
    // ========================
    Route::middleware(['auth:sanctum-admin'])->prefix('admin')->group(function () {

        // ── Auth (requires valid admin token only) ──
        Route::post('/auth/logout', [V1\Admin\AdminAuthController::class, 'logout']);
        Route::get('/auth/me', [V1\Admin\AdminAuthController::class, 'me']);
        Route::post('/auth/refresh-permissions', [V1\Admin\AdminAuthController::class, 'refreshPermissions']);

        // ── Dashboard ──
        Route::middleware('admin.can:dashboard.view')->group(function () {
            Route::get('/dashboard', [V1\Admin\AdminDashboardController::class, 'index']);
        });

        // ── Logs ──
        Route::middleware('admin.can:logs.view')->group(function () {
            Route::get('/logs', [V1\Admin\AdminLogController::class, 'index']);
        });

        // ── Admin Users & Groups (requires users permission) ──
        Route::middleware('admin.can:users.view')->group(function () {
            Route::get('/admin-users', [V1\Admin\AdminAuthController::class, 'listAdminUsers']);
            Route::get('/admin-users/{id}', [V1\Admin\AdminAuthController::class, 'showAdminUser']);
            Route::get('/user-groups', [V1\Admin\AdminAuthController::class, 'listGroups']);
            Route::get('/user-groups/{id}', [V1\Admin\AdminAuthController::class, 'showGroup']);
            
            // Legacy customer-users list
            Route::get('/users', [V1\Admin\UserController::class, 'index']);
        });
        Route::middleware('admin.can:users.modify')->group(function () {
            Route::post('/admin-users', [V1\Admin\AdminAuthController::class, 'storeAdminUser']);
            Route::put('/admin-users/{id}', [V1\Admin\AdminAuthController::class, 'updateAdminUser']);
            Route::put('/admin-users/{id}/group', [V1\Admin\AdminAuthController::class, 'updateUserGroup']);
            Route::post('/admin-users/bulk-update-status', [V1\Admin\AdminAuthController::class, 'bulkUpdateAdminUserStatus']);
            
            Route::post('/user-groups', [V1\Admin\AdminAuthController::class, 'storeGroup']);
            Route::put('/user-groups/{id}', [V1\Admin\AdminAuthController::class, 'updateGroupPermissions']);
            Route::put('/users/{id}/role', [V1\Admin\UserController::class, 'updateRole']);
        });
        Route::middleware('admin.can:users.delete')->group(function () {
            Route::delete('/admin-users/{id}', [V1\Admin\AdminAuthController::class, 'destroyAdminUser']);
            Route::delete('/user-groups/{id}', [V1\Admin\AdminAuthController::class, 'destroyGroup']);
            Route::delete('/users/{id}', [V1\Admin\UserController::class, 'destroy']);
        });

        // ========================
        // ANALYTICS
        // ========================
        Route::middleware('admin.can:analytics.view')->prefix('analytics')->group(function () {
            Route::get('/dashboard', [V1\Admin\AdminAnalyticsController::class, 'dashboard']);
            Route::get('/sales', [V1\Admin\AdminAnalyticsController::class, 'sales']);
            Route::get('/customers', [V1\Admin\AdminAnalyticsController::class, 'customers']);
            Route::get('/products', [V1\Admin\AdminAnalyticsController::class, 'products']);
            Route::get('/marketing', [V1\Admin\AdminAnalyticsController::class, 'marketing']);
            Route::get('/returns', [V1\Admin\AdminAnalyticsController::class, 'returns']);
            Route::get('/searches', [V1\Admin\AdminAnalyticsController::class, 'searches']);
        });
        Route::middleware('admin.can:analytics.export')->prefix('analytics')->group(function () {
            Route::post('/sales/export', [V1\Admin\AdminAnalyticsController::class, 'exportSalesReport']);
            Route::post('/search/setup-rules', [V1\SearchController::class, 'setupAnalyticsRules']);
        });

        // ========================
        // PRODUCTS
        // ========================
        Route::prefix('products')->group(function () {
            Route::middleware('admin.can:products.view')->group(function () {
                Route::get('/', [V1\Admin\AdminProductController::class, 'index']);
                Route::get('/export', [V1\Admin\AdminProductController::class, 'exportCsv']);
                Route::get('/import-template', [V1\Admin\AdminProductController::class, 'downloadCsvTemplate']);
                Route::get('/{id}', [V1\Admin\AdminProductController::class, 'show']);
            });
            Route::middleware('admin.can:products.modify')->group(function () {
                Route::post('/', [V1\Admin\AdminProductController::class, 'store']);
                Route::put('/{id}', [V1\Admin\AdminProductController::class, 'update']);
                Route::post('/import', [V1\Admin\AdminProductController::class, 'importCsv']);
                Route::post('/bulk-update-status-by-category', [V1\Admin\AdminProductController::class, 'bulkUpdateStatusByCategory']);
                Route::post('/bulk-update-status-by-brand', [V1\Admin\AdminProductController::class, 'bulkUpdateStatusByBrand']);
                Route::post('/bulk-update-status', [V1\Admin\AdminProductController::class, 'bulkUpdateStatus']);
                Route::post('/bulk-update-price', [V1\Admin\AdminProductController::class, 'bulkUpdatePrice']);
                Route::post('/bulk-update-stock', [V1\Admin\AdminProductController::class, 'bulkUpdateStock']);
            });
            Route::middleware('admin.can:products.delete')->group(function () {
                Route::delete('/{id}', [V1\Admin\AdminProductController::class, 'destroy']);
                Route::post('/bulk-delete', [V1\Admin\AdminProductController::class, 'bulkDestroy']);
            });
        });

        // ========================
        // CATEGORIES
        // ========================
        Route::prefix('categories')->group(function () {
            Route::middleware('admin.can:categories.view')->group(function () {
                Route::get('/', [V1\Admin\AdminCategoryController::class, 'index']);
                Route::get('/list', [V1\Admin\AdminCategoryController::class, 'indexPaginated']);
                Route::get('/{id}', [V1\Admin\AdminCategoryController::class, 'show']);
            });
            Route::middleware('admin.can:categories.modify')->group(function () {
                Route::post('/', [V1\Admin\AdminCategoryController::class, 'store']);
                Route::put('/{id}', [V1\Admin\AdminCategoryController::class, 'update']);
                Route::post('/bulk-update-status', [V1\Admin\AdminCategoryController::class, 'bulkUpdateStatus']);
                Route::post('/bulk-update-parent', [V1\Admin\AdminCategoryController::class, 'bulkUpdateParent']);
            });
            Route::middleware('admin.can:categories.delete')->group(function () {
                Route::delete('/{id}', [V1\Admin\AdminCategoryController::class, 'destroy']);
                Route::post('/bulk-delete', [V1\Admin\AdminCategoryController::class, 'bulkDestroy']);
            });
        });

        // ========================
        // CUSTOMERS
        // ========================
        Route::prefix('customers')->group(function () {
            Route::middleware('admin.can:customers.view')->group(function () {
                Route::get('/', [V1\Admin\AdminCustomerController::class, 'index']);
                Route::get('/{id}', [V1\Admin\AdminCustomerController::class, 'show']);
            });
            Route::middleware('admin.can:customers.modify')->group(function () {
                Route::post('/', [V1\Admin\AdminCustomerController::class, 'store']);
                Route::put('/{id}', [V1\Admin\AdminCustomerController::class, 'update']);
                Route::post('/bulk-update-status', [V1\Admin\AdminCustomerController::class, 'bulkUpdateStatus']);
                Route::post('/bulk-update-group', [V1\Admin\AdminCustomerController::class, 'bulkUpdateGroup']);
            });
            Route::middleware('admin.can:customers.delete')->group(function () {
                Route::delete('/{id}', [V1\Admin\AdminCustomerController::class, 'destroy']);
                Route::delete('/{id}/force', [V1\Admin\AdminCustomerController::class, 'forceDestroy']);
                Route::post('/bulk-delete', [V1\Admin\AdminCustomerController::class, 'bulkDestroy']);
            });
        });

        // ========================
        // ORDERS
        // ========================
        Route::prefix('orders')->group(function () {
            Route::middleware('admin.can:orders.view')->group(function () {
                Route::get('/', [V1\Admin\AdminOrderController::class, 'index']);
                Route::get('/statistics', [V1\Admin\AdminOrderController::class, 'statistics']);
                Route::get('/{id}', [V1\Admin\AdminOrderController::class, 'show']);
            });
            Route::middleware('admin.can:orders.modify')->group(function () {
                Route::put('/{id}/status', [V1\Admin\AdminOrderController::class, 'updateStatus']);
                Route::post('/bulk-update-status', [V1\Admin\AdminOrderController::class, 'bulkUpdateStatus']);
            });
            Route::middleware('admin.can:orders.delete')->group(function () {
                Route::delete('/{id}', [V1\Admin\AdminOrderController::class, 'destroy']);
                Route::post('/bulk-delete', [V1\Admin\AdminOrderController::class, 'bulkDestroy']);
            });
        });

        // ========================
        // COUPONS
        // ========================
        Route::prefix('coupons')->group(function () {
            Route::middleware('admin.can:coupons.view')->group(function () {
                Route::get('/', [V1\Admin\AdminCouponController::class, 'index']);
                Route::get('/{id}', [V1\Admin\AdminCouponController::class, 'show']);
            });
            Route::middleware('admin.can:coupons.modify')->group(function () {
                Route::post('/', [V1\Admin\AdminCouponController::class, 'store']);
                Route::put('/{id}', [V1\Admin\AdminCouponController::class, 'update']);
                Route::post('/bulk-update-status', [V1\Admin\AdminCouponController::class, 'bulkUpdateStatus']);
            });
            Route::middleware('admin.can:coupons.delete')->group(function () {
                Route::delete('/{id}', [V1\Admin\AdminCouponController::class, 'destroy']);
                Route::post('/bulk-delete', [V1\Admin\AdminCouponController::class, 'bulkDestroy']);
            });
        });

        // ========================
        // SPECIALS
        // ========================
        Route::prefix('specials')->group(function () {
            Route::middleware('admin.can:specials.view')->group(function () {
                Route::get('/', [V1\Admin\AdminSpecialController::class, 'index']);
                Route::get('/{id}', [V1\Admin\AdminSpecialController::class, 'show']);
            });
            Route::middleware('admin.can:specials.modify')->group(function () {
                Route::post('/', [V1\Admin\AdminSpecialController::class, 'store']);
                Route::put('/{id}', [V1\Admin\AdminSpecialController::class, 'update']);
                Route::post('/apply-by-brand', [V1\Admin\AdminSpecialController::class, 'applyByBrand']);
                Route::post('/apply-by-category', [V1\Admin\AdminSpecialController::class, 'applyByCategory']);
            });
            Route::middleware('admin.can:specials.delete')->group(function () {
                Route::delete('/{id}', [V1\Admin\AdminSpecialController::class, 'destroy']);
                Route::post('/bulk-delete', [V1\Admin\AdminSpecialController::class, 'bulkDestroy']);
            });
        });

        // ========================
        // REVIEWS
        // ========================
        Route::prefix('reviews')->group(function () {
            Route::middleware('admin.can:reviews.view')->group(function () {
                Route::get('/', [V1\Admin\AdminReviewController::class, 'index']);
                Route::get('/statistics', [V1\Admin\AdminReviewController::class, 'statistics']);
                Route::get('/{id}', [V1\Admin\AdminReviewController::class, 'show']);
            });
            Route::middleware('admin.can:reviews.modify')->group(function () {
                Route::put('/{id}', [V1\Admin\AdminReviewController::class, 'update']);
                Route::post('/bulk-update-status', [V1\Admin\AdminReviewController::class, 'bulkUpdateStatus']);
            });
            Route::middleware('admin.can:reviews.delete')->group(function () {
                Route::delete('/{id}', [V1\Admin\AdminReviewController::class, 'destroy']);
                Route::post('/bulk-delete', [V1\Admin\AdminReviewController::class, 'bulkDestroy']);
            });
        });

        // ========================
        // RETURNS
        // ========================
        Route::prefix('returns')->group(function () {
            Route::middleware('admin.can:returns.view')->group(function () {
                Route::get('/', [V1\Admin\AdminReturnController::class, 'index']);
                Route::get('/{id}', [V1\Admin\AdminReturnController::class, 'show']);
            });
            Route::middleware('admin.can:returns.modify')->group(function () {
                Route::put('/{id}/status', [V1\Admin\AdminReturnController::class, 'updateStatus']);
                Route::post('/bulk-update-status', [V1\Admin\AdminReturnController::class, 'bulkUpdateStatus']);
            });
            Route::middleware('admin.can:returns.delete')->group(function () {
                Route::delete('/{id}', [V1\Admin\AdminReturnController::class, 'destroy']);
                Route::post('/bulk-delete', [V1\Admin\AdminReturnController::class, 'bulkDestroy']);
            });
        });

        // ========================
        // BANNERS
        // ========================
        Route::prefix('banners')->group(function () {
            Route::middleware('admin.can:banners.view')->group(function () {
                Route::get('/', [V1\Admin\AdminBannerController::class, 'index']);
                Route::get('/create', [V1\Admin\AdminBannerController::class, 'create']);
                Route::get('/{id}', [V1\Admin\AdminBannerController::class, 'show']);
            });
            Route::middleware('admin.can:banners.modify')->group(function () {
                Route::post('/', [V1\Admin\AdminBannerController::class, 'store']);
                Route::put('/{id}', [V1\Admin\AdminBannerController::class, 'update']);
                Route::post('/bulk-update-status', [V1\Admin\AdminBannerController::class, 'bulkUpdateStatus']);
            });
            Route::middleware('admin.can:banners.delete')->group(function () {
                Route::delete('/{id}', [V1\Admin\AdminBannerController::class, 'destroy']);
                Route::post('/bulk-delete', [V1\Admin\AdminBannerController::class, 'bulkDestroy']);
            });
        });

        // ========================
        // ATTRIBUTES
        // ========================
        Route::prefix('attributes')->group(function () {
            Route::middleware('admin.can:attributes.view')->group(function () {
                Route::get('/groups', [V1\Admin\AdminAttributeController::class, 'indexGroups']);
                Route::get('/', [V1\Admin\AdminAttributeController::class, 'index']);
                Route::get('/{id}', [V1\Admin\AdminAttributeController::class, 'show']);
            });
            Route::middleware('admin.can:attributes.modify')->group(function () {
                Route::post('/groups', [V1\Admin\AdminAttributeController::class, 'storeGroup']);
                Route::put('/groups/{id}', [V1\Admin\AdminAttributeController::class, 'updateGroup']);
                Route::post('/', [V1\Admin\AdminAttributeController::class, 'store']);
                Route::put('/{id}', [V1\Admin\AdminAttributeController::class, 'update']);
            });
            Route::middleware('admin.can:attributes.delete')->group(function () {
                Route::delete('/groups/{id}', [V1\Admin\AdminAttributeController::class, 'destroyGroup']);
                Route::delete('/{id}', [V1\Admin\AdminAttributeController::class, 'destroy']);
            });
        });

        // ========================
        // MANUFACTURERS
        // ========================
        Route::prefix('manufacturers')->group(function () {
            Route::middleware('admin.can:manufacturers.view')->group(function () {
                Route::get('/', [V1\Admin\AdminManufacturerController::class, 'index']);
                Route::get('/{id}', [V1\Admin\AdminManufacturerController::class, 'show']);
            });
            Route::middleware('admin.can:manufacturers.modify')->group(function () {
                Route::post('/', [V1\Admin\AdminManufacturerController::class, 'store']);
                Route::put('/{id}', [V1\Admin\AdminManufacturerController::class, 'update']);
            });
            Route::middleware('admin.can:manufacturers.delete')->group(function () {
                Route::delete('/{id}', [V1\Admin\AdminManufacturerController::class, 'destroy']);
                Route::post('/bulk-delete', [V1\Admin\AdminManufacturerController::class, 'bulkDestroy']);
            });
        });

        // ========================
        // LANGUAGES
        // ========================
        Route::prefix('languages')->group(function () {
            Route::middleware('admin.can:languages.view')->group(function () {
                Route::get('/', [V1\Admin\AdminLanguageController::class, 'index']);
                Route::get('/{id}', [V1\Admin\AdminLanguageController::class, 'show']);
            });
            Route::middleware('admin.can:languages.modify')->group(function () {
                Route::post('/', [V1\Admin\AdminLanguageController::class, 'store']);
                Route::put('/{id}', [V1\Admin\AdminLanguageController::class, 'update']);
                Route::post('/bulk-update-status', [V1\Admin\AdminLanguageController::class, 'bulkUpdateStatus']);
            });
            Route::middleware('admin.can:languages.delete')->group(function () {
                Route::delete('/{id}', [V1\Admin\AdminLanguageController::class, 'destroy']);
                Route::post('/bulk-delete', [V1\Admin\AdminLanguageController::class, 'bulkDestroy']);
            });
        });

        // ========================
        // NOTIFICATIONS
        // ========================
        Route::prefix('notifications')->group(function () {
            Route::middleware('admin.can:notifications.view')->group(function () {
                Route::get('/', [V1\Admin\AdminNotificationController::class, 'index']);
                Route::get('/statistics', [V1\Admin\AdminNotificationController::class, 'statistics']);
                Route::get('/{id}', [V1\Admin\AdminNotificationController::class, 'show']);
            });
            Route::middleware('admin.can:notifications.send')->group(function () {
                Route::post('/', [V1\Admin\AdminNotificationController::class, 'store']);
                Route::post('/send-test', [V1\Admin\AdminNotificationController::class, 'sendTest']);
            });
            Route::middleware('admin.can:notifications.delete')->group(function () {
                Route::delete('/{id}', [V1\Admin\AdminNotificationController::class, 'destroy']);
                Route::post('/bulk-delete', [V1\Admin\AdminNotificationController::class, 'bulkDestroy']);
            });
        });

        // ========================
        // SETTINGS
        // ========================
        Route::prefix('settings')->group(function () {
            Route::middleware('admin.can:settings.view')->group(function () {
                Route::get('/', [V1\Admin\AdminSettingsController::class, 'index']);
                Route::get('/store-info', [V1\Admin\AdminSettingsController::class, 'getStoreInfo']);
                Route::get('/services', [V1\Admin\AdminSettingsController::class, 'getServiceSettings']);
                Route::get('/services/loyalty', [V1\Admin\AdminSettingsController::class, 'getLoyaltyConfig']);
                Route::get('/services/otp', [V1\Admin\AdminSettingsController::class, 'getOtpConfig']);
                Route::get('/services/paytabs', [V1\Admin\AdminSettingsController::class, 'getPaytabsConfig']);
                Route::get('/services/tap', [V1\Admin\AdminSettingsController::class, 'getTapConfig']);
                Route::get('/services/smsa', [V1\Admin\AdminSettingsController::class, 'getSmsaConfig']);
                Route::get('/{key}', [V1\Admin\AdminSettingsController::class, 'show']);
            });
            Route::middleware('admin.can:settings.modify')->group(function () {
                Route::put('/store-info', [V1\Admin\AdminSettingsController::class, 'updateStoreInfo']);
                Route::post('/bulk-update', [V1\Admin\AdminSettingsController::class, 'bulkUpdate']);
                Route::post('/clear-cache', [V1\Admin\AdminSettingsController::class, 'clearCache']);
                Route::put('/services', [V1\Admin\AdminSettingsController::class, 'updateServiceSettings']);
                Route::put('/services/loyalty', [V1\Admin\AdminSettingsController::class, 'updateLoyaltyConfig']);
                Route::put('/services/otp', [V1\Admin\AdminSettingsController::class, 'updateOtpConfig']);
                Route::put('/services/paytabs', [V1\Admin\AdminSettingsController::class, 'updatePaytabsConfig']);
                Route::put('/services/tap', [V1\Admin\AdminSettingsController::class, 'updateTapConfig']);
                Route::put('/services/smsa', [V1\Admin\AdminSettingsController::class, 'updateSmsaConfig']);
                Route::put('/{key}', [V1\Admin\AdminSettingsController::class, 'update']);
                Route::delete('/{key}', [V1\Admin\AdminSettingsController::class, 'destroy']);
            });
        });

        // ========================
        // LOCATIONS
        // ========================
        Route::middleware('admin.can:locations.view')->group(function () {
            Route::get('/countries', [V1\Admin\AdminCountryController::class, 'index']);
            Route::get('/countries/{id}', [V1\Admin\AdminCountryController::class, 'show']);
            Route::get('/zones', [V1\Admin\AdminZoneController::class, 'index']);
            Route::get('/zones/{id}', [V1\Admin\AdminZoneController::class, 'show']);
            Route::get('/cities', [V1\Admin\AdminCityController::class, 'index']);
            Route::get('/cities/{id}', [V1\Admin\AdminCityController::class, 'show']);
        });
        Route::middleware('admin.can:locations.modify')->group(function () {
            Route::post('/countries', [V1\Admin\AdminCountryController::class, 'store']);
            Route::put('/countries/{id}', [V1\Admin\AdminCountryController::class, 'update']);
            Route::post('/countries/bulk-update-status', [V1\Admin\AdminCountryController::class, 'bulkUpdateStatus']);
            Route::post('/zones', [V1\Admin\AdminZoneController::class, 'store']);
            Route::put('/zones/{id}', [V1\Admin\AdminZoneController::class, 'update']);
            Route::post('/zones/bulk-update-status', [V1\Admin\AdminZoneController::class, 'bulkUpdateStatus']);
            Route::post('/cities', [V1\Admin\AdminCityController::class, 'store']);
            Route::put('/cities/{id}', [V1\Admin\AdminCityController::class, 'update']);
            Route::post('/cities/bulk-update-status', [V1\Admin\AdminCityController::class, 'bulkUpdateStatus']);
        });
        Route::middleware('admin.can:locations.delete')->group(function () {
            Route::delete('/countries/{id}', [V1\Admin\AdminCountryController::class, 'destroy']);
            Route::post('/countries/bulk-delete', [V1\Admin\AdminCountryController::class, 'bulkDestroy']);
            Route::delete('/zones/{id}', [V1\Admin\AdminZoneController::class, 'destroy']);
            Route::post('/zones/bulk-delete', [V1\Admin\AdminZoneController::class, 'bulkDestroy']);
            Route::delete('/cities/{id}', [V1\Admin\AdminCityController::class, 'destroy']);
            Route::post('/cities/bulk-delete', [V1\Admin\AdminCityController::class, 'bulkDestroy']);
        });

        // ========================
        // BRANCHES
        // ========================
        Route::prefix('branches')->group(function () {
            Route::middleware('admin.can:branches.view')->group(function () {
                Route::get('/', [V1\Admin\AdminBranchController::class, 'index']);
                Route::get('/{id}', [V1\Admin\AdminBranchController::class, 'show']);
            });
            Route::middleware('admin.can:branches.modify')->group(function () {
                Route::post('/', [V1\Admin\AdminBranchController::class, 'store']);
                Route::put('/{id}', [V1\Admin\AdminBranchController::class, 'update']);
            });
            Route::middleware('admin.can:branches.delete')->group(function () {
                Route::delete('/{id}', [V1\Admin\AdminBranchController::class, 'destroy']);
                Route::post('/bulk-delete', [V1\Admin\AdminBranchController::class, 'bulkDestroy']);
            });
        });

        // ========================
        // MEDIA
        // ========================
        Route::prefix('media')->group(function () {
            Route::middleware('admin.can:media.view')->group(function () {
                Route::get('/stats', [V1\Admin\AdminMediaController::class, 'stats']);
                Route::get('/folders', [V1\Admin\AdminMediaController::class, 'getFolders']);
                Route::get('/folders/{id}', [V1\Admin\AdminMediaController::class, 'showFolder']);
                Route::get('/', [V1\Admin\AdminMediaController::class, 'index']);
                Route::get('/{id}', [V1\Admin\AdminMediaController::class, 'show']);
            });
            Route::middleware('admin.can:media.upload')->group(function () {
                Route::post('/folders', [V1\Admin\AdminMediaController::class, 'createFolder']);
                Route::put('/folders/{id}', [V1\Admin\AdminMediaController::class, 'updateFolder']);
                Route::post('/upload', [V1\Admin\AdminMediaController::class, 'store']);
                Route::post('/bulk-upload', [V1\Admin\AdminMediaController::class, 'bulkUpload']);
                Route::post('/bulk-move', [V1\Admin\AdminMediaController::class, 'bulkMove']);
                Route::put('/{id}', [V1\Admin\AdminMediaController::class, 'update']);
            });
            Route::middleware('admin.can:media.delete')->group(function () {
                Route::delete('/folders/{id}', [V1\Admin\AdminMediaController::class, 'deleteFolder']);
                Route::post('/bulk-delete', [V1\Admin\AdminMediaController::class, 'bulkDestroy']);
                Route::delete('/{id}', [V1\Admin\AdminMediaController::class, 'destroy']);
            });
        });

        // ========================
        // SHIPPING (SMSA)
        // ========================
        Route::prefix('shipping')->group(function () {
            Route::middleware('admin.can:shipping.view')->group(function () {
                Route::get('/', [V1\Admin\AdminShippingController::class, 'index']);
                Route::get('/statistics', [V1\Admin\AdminShippingController::class, 'statistics']);
                Route::get('/smsa/label/{awb}', [V1\Admin\AdminShippingController::class, 'getLabel']);
                Route::get('/smsa/track/{awb}', [V1\Admin\AdminShippingController::class, 'track']);
                Route::get('/smsa/status/{awb}', [V1\Admin\AdminShippingController::class, 'status']);
                Route::get('/smsa/cities', [V1\Admin\AdminShippingController::class, 'getCities']);
                Route::get('/smsa/retails', [V1\Admin\AdminShippingController::class, 'getRetails']);
                Route::get('/order/{orderId}', [V1\Admin\AdminShippingController::class, 'getByOrder']);
                Route::get('/{id}', [V1\Admin\AdminShippingController::class, 'show']);
            });
            Route::middleware('admin.can:shipping.modify')->group(function () {
                Route::post('/smsa/create', [V1\Admin\AdminShippingController::class, 'createShipment']);
                Route::post('/smsa/bulk-create', [V1\Admin\AdminShippingController::class, 'bulkCreate']);
                Route::post('/smsa/charges', [V1\Admin\AdminShippingController::class, 'getShipCharges']);
                Route::post('/smsa/cancel/{awb}', [V1\Admin\AdminShippingController::class, 'cancel']);
            });
        });

        // ========================
        // HYPERPAY PAYMENTS
        // ========================
        Route::middleware('admin.can:payments.view')->group(function () {
            Route::get('/hyperpay/payments', [V1\Admin\AdminPaymentHyperpayController::class, 'index']);
        });
        Route::middleware('admin.can:payments.refund')->group(function () {
            Route::post('/hyperpay/payments/{order_id}/capture', [V1\Admin\AdminPaymentHyperpayController::class, 'capturePayment']);
            Route::post('/hyperpay/payments/{order_id}/refund', [V1\Admin\AdminPaymentHyperpayController::class, 'refundPayment']);
            Route::post('/hyperpay/payments/{order_id}/rebill', [V1\Admin\AdminPaymentHyperpayController::class, 'rebillPayment']);
            Route::post('/hyperpay/payments/{order_id}/reverse', [V1\Admin\AdminPaymentHyperpayController::class, 'reversePayment']);
        });

        // ========================
        // TAP PAYMENTS
        // ========================
        Route::middleware('admin.can:payments.view')->group(function () {
            Route::get('/tap/payments', [V1\Admin\AdminPaymentTapController::class, 'index']);
            Route::get('/tap/payments/{id}', [V1\Admin\AdminPaymentTapController::class, 'show']);
            Route::post('/tap/payments/{id}/sync', [V1\Admin\AdminPaymentTapController::class, 'syncStatus']);
        });
        Route::middleware('admin.can:payments.refund')->group(function () {
            Route::post('/tap/payments/{order_id}/refund', [V1\Admin\AdminPaymentTapController::class, 'refundPayment']);
        });

        // ========================
        // PAYTABS PAYMENTS
        // ========================
        Route::middleware('admin.can:payments.view')->group(function () {
            Route::get('/paytabs/payments', [V1\Admin\AdminPaymentPaytabsController::class, 'index']);
            Route::get('/paytabs/payments/{id}', [V1\Admin\AdminPaymentPaytabsController::class, 'show']);
            Route::post('/paytabs/payments/{id}/verify', [V1\Admin\AdminPaymentPaytabsController::class, 'verifyStatus']);
        });
        Route::middleware('admin.can:payments.refund')->group(function () {
            Route::post('/paytabs/payments/{order_id}/refund', [V1\Admin\AdminPaymentPaytabsController::class, 'refundPayment']);
            Route::post('/paytabs/payments/{order_id}/void', [V1\Admin\AdminPaymentPaytabsController::class, 'voidPayment']);
            Route::post('/paytabs/payments/{order_id}/capture', [V1\Admin\AdminPaymentPaytabsController::class, 'capturePayment']);
        });

        // ========================
        // LOYALTY POINTS
        // ========================
        Route::prefix('loyalty-points')->group(function () {
            Route::middleware('admin.can:loyalty.view')->group(function () {
                Route::get('/', [V1\Admin\AdminLoyaltyPointController::class, 'index']);
                Route::get('/statistics', [V1\Admin\AdminLoyaltyPointController::class, 'statistics']);
                Route::get('/customer/{customerId}', [V1\Admin\AdminLoyaltyPointController::class, 'customerSummary']);
                Route::get('/{id}', [V1\Admin\AdminLoyaltyPointController::class, 'show']);
            });
            Route::middleware('admin.can:loyalty.adjust')->group(function () {
                Route::post('/adjust', [V1\Admin\AdminLoyaltyPointController::class, 'adjust']);
                Route::delete('/{id}', [V1\Admin\AdminLoyaltyPointController::class, 'destroy']);
            });
        });

    });

});

