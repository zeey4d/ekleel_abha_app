<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminCouponController extends Controller
{
    /**
     * Display a listing of coupons
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');

        $query = DB::table('oc_coupon');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($status !== null) {
            $query->where('status', $status);
        }

        $coupons = $query->orderBy('date_added', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $coupons
        ]);
    }

    /**
     * Store a newly created coupon
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:128',
            'code' => 'required|string|max:20|unique:oc_coupon,code',
            'type' => 'required|in:F,P', // F = Fixed, P = Percentage
            'discount' => 'required|numeric|min:0',
            'status' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Insert coupon
            $couponId = DB::table('oc_coupon')->insertGetId([
                'name' => $request->name,
                'code' => $request->code,
                'type' => $request->type,
                'discount' => $request->discount,
                'logged' => $request->logged ?? 0,
                'shipping' => $request->shipping ?? 0,
                'total' => $request->total ?? 0,
                'date_start' => $request->date_start ?? now()->toDateString(),
                'date_end' => $request->date_end ?? now()->addYear()->toDateString(),
                'uses_total' => $request->uses_total ?? 1,
                'uses_customer' => $request->uses_customer ?? 1,
                'status' => $request->status,
                'date_added' => now(),
                'customer_id' => $request->customer_id ?? null,
                'cu_percent' => $request->cu_percent ?? null,
                'cu_percent2' => $request->cu_percent2 ?? null
            ]);

            // Add product restrictions
            if ($request->has('product_ids') && is_array($request->product_ids)) {
                foreach ($request->product_ids as $productId) {
                    DB::table('oc_coupon_product')->insert([
                        'coupon_id' => $couponId,
                        'product_id' => $productId
                    ]);
                }
            }

            // Add category restrictions
            if ($request->has('category_ids') && is_array($request->category_ids)) {
                foreach ($request->category_ids as $categoryId) {
                    DB::table('oc_coupon_category')->insert([
                        'coupon_id' => $couponId,
                        'category_id' => $categoryId
                    ]);
                }
            }

            DB::commit();

            $coupon = DB::table('oc_coupon')->where('coupon_id', $couponId)->first();

            return response()->json([
                'success' => true,
                'message' => 'Coupon created successfully',
                'data' => $coupon
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create coupon',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified coupon
     */
    public function show($id)
    {
        $coupon = DB::table('oc_coupon')->where('coupon_id', $id)->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Coupon not found'
            ], 404);
        }

        // Get products
        $products = DB::table('oc_coupon_product as cp')
            ->join('oc_product_description as pd', 'cp.product_id', '=', 'pd.product_id')
            ->where('cp.coupon_id', $id)
            ->where('pd.language_id', 1)
            ->select('cp.product_id', 'pd.name')
            ->get();

        // Get categories
        $categories = DB::table('oc_coupon_category as cc')
            ->join('oc_category_description as cd', 'cc.category_id', '=', 'cd.category_id')
            ->where('cc.coupon_id', $id)
            ->where('cd.language_id', 1)
            ->select('cc.category_id', 'cd.name')
            ->get();

        // Get usage history
        $history = DB::table('oc_coupon_history as ch')
            ->join('oc_order as o', 'ch.order_id', '=', 'o.order_id')
            ->where('ch.coupon_id', $id)
            ->select('ch.*', 'o.firstname', 'o.lastname')
            ->orderBy('ch.date_added', 'desc')
            ->get();

        $coupon->products = $products;
        $coupon->categories = $categories;
        $coupon->history = $history;

        return response()->json([
            'success' => true,
            'data' => $coupon
        ]);
    }

    /**
     * Update the specified coupon
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:128',
            'code' => 'sometimes|required|string|max:20|unique:oc_coupon,code,' . $id . ',coupon_id',
            'type' => 'sometimes|required|in:F,P',
            'discount' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Check if coupon exists
            $coupon = DB::table('oc_coupon')->where('coupon_id', $id)->first();
            if (!$coupon) {
                return response()->json([
                    'success' => false,
                    'message' => 'Coupon not found'
                ], 404);
            }

            // Update coupon
            $couponData = [];
            $fillable = ['name', 'code', 'type', 'discount', 'logged', 'shipping', 'total',
                        'date_start', 'date_end', 'uses_total', 'uses_customer', 'status',
                        'customer_id', 'cu_percent', 'cu_percent2'];

            foreach ($fillable as $field) {
                if ($request->has($field)) {
                    $couponData[$field] = $request->$field;
                }
            }

            if (!empty($couponData)) {
                DB::table('oc_coupon')->where('coupon_id', $id)->update($couponData);
            }

            // Update product restrictions
            if ($request->has('product_ids')) {
                DB::table('oc_coupon_product')->where('coupon_id', $id)->delete();
                if (is_array($request->product_ids)) {
                    foreach ($request->product_ids as $productId) {
                        DB::table('oc_coupon_product')->insert([
                            'coupon_id' => $id,
                            'product_id' => $productId
                        ]);
                    }
                }
            }

            // Update category restrictions
            if ($request->has('category_ids')) {
                DB::table('oc_coupon_category')->where('coupon_id', $id)->delete();
                if (is_array($request->category_ids)) {
                    foreach ($request->category_ids as $categoryId) {
                        DB::table('oc_coupon_category')->insert([
                            'coupon_id' => $id,
                            'category_id' => $categoryId
                        ]);
                    }
                }
            }

            DB::commit();

            $updatedCoupon = DB::table('oc_coupon')->where('coupon_id', $id)->first();

            return response()->json([
                'success' => true,
                'message' => 'Coupon updated successfully',
                'data' => $updatedCoupon
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update coupon',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified coupon
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $coupon = DB::table('oc_coupon')->where('coupon_id', $id)->first();
            if (!$coupon) {
                return response()->json([
                    'success' => false,
                    'message' => 'Coupon not found'
                ], 404);
            }

            // Delete related records
            DB::table('oc_coupon_product')->where('coupon_id', $id)->delete();
            DB::table('oc_coupon_category')->where('coupon_id', $id)->delete();
            DB::table('oc_coupon_history')->where('coupon_id', $id)->delete();
            
            // Delete coupon
            DB::table('oc_coupon')->where('coupon_id', $id)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Coupon deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete coupon',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete coupons
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
            DB::table('oc_coupon_product')->whereIn('coupon_id', $ids)->delete();
            DB::table('oc_coupon_category')->whereIn('coupon_id', $ids)->delete();
            DB::table('oc_coupon_history')->whereIn('coupon_id', $ids)->delete();
            
            // Delete coupons
            $deleted = DB::table('oc_coupon')->whereIn('coupon_id', $ids)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deleted} coupons"
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete coupons',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update coupon status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'required|integer',
            'status' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updated = DB::table('oc_coupon')
                ->whereIn('coupon_id', $request->ids)
                ->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => "Successfully updated {$updated} coupons"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update coupons',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
