<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class AdminCustomerController extends Controller
{
    /**
     * Display a listing of customers
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');
        $customerGroupId = $request->get('customer_group_id');

        $query = DB::table('oc_customer as c')
            ->leftJoin('oc_customer_group_description as cgd', function($join) {
                $join->on('c.customer_group_id', '=', 'cgd.customer_group_id')
                     ->where('cgd.language_id', '=', 1);
            })
            ->select(
                'c.*',
                'cgd.name as customer_group_name'
            );

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('c.firstname', 'like', "%{$search}%")
                  ->orWhere('c.lastname', 'like', "%{$search}%")
                  ->orWhere('c.email', 'like', "%{$search}%")
                  ->orWhere('c.telephone', 'like', "%{$search}%");
            });
        }

        if ($status !== null) {
            $query->where('c.status', $status);
        }

        if ($customerGroupId) {
            $query->where('c.customer_group_id', $customerGroupId);
        }

        $customers = $query->orderBy('c.date_added', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $customers
        ]);
    }

    /**
     * Store a newly created customer
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'firstname' => 'required|string|max:32',
            'lastname' => 'required|string|max:32',
            'email' => 'required|email|max:96|unique:oc_customer,email',
            'telephone' => 'required|string|max:32',
            'password' => 'required|string|min:6',
            'customer_group_id' => 'required|integer',
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
            $salt = substr(md5(uniqid(rand(), true)), 0, 9);
            $password = sha1($salt . sha1($salt . sha1($request->password)));

            // Insert customer
            $customerId = DB::table('oc_customer')->insertGetId([
                'customer_group_id' => $request->customer_group_id,
                'store_id' => $request->store_id ?? 0,
                'language_id' => $request->language_id ?? 1,
                'firstname' => $request->firstname,
                'lastname' => $request->lastname,
                'email' => $request->email,
                'telephone' => $request->telephone,
                'fax' => $request->fax ?? '',
                'password' => $password,
                'salt' => $salt,
                'newsletter' => $request->newsletter ?? 0,
                'custom_field' => $request->custom_field ?? '',
                'ip' => $request->ip(),
                'status' => $request->status,
                'safe' => $request->safe ?? 0,
                'token' => '',
                'code' => '',
                'verify_code' => null,
                'status_code' => $request->status_code ?? 0,
                'delete_status' => 0,
                'from_come' => $request->from_come ?? 'admin',
                'is_marketer' => $request->is_marketer ?? 0,
                'date_added' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();

            $customer = DB::table('oc_customer')->where('customer_id', $customerId)->first();

            return response()->json([
                'success' => true,
                'message' => 'Customer created successfully',
                'data' => $customer
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified customer
     */
    public function show($id)
    {
        $customer = DB::table('oc_customer as c')
            ->leftJoin('oc_customer_group_description as cgd', function($join) {
                $join->on('c.customer_group_id', '=', 'cgd.customer_group_id')
                     ->where('cgd.language_id', '=', 1);
            })
            ->where('c.customer_id', $id)
            ->select('c.*', 'cgd.name as customer_group_name')
            ->first();

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);
        }

        // Remove sensitive data
        unset($customer->password);
        unset($customer->salt);
        unset($customer->token);

        // Get addresses
        $addresses = DB::table('oc_address')
            ->where('customer_id', $id)
            ->get();

        // Get orders count
        $ordersCount = DB::table('oc_order')
            ->where('customer_id', $id)
            ->count();

        // Get total spent
        $totalSpent = DB::table('oc_order')
            ->where('customer_id', $id)
            ->whereIn('order_status_id', [2, 3, 5]) // Completed statuses
            ->sum('total');

        $customer->addresses = $addresses;
        $customer->orders_count = $ordersCount;
        $customer->total_spent = $totalSpent ?? 0;

        return response()->json([
            'success' => true,
            'data' => $customer
        ]);
    }

    /**
     * Update the specified customer
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'firstname' => 'sometimes|required|string|max:32',
            'lastname' => 'sometimes|required|string|max:32',
            'email' => 'sometimes|required|email|max:96|unique:oc_customer,email,' . $id . ',customer_id',
            'telephone' => 'sometimes|required|string|max:32',
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
            // Check if customer exists
            $customer = DB::table('oc_customer')->where('customer_id', $id)->first();
            if (!$customer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer not found'
                ], 404);
            }

            // Update customer
            $customerData = [];
            $fillable = ['customer_group_id', 'store_id', 'language_id', 'firstname', 'lastname', 
                        'email', 'telephone', 'fax', 'newsletter', 'custom_field', 'status', 
                        'safe', 'status_code', 'is_marketer'];

            foreach ($fillable as $field) {
                if ($request->has($field)) {
                    $customerData[$field] = $request->$field;
                }
            }

            // Update password if provided
            if ($request->has('password') && !empty($request->password)) {
                $salt = substr(md5(uniqid(rand(), true)), 0, 9);
                $customerData['password'] = sha1($salt . sha1($salt . sha1($request->password)));
                $customerData['salt'] = $salt;
            }

            if (!empty($customerData)) {
                $customerData['updated_at'] = now();
                DB::table('oc_customer')->where('customer_id', $id)->update($customerData);
            }

            DB::commit();

            $updatedCustomer = DB::table('oc_customer')->where('customer_id', $id)->first();
            unset($updatedCustomer->password);
            unset($updatedCustomer->salt);
            unset($updatedCustomer->token);

            return response()->json([
                'success' => true,
                'message' => 'Customer updated successfully',
                'data' => $updatedCustomer
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified customer
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $customer = DB::table('oc_customer')->where('customer_id', $id)->first();
            if (!$customer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer not found'
                ], 404);
            }

            // Soft delete - mark as deleted
            DB::table('oc_customer')
                ->where('customer_id', $id)
                ->update([
                    'delete_status' => 1,
                    'status' => 0,
                    'updated_at' => now()
                ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Customer deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete customer
     */
    public function forceDestroy($id)
    {
        DB::beginTransaction();
        try {
            $customer = DB::table('oc_customer')->where('customer_id', $id)->first();
            if (!$customer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer not found'
                ], 404);
            }

            // Delete related records
            DB::table('oc_address')->where('customer_id', $id)->delete();
            DB::table('oc_customer_activity')->where('customer_id', $id)->delete();
            DB::table('oc_customer_ip')->where('customer_id', $id)->delete();
            DB::table('oc_customer_reward')->where('customer_id', $id)->delete();
            DB::table('oc_customer_transaction')->where('customer_id', $id)->delete();
            DB::table('oc_customer_wishlist')->where('customer_id', $id)->delete();
            
            // Delete customer
            DB::table('oc_customer')->where('customer_id', $id)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Customer permanently deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete customers
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

        try {
            // Soft delete
            $updated = DB::table('oc_customer')
                ->whereIn('customer_id', $request->ids)
                ->update([
                    'delete_status' => 1,
                    'status' => 0,
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$updated} customers"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete customers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update customer status
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
            $updated = DB::table('oc_customer')
                ->whereIn('customer_id', $request->ids)
                ->update([
                    'status' => $request->status,
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully updated {$updated} customers"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update customers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update customer group
     */
    public function bulkUpdateGroup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'required|integer',
            'customer_group_id' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updated = DB::table('oc_customer')
                ->whereIn('customer_id', $request->ids)
                ->update([
                    'customer_group_id' => $request->customer_group_id,
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully updated group for {$updated} customers"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update customer group',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
