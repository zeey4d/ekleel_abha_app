<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminManufacturerController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');

        $query = DB::table('oc_manufacturer');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $manufacturers = $query->orderBy('name')->paginate($perPage);

        return response()->json(['success' => true, 'data' => $manufacturers]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:64|unique:oc_manufacturer,name'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $manufacturerId = DB::table('oc_manufacturer')->insertGetId([
                'name' => $request->name,
                'image' => $request->image ?? '',
                'sort_order' => $request->sort_order ?? 0
            ]);

            // Add to stores
            DB::table('oc_manufacturer_to_store')->insert([
                'manufacturer_id' => $manufacturerId,
                'store_id' => $request->store_id ?? 0
            ]);

            DB::commit();

            $manufacturer = DB::table('oc_manufacturer')->where('manufacturer_id', $manufacturerId)->first();

            return response()->json(['success' => true, 'message' => 'Manufacturer created successfully', 'data' => $manufacturer], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to create manufacturer', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $manufacturer = DB::table('oc_manufacturer')->where('manufacturer_id', $id)->first();

        if (!$manufacturer) {
            return response()->json(['success' => false, 'message' => 'Manufacturer not found'], 404);
        }

        // Get products count
        $productsCount = DB::table('oc_product')->where('manufacturer_id', $id)->count();
        $manufacturer->products_count = $productsCount;

        return response()->json(['success' => true, 'data' => $manufacturer]);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:64|unique:oc_manufacturer,name,' . $id . ',manufacturer_id'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $manufacturer = DB::table('oc_manufacturer')->where('manufacturer_id', $id)->first();
            if (!$manufacturer) {
                return response()->json(['success' => false, 'message' => 'Manufacturer not found'], 404);
            }

            $manufacturerData = [];
            if ($request->has('name')) $manufacturerData['name'] = $request->name;
            if ($request->has('image')) $manufacturerData['image'] = $request->image;
            if ($request->has('sort_order')) $manufacturerData['sort_order'] = $request->sort_order;

            if (!empty($manufacturerData)) {
                DB::table('oc_manufacturer')->where('manufacturer_id', $id)->update($manufacturerData);
            }

            DB::commit();

            $updatedManufacturer = DB::table('oc_manufacturer')->where('manufacturer_id', $id)->first();

            return response()->json(['success' => true, 'message' => 'Manufacturer updated successfully', 'data' => $updatedManufacturer]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to update manufacturer', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $manufacturer = DB::table('oc_manufacturer')->where('manufacturer_id', $id)->first();
            if (!$manufacturer) {
                return response()->json(['success' => false, 'message' => 'Manufacturer not found'], 404);
            }

            // Check if has products
            $hasProducts = DB::table('oc_product')->where('manufacturer_id', $id)->exists();
            if ($hasProducts) {
                return response()->json(['success' => false, 'message' => 'Cannot delete manufacturer with products'], 400);
            }

            DB::table('oc_manufacturer_to_store')->where('manufacturer_id', $id)->delete();
            DB::table('oc_manufacturer')->where('manufacturer_id', $id)->delete();

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Manufacturer deleted successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to delete manufacturer', 'error' => $e->getMessage()], 500);
        }
    }

    public function bulkDestroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            // Check for products
            $hasProducts = DB::table('oc_product')->whereIn('manufacturer_id', $request->ids)->exists();
            if ($hasProducts) {
                return response()->json(['success' => false, 'message' => 'Cannot delete manufacturers with products'], 400);
            }

            DB::table('oc_manufacturer_to_store')->whereIn('manufacturer_id', $request->ids)->delete();
            $deleted = DB::table('oc_manufacturer')->whereIn('manufacturer_id', $request->ids)->delete();

            DB::commit();

            return response()->json(['success' => true, 'message' => "Successfully deleted {$deleted} manufacturers"]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to delete manufacturers', 'error' => $e->getMessage()], 500);
        }
    }
}
