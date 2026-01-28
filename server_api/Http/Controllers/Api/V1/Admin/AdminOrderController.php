<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminOrderController extends Controller
{
    /**
     * Display a listing of orders
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $statusId = $request->get('order_status_id');
        $customerId = $request->get('customer_id');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        $query = DB::table('oc_order as o')
            ->leftJoin('oc_order_status as os', function($join) {
                $join->on('o.order_status_id', '=', 'os.order_status_id')
                     ->where('os.language_id', '=', 1);
            })
            ->select(
                'o.*',
                'os.name as order_status_name'
            );

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('o.order_id', 'like', "%{$search}%")
                  ->orWhere('o.firstname', 'like', "%{$search}%")
                  ->orWhere('o.lastname', 'like', "%{$search}%")
                  ->orWhere('o.email', 'like', "%{$search}%")
                  ->orWhere('o.telephone', 'like', "%{$search}%");
            });
        }

        if ($statusId !== null) {
            $query->where('o.order_status_id', $statusId);
        }

        if ($customerId) {
            $query->where('o.customer_id', $customerId);
        }

        if ($dateFrom) {
            $query->where('o.date_added', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->where('o.date_added', '<=', $dateTo);
        }

        $orders = $query->orderBy('o.date_added', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Display the specified order
     */
    public function show($id)
    {
        $order = DB::table('oc_order as o')
            ->leftJoin('oc_order_status as os', function($join) {
                $join->on('o.order_status_id', '=', 'os.order_status_id')
                     ->where('os.language_id', '=', 1);
            })
            ->where('o.order_id', $id)
            ->select('o.*', 'os.name as order_status_name')
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        // Get order products
        $products = DB::table('oc_order_product')
            ->where('order_id', $id)
            ->get();

        // Get order totals
        $totals = DB::table('oc_order_total')
            ->where('order_id', $id)
            ->orderBy('sort_order')
            ->get();

        // Get order history
        $history = DB::table('oc_order_history as oh')
            ->leftJoin('oc_order_status as os', function($join) {
                $join->on('oh.order_status_id', '=', 'os.order_status_id')
                     ->where('os.language_id', '=', 1);
            })
            ->where('oh.order_id', $id)
            ->select('oh.*', 'os.name as status_name')
            ->orderBy('oh.date_added', 'desc')
            ->get();

        $order->products = $products;
        $order->totals = $totals;
        $order->history = $history;

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'order_status_id' => 'required|integer',
            'comment' => 'sometimes|string',
            'notify' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Check if order exists
            $order = DB::table('oc_order')->where('order_id', $id)->first();
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Update order status
            DB::table('oc_order')
                ->where('order_id', $id)
                ->update([
                    'order_status_id' => $request->order_status_id,
                    'date_modified' => now()
                ]);

            // Add history record
            DB::table('oc_order_history')->insert([
                'order_id' => $id,
                'order_status_id' => $request->order_status_id,
                'notify' => $request->notify ?? 0,
                'comment' => $request->comment ?? '',
                'date_added' => now()
            ]);

            DB::commit();

            $updatedOrder = DB::table('oc_order as o')
                ->leftJoin('oc_order_status as os', function($join) {
                    $join->on('o.order_status_id', '=', 'os.order_status_id')
                         ->where('os.language_id', '=', 1);
                })
                ->where('o.order_id', $id)
                ->select('o.*', 'os.name as order_status_name')
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => $updatedOrder
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete order
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $order = DB::table('oc_order')->where('order_id', $id)->first();
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Delete related records
            DB::table('oc_order_history')->where('order_id', $id)->delete();
            DB::table('oc_order_option')->where('order_id', $id)->delete();
            DB::table('oc_order_product')->where('order_id', $id)->delete();
            DB::table('oc_order_recurring')->where('order_id', $id)->delete();
            DB::table('oc_order_recurring_transaction')->where('order_id', $id)->delete();
            DB::table('oc_order_total')->where('order_id', $id)->delete();
            DB::table('oc_order_voucher')->where('order_id', $id)->delete();
            
            // Delete order
            DB::table('oc_order')->where('order_id', $id)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete orders
     */
    public function bulkDestroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $ids = $request->ids;
            
            // Delete related records
            DB::table('oc_order_history')->whereIn('order_id', $ids)->delete();
            DB::table('oc_order_option')->whereIn('order_id', $ids)->delete();
            DB::table('oc_order_product')->whereIn('order_id', $ids)->delete();
            DB::table('oc_order_recurring')->whereIn('order_id', $ids)->delete();
            DB::table('oc_order_recurring_transaction')->whereIn('order_id', $ids)->delete();
            DB::table('oc_order_total')->whereIn('order_id', $ids)->delete();
            DB::table('oc_order_voucher')->whereIn('order_id', $ids)->delete();
            
            // Delete orders
            $deleted = DB::table('oc_order')->whereIn('order_id', $ids)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deleted} orders"
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update order status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'required|integer',
            'order_status_id' => 'required|integer',
            'comment' => 'sometimes|string',
            'notify' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $ids = $request->ids;
            
            // Update order statuses
            $updated = DB::table('oc_order')
                ->whereIn('order_id', $ids)
                ->update([
                    'order_status_id' => $request->order_status_id,
                    'date_modified' => now()
                ]);

            // Add history records for each order
            foreach ($ids as $orderId) {
                DB::table('oc_order_history')->insert([
                    'order_id' => $orderId,
                    'order_status_id' => $request->order_status_id,
                    'notify' => $request->notify ?? 0,
                    'comment' => $request->comment ?? '',
                    'date_added' => now()
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully updated {$updated} orders"
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order statistics
     */
    public function statistics(Request $request)
    {
        try {
            $dateFrom = $request->get('date_from', now()->subDays(30));
            $dateTo = $request->get('date_to', now());

            // Total orders
            $totalOrders = DB::table('oc_order')
                ->whereBetween('date_added', [$dateFrom, $dateTo])
                ->count();

            // Total revenue
            $totalRevenue = DB::table('oc_order')
                ->whereBetween('date_added', [$dateFrom, $dateTo])
                ->whereIn('order_status_id', [2, 3, 5]) // Completed statuses
                ->sum('total');

            // Orders by status
            $ordersByStatus = DB::table('oc_order as o')
                ->leftJoin('oc_order_status as os', function($join) {
                    $join->on('o.order_status_id', '=', 'os.order_status_id')
                         ->where('os.language_id', '=', 1);
                })
                ->whereBetween('o.date_added', [$dateFrom, $dateTo])
                ->select('o.order_status_id', 'os.name as status_name', DB::raw('COUNT(*) as count'))
                ->groupBy('o.order_status_id', 'os.name')
                ->get();

            // Average order value
            $avgOrderValue = DB::table('oc_order')
                ->whereBetween('date_added', [$dateFrom, $dateTo])
                ->whereIn('order_status_id', [2, 3, 5])
                ->avg('total');

            return response()->json([
                'success' => true,
                'data' => [
                    'total_orders' => $totalOrders,
                    'total_revenue' => round($totalRevenue ?? 0, 2),
                    'average_order_value' => round($avgOrderValue ?? 0, 2),
                    'orders_by_status' => $ordersByStatus,
                    'period' => [
                        'from' => $dateFrom,
                        'to' => $dateTo
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get order statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
