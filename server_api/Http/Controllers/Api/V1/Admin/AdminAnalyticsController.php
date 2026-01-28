<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsController extends Controller
{
    /**
     * Get dashboard analytics
     */
    public function dashboard(Request $request)
    {
        try {
            $dateFrom = $request->get('date_from', now()->subDays(30));
            $dateTo = $request->get('date_to', now());

            // Total sales
            $totalSales = DB::table('oc_order')
                ->whereBetween('date_added', [$dateFrom, $dateTo])
                ->whereIn('order_status_id', [2, 3, 5])
                ->sum('total');

            // Total orders
            $totalOrders = DB::table('oc_order')
                ->whereBetween('date_added', [$dateFrom, $dateTo])
                ->count();

            // Total customers
            $totalCustomers = DB::table('oc_customer')
                ->where('delete_status', 0)
                ->count();

            // New customers
            $newCustomers = DB::table('oc_customer')
                ->whereBetween('date_added', [$dateFrom, $dateTo])
                ->where('delete_status', 0)
                ->count();

            // Total products
            $totalProducts = DB::table('oc_product')->where('status', 1)->count();

            // Low stock products
            $lowStockProducts = DB::table('oc_product')
                ->where('status', 1)
                ->whereRaw('quantity <= minimum')
                ->count();

            // Pending orders
            $pendingOrders = DB::table('oc_order')
                ->where('order_status_id', 1)
                ->count();

            // Pending reviews
            $pendingReviews = DB::table('oc_review')
                ->where('status', 0)
                ->count();

            // Average order value
            $avgOrderValue = DB::table('oc_order')
                ->whereBetween('date_added', [$dateFrom, $dateTo])
                ->whereIn('order_status_id', [2, 3, 5])
                ->avg('total');

            // Sales chart data (daily)
            $salesChart = DB::table('oc_order')
                ->select(
                    DB::raw('DATE(date_added) as date'),
                    DB::raw('COUNT(*) as orders'),
                    DB::raw('SUM(total) as revenue')
                )
                ->whereBetween('date_added', [$dateFrom, $dateTo])
                ->whereIn('order_status_id', [2, 3, 5])
                ->groupBy(DB::raw('DATE(date_added)'))
                ->orderBy('date')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_sales' => round($totalSales ?? 0, 2),
                    'total_orders' => $totalOrders,
                    'total_customers' => $totalCustomers,
                    'new_customers' => $newCustomers,
                    'total_products' => $totalProducts,
                    'low_stock_products' => $lowStockProducts,
                    'pending_orders' => $pendingOrders,
                    'pending_reviews' => $pendingReviews,
                    'average_order_value' => round($avgOrderValue ?? 0, 2),
                    'sales_chart' => $salesChart,
                    'period' => [
                        'from' => $dateFrom,
                        'to' => $dateTo
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get dashboard analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sales analytics
     */
    public function sales(Request $request)
    {
        try {
            $dateFrom = $request->get('date_from', now()->subDays(30));
            $dateTo = $request->get('date_to', now());
            $groupBy = $request->get('group_by', 'day'); // day, week, month

            $dateFormat = match($groupBy) {
                'week' => '%Y-%u',
                'month' => '%Y-%m',
                default => '%Y-%m-%d'
            };

            $sales = DB::table('oc_order')
                ->select(
                    DB::raw("DATE_FORMAT(date_added, '{$dateFormat}') as period"),
                    DB::raw('COUNT(*) as total_orders'),
                    DB::raw('SUM(total) as total_revenue'),
                    DB::raw('AVG(total) as avg_order_value')
                )
                ->whereBetween('date_added', [$dateFrom, $dateTo])
                ->whereIn('order_status_id', [2, 3, 5])
                ->groupBy('period')
                ->orderBy('period')
                ->get();

            return response()->json(['success' => true, 'data' => $sales]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get sales analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get best selling products
     */
    public function bestSellingProducts(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            $dateFrom = $request->get('date_from', now()->subDays(30));
            $dateTo = $request->get('date_to', now());

            $products = DB::table('oc_order_product as op')
                ->join('oc_order as o', 'op.order_id', '=', 'o.order_id')
                ->join('oc_product_description as pd', function($join) {
                    $join->on('op.product_id', '=', 'pd.product_id')
                         ->where('pd.language_id', '=', 1);
                })
                ->select(
                    'op.product_id',
                    'pd.name',
                    DB::raw('SUM(op.quantity) as total_sold'),
                    DB::raw('SUM(op.total) as total_revenue')
                )
                ->whereBetween('o.date_added', [$dateFrom, $dateTo])
                ->whereIn('o.order_status_id', [2, 3, 5])
                ->groupBy('op.product_id', 'pd.name')
                ->orderBy('total_sold', 'desc')
                ->limit($limit)
                ->get();

            return response()->json(['success' => true, 'data' => $products]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get best selling products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get customer analytics
     */
    public function customers(Request $request)
    {
        try {
            $dateFrom = $request->get('date_from', now()->subDays(30));
            $dateTo = $request->get('date_to', now());

            // New customers over time
            $newCustomers = DB::table('oc_customer')
                ->select(
                    DB::raw('DATE(date_added) as date'),
                    DB::raw('COUNT(*) as count')
                )
                ->whereBetween('date_added', [$dateFrom, $dateTo])
                ->where('delete_status', 0)
                ->groupBy(DB::raw('DATE(date_added)'))
                ->orderBy('date')
                ->get();

            // Top customers by orders
            $topCustomers = DB::table('oc_customer as c')
                ->join('oc_order as o', 'c.customer_id', '=', 'o.customer_id')
                ->select(
                    'c.customer_id',
                    'c.firstname',
                    'c.lastname',
                    'c.email',
                    DB::raw('COUNT(o.order_id) as total_orders'),
                    DB::raw('SUM(o.total) as total_spent')
                )
                ->whereBetween('o.date_added', [$dateFrom, $dateTo])
                ->whereIn('o.order_status_id', [2, 3, 5])
                ->groupBy('c.customer_id', 'c.firstname', 'c.lastname', 'c.email')
                ->orderBy('total_spent', 'desc')
                ->limit(10)
                ->get();

            // Customer retention rate
            $totalCustomers = DB::table('oc_customer')->where('delete_status', 0)->count();
            $returningCustomers = DB::table('oc_order')
                ->select('customer_id', DB::raw('COUNT(*) as order_count'))
                ->where('customer_id', '>', 0)
                ->groupBy('customer_id')
                ->havingRaw('COUNT(*) > 1')
                ->get()
                ->count();

            $retentionRate = $totalCustomers > 0 ? ($returningCustomers / $totalCustomers) * 100 : 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'new_customers_chart' => $newCustomers,
                    'top_customers' => $topCustomers,
                    'retention_rate' => round($retentionRate, 2),
                    'total_customers' => $totalCustomers,
                    'returning_customers' => $returningCustomers
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get customer analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product performance analytics
     */
    public function productPerformance(Request $request)
    {
        try {
            // Products by category
            $productsByCategory = DB::table('oc_product as p')
                ->join('oc_product_to_category as ptc', 'p.product_id', '=', 'ptc.product_id')
                ->join('oc_category_description as cd', function($join) {
                    $join->on('ptc.category_id', '=', 'cd.category_id')
                         ->where('cd.language_id', '=', 1);
                })
                ->select('cd.name as category', DB::raw('COUNT(p.product_id) as count'))
                ->where('p.status', 1)
                ->groupBy('cd.name')
                ->orderBy('count', 'desc')
                ->get();

            // Stock status
            $inStock = DB::table('oc_product')->where('status', 1)->where('quantity', '>', 0)->count();
            $outOfStock = DB::table('oc_product')->where('status', 1)->where('quantity', '=', 0)->count();
            $lowStock = DB::table('oc_product')
                ->where('status', 1)
                ->whereRaw('quantity > 0 AND quantity <= minimum')
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'products_by_category' => $productsByCategory,
                    'stock_status' => [
                        'in_stock' => $inStock,
                        'out_of_stock' => $outOfStock,
                        'low_stock' => $lowStock
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get product performance',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
