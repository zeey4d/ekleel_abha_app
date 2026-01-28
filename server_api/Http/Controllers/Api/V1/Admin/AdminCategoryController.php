<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminCategoryController extends Controller
{
    /**
     * Display a listing of categories
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');
        $parentId = $request->get('parent_id');

        $query = DB::table('oc_category as c')
            ->leftJoin('oc_category_description as cd', function($join) {
                $join->on('c.category_id', '=', 'cd.category_id')
                     ->where('cd.language_id', '=', 1);
            })
            ->select('c.*', 'cd.name', 'cd.description', 'cd.meta_title', 'cd.meta_description');

        if ($search) {
            $query->where('cd.name', 'like', "%{$search}%");
        }

        if ($status !== null) {
            $query->where('c.status', $status);
        }

        if ($parentId !== null) {
            $query->where('c.parent_id', $parentId);
        }

        $categories = $query->orderBy('c.sort_order')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Store a newly created category
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'status' => 'required|boolean',
            'language_id' => 'required|integer',
            'parent_id' => 'sometimes|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Insert category
            $categoryId = DB::table('oc_category')->insertGetId([
                'image' => $request->image ?? '',
                'parent_id' => $request->parent_id ?? 0,
                'top' => $request->top ?? 0,
                'column' => $request->column ?? 1,
                'sort_order' => $request->sort_order ?? 0,
                'status' => $request->status,
                'date_added' => now(),
                'date_modified' => now(),
                'code' => $request->code ?? null
            ]);

            // Insert category description
            DB::table('oc_category_description')->insert([
                'category_id' => $categoryId,
                'language_id' => $request->language_id,
                'name' => $request->name,
                'description' => $request->description ?? '',
                'meta_title' => $request->meta_title ?? $request->name,
                'meta_description' => $request->meta_description ?? '',
                'meta_keyword' => $request->meta_keyword ?? ''
            ]);

            // Insert category to store
            DB::table('oc_category_to_store')->insert([
                'category_id' => $categoryId,
                'store_id' => $request->store_id ?? 0
            ]);

            // Build category path
            $this->buildCategoryPath($categoryId);

            DB::commit();

            $category = DB::table('oc_category as c')
                ->leftJoin('oc_category_description as cd', 'c.category_id', '=', 'cd.category_id')
                ->where('c.category_id', $categoryId)
                ->where('cd.language_id', $request->language_id)
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Category created successfully',
                'data' => $category
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified category
     */
    public function show($id)
    {
        $category = DB::table('oc_category as c')
            ->leftJoin('oc_category_description as cd', function($join) {
                $join->on('c.category_id', '=', 'cd.category_id')
                     ->where('cd.language_id', '=', 1);
            })
            ->where('c.category_id', $id)
            ->select('c.*', 'cd.*')
            ->first();

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }

        // Get subcategories count
        $subcategoriesCount = DB::table('oc_category')
            ->where('parent_id', $id)
            ->count();

        // Get products count
        $productsCount = DB::table('oc_product_to_category')
            ->where('category_id', $id)
            ->count();

        $category->subcategories_count = $subcategoriesCount;
        $category->products_count = $productsCount;

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    /**
     * Update the specified category
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
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
            // Check if category exists
            $category = DB::table('oc_category')->where('category_id', $id)->first();
            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            // Update category
            $categoryData = [];
            $fillable = ['image', 'parent_id', 'top', 'column', 'sort_order', 'status', 'code'];

            foreach ($fillable as $field) {
                if ($request->has($field)) {
                    $categoryData[$field] = $request->$field;
                }
            }

            if (!empty($categoryData)) {
                $categoryData['date_modified'] = now();
                DB::table('oc_category')->where('category_id', $id)->update($categoryData);
            }

            // Update category description
            if ($request->has('name') || $request->has('description') || $request->has('meta_title')) {
                $descData = [];
                $descFillable = ['name', 'description', 'meta_title', 'meta_description', 'meta_keyword'];
                
                foreach ($descFillable as $field) {
                    if ($request->has($field)) {
                        $descData[$field] = $request->$field;
                    }
                }

                if (!empty($descData)) {
                    DB::table('oc_category_description')
                        ->where('category_id', $id)
                        ->where('language_id', $request->language_id ?? 1)
                        ->update($descData);
                }
            }

            // Rebuild category path if parent changed
            if ($request->has('parent_id')) {
                $this->buildCategoryPath($id);
            }

            DB::commit();

            $updatedCategory = DB::table('oc_category as c')
                ->leftJoin('oc_category_description as cd', 'c.category_id', '=', 'cd.category_id')
                ->where('c.category_id', $id)
                ->where('cd.language_id', $request->language_id ?? 1)
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => $updatedCategory
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified category
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $category = DB::table('oc_category')->where('category_id', $id)->first();
            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Category not found'
                ], 404);
            }

            // Check if category has subcategories
            $hasSubcategories = DB::table('oc_category')->where('parent_id', $id)->exists();
            if ($hasSubcategories) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete category with subcategories'
                ], 400);
            }

            // Delete related records
            DB::table('oc_category_description')->where('category_id', $id)->delete();
            DB::table('oc_category_to_store')->where('category_id', $id)->delete();
            DB::table('oc_category_path')->where('category_id', $id)->delete();
            DB::table('oc_category_to_layout')->where('category_id', $id)->delete();
            DB::table('oc_product_to_category')->where('category_id', $id)->delete();
            
            // Delete category
            DB::table('oc_category')->where('category_id', $id)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete categories
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
            
            // Check for subcategories
            $hasSubcategories = DB::table('oc_category')->whereIn('parent_id', $ids)->exists();
            if ($hasSubcategories) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete categories with subcategories'
                ], 400);
            }

            // Delete related records
            DB::table('oc_category_description')->whereIn('category_id', $ids)->delete();
            DB::table('oc_category_to_store')->whereIn('category_id', $ids)->delete();
            DB::table('oc_category_path')->whereIn('category_id', $ids)->delete();
            DB::table('oc_category_to_layout')->whereIn('category_id', $ids)->delete();
            DB::table('oc_product_to_category')->whereIn('category_id', $ids)->delete();
            
            // Delete categories
            $deleted = DB::table('oc_category')->whereIn('category_id', $ids)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deleted} categories"
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update category status
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
            $updated = DB::table('oc_category')
                ->whereIn('category_id', $request->ids)
                ->update([
                    'status' => $request->status,
                    'date_modified' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully updated {$updated} categories"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Build category path helper
     */
    private function buildCategoryPath($categoryId)
    {
        // Delete existing paths
        DB::table('oc_category_path')->where('category_id', $categoryId)->delete();

        // Get category
        $category = DB::table('oc_category')->where('category_id', $categoryId)->first();
        
        if (!$category) {
            return;
        }

        $level = 0;
        $path = [$categoryId];
        $parentId = $category->parent_id;

        // Build path up to root
        while ($parentId != 0) {
            $parent = DB::table('oc_category')->where('category_id', $parentId)->first();
            if (!$parent) {
                break;
            }
            array_unshift($path, $parentId);
            $parentId = $parent->parent_id;
        }

        // Insert paths
        foreach ($path as $pathId) {
            DB::table('oc_category_path')->insert([
                'category_id' => $categoryId,
                'path_id' => $pathId,
                'level' => $level
            ]);
            $level++;
        }
    }
}
