<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminProductController extends Controller
{
    /**
     * Display a listing of products
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');
        $categoryId = $request->get('category_id');

        $query = DB::table('oc_product as p')
            ->leftJoin('oc_product_description as pd', function($join) {
                $join->on('p.product_id', '=', 'pd.product_id')
                     ->where('pd.language_id', '=', 1);
            })
            ->leftJoin('oc_manufacturer as m', 'p.manufacturer_id', '=', 'm.manufacturer_id')
            ->select(
                'p.*',
                'pd.name',
                'pd.description',
                'pd.meta_title',
                'pd.meta_description',
                'pd.meta_keyword',
                'm.name as manufacturer_name'
            );

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('pd.name', 'like', "%{$search}%")
                  ->orWhere('p.model', 'like', "%{$search}%")
                  ->orWhere('p.sku', 'like', "%{$search}%");
            });
        }

        if ($status !== null) {
            $query->where('p.status', $status);
        }

        if ($categoryId) {
            $query->join('oc_product_to_category as pc', 'p.product_id', '=', 'pc.product_id')
                  ->where('pc.category_id', $categoryId);
        }

        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * Store a newly created product
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'model' => 'required|string|max:64',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'status' => 'required|boolean',
            'language_id' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Insert product
            $productId = DB::table('oc_product')->insertGetId([
                'model' => $request->model,
                'sku' => $request->sku ?? '',
                'upc' => $request->upc ?? '',
                'ean' => $request->ean ?? '',
                'jan' => $request->jan ?? '',
                'isbn' => $request->isbn ?? '',
                'mpn' => $request->mpn ?? '',
                'location' => $request->location ?? '',
                'quantity' => $request->quantity,
                'stock_status_id' => $request->stock_status_id ?? 1,
                'image' => $request->image ?? '',
                'manufacturer_id' => $request->manufacturer_id ?? 0,
                'shipping' => $request->shipping ?? 1,
                'price' => $request->price,
                'points' => $request->points ?? 0,
                'tax_class_id' => $request->tax_class_id ?? 0,
                'date_available' => $request->date_available ?? now(),
                'weight' => $request->weight ?? 0,
                'weight_class_id' => $request->weight_class_id ?? 1,
                'length' => $request->length ?? 0,
                'width' => $request->width ?? 0,
                'height' => $request->height ?? 0,
                'length_class_id' => $request->length_class_id ?? 1,
                'subtract' => $request->subtract ?? 1,
                'minimum' => $request->minimum ?? 1,
                'sort_order' => $request->sort_order ?? 0,
                'status' => $request->status,
                'viewed' => 0,
                'date_added' => now(),
                'date_modified' => now(),
                'import_batch' => $request->import_batch ?? null,
                'maxmum' => $request->maximum ?? 0
            ]);

            // Insert product description
            DB::table('oc_product_description')->insert([
                'product_id' => $productId,
                'language_id' => $request->language_id,
                'name' => $request->name,
                'description' => $request->description ?? '',
                'tag' => $request->tag ?? '',
                'meta_title' => $request->meta_title ?? $request->name,
                'meta_description' => $request->meta_description ?? '',
                'meta_keyword' => $request->meta_keyword ?? '',
                'video' => $request->video ?? '',
                'html_product_tab' => $request->html_product_tab ?? '',
                'tab_title' => $request->tab_title ?? ''
            ]);

            // Insert product to store
            DB::table('oc_product_to_store')->insert([
                'product_id' => $productId,
                'store_id' => $request->store_id ?? 0
            ]);

            // Insert product to categories
            if ($request->has('category_ids') && is_array($request->category_ids)) {
                foreach ($request->category_ids as $categoryId) {
                    DB::table('oc_product_to_category')->insert([
                        'product_id' => $productId,
                        'category_id' => $categoryId
                    ]);
                }
            }

            DB::commit();

            $product = DB::table('oc_product as p')
                ->leftJoin('oc_product_description as pd', 'p.product_id', '=', 'pd.product_id')
                ->where('p.product_id', $productId)
                ->where('pd.language_id', $request->language_id)
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => $product
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified product
     */
    public function show($id)
    {
        $product = DB::table('oc_product as p')
            ->leftJoin('oc_product_description as pd', function($join) {
                $join->on('p.product_id', '=', 'pd.product_id')
                     ->where('pd.language_id', '=', 1);
            })
            ->leftJoin('oc_manufacturer as m', 'p.manufacturer_id', '=', 'm.manufacturer_id')
            ->where('p.product_id', $id)
            ->select('p.*', 'pd.*', 'm.name as manufacturer_name')
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        // Get categories
        $categories = DB::table('oc_product_to_category as pc')
            ->join('oc_category_description as cd', 'pc.category_id', '=', 'cd.category_id')
            ->where('pc.product_id', $id)
            ->where('cd.language_id', 1)
            ->select('pc.category_id', 'cd.name')
            ->get();

        // Get images
        $images = DB::table('oc_product_image')
            ->where('product_id', $id)
            ->orderBy('sort_order')
            ->get();

        $product->categories = $categories;
        $product->images = $images;

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * Update the specified product
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'model' => 'sometimes|required|string|max:64',
            'price' => 'sometimes|required|numeric|min:0',
            'quantity' => 'sometimes|required|integer|min:0',
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
            // Check if product exists
            $product = DB::table('oc_product')->where('product_id', $id)->first();
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            // Update product
            $productData = [];
            $fillable = ['model', 'sku', 'upc', 'ean', 'jan', 'isbn', 'mpn', 'location', 
                        'quantity', 'stock_status_id', 'image', 'manufacturer_id', 'shipping',
                        'price', 'points', 'tax_class_id', 'date_available', 'weight', 
                        'weight_class_id', 'length', 'width', 'height', 'length_class_id',
                        'subtract', 'minimum', 'sort_order', 'status', 'import_batch', 'maximum'];

            foreach ($fillable as $field) {
                if ($request->has($field)) {
                    // Handle maxmum field mapping (typo in database)
                    if ($field === 'maximum') {
                        $productData['maxmum'] = $request->$field;
                    } else {
                        $productData[$field] = $request->$field;
                    }
                }
            }

            if (!empty($productData)) {
                $productData['date_modified'] = now();
                DB::table('oc_product')->where('product_id', $id)->update($productData);
            }

            // Update product description
            if ($request->has('name') || $request->has('description') || $request->has('meta_title')) {
                $descData = [];
                $descFillable = ['name', 'description', 'tag', 'meta_title', 'meta_description', 'meta_keyword', 'video', 'html_product_tab', 'tab_title'];
                
                foreach ($descFillable as $field) {
                    if ($request->has($field)) {
                        $descData[$field] = $request->$field;
                    }
                }

                if (!empty($descData)) {
                    DB::table('oc_product_description')
                        ->where('product_id', $id)
                        ->where('language_id', $request->language_id ?? 1)
                        ->update($descData);
                }
            }

            // Update categories
            if ($request->has('category_ids') && is_array($request->category_ids)) {
                DB::table('oc_product_to_category')->where('product_id', $id)->delete();
                foreach ($request->category_ids as $categoryId) {
                    DB::table('oc_product_to_category')->insert([
                        'product_id' => $id,
                        'category_id' => $categoryId
                    ]);
                }
            }

            DB::commit();

            $updatedProduct = DB::table('oc_product as p')
                ->leftJoin('oc_product_description as pd', 'p.product_id', '=', 'pd.product_id')
                ->where('p.product_id', $id)
                ->where('pd.language_id', $request->language_id ?? 1)
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $updatedProduct
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified product
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $product = DB::table('oc_product')->where('product_id', $id)->first();
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            // Delete related records
            DB::table('oc_product_description')->where('product_id', $id)->delete();
            DB::table('oc_product_to_category')->where('product_id', $id)->delete();
            DB::table('oc_product_to_store')->where('product_id', $id)->delete();
            DB::table('oc_product_image')->where('product_id', $id)->delete();
            DB::table('oc_product_option')->where('product_id', $id)->delete();
            DB::table('oc_product_discount')->where('product_id', $id)->delete();
            DB::table('oc_product_special')->where('product_id', $id)->delete();
            
            // Delete product
            DB::table('oc_product')->where('product_id', $id)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete products
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
            DB::table('oc_product_description')->whereIn('product_id', $ids)->delete();
            DB::table('oc_product_to_category')->whereIn('product_id', $ids)->delete();
            DB::table('oc_product_to_store')->whereIn('product_id', $ids)->delete();
            DB::table('oc_product_image')->whereIn('product_id', $ids)->delete();
            DB::table('oc_product_option')->whereIn('product_id', $ids)->delete();
            DB::table('oc_product_discount')->whereIn('product_id', $ids)->delete();
            DB::table('oc_product_special')->whereIn('product_id', $ids)->delete();
            
            // Delete products
            $deleted = DB::table('oc_product')->whereIn('product_id', $ids)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deleted} products"
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update product status
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
            $updated = DB::table('oc_product')
                ->whereIn('product_id', $request->ids)
                ->update([
                    'status' => $request->status,
                    'date_modified' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully updated {$updated} products"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update product prices
     */
    public function bulkUpdatePrice(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'required|integer',
            'price' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updated = DB::table('oc_product')
                ->whereIn('product_id', $request->ids)
                ->update([
                    'price' => $request->price,
                    'date_modified' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully updated prices for {$updated} products"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product prices',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update product stock
     */
    public function bulkUpdateStock(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'required|integer',
            'quantity' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updated = DB::table('oc_product')
                ->whereIn('product_id', $request->ids)
                ->update([
                    'quantity' => $request->quantity,
                    'date_modified' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully updated stock for {$updated} products"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
