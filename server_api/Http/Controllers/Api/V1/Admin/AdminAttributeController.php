<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminAttributeController extends Controller
{
    // Attribute Groups Management
    public function indexGroups(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');

        $query = DB::table('oc_attribute_group as ag')
            ->leftJoin('oc_attribute_group_description as agd', function($join) {
                $join->on('ag.attribute_group_id', '=', 'agd.attribute_group_id')
                     ->where('agd.language_id', '=', 1);
            })
            ->select('ag.*', 'agd.name');

        if ($search) {
            $query->where('agd.name', 'like', "%{$search}%");
        }

        $groups = $query->orderBy('ag.sort_order')->paginate($perPage);

        return response()->json(['success' => true, 'data' => $groups]);
    }

    public function storeGroup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:64',
            'sort_order' => 'sometimes|integer'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $groupId = DB::table('oc_attribute_group')->insertGetId([
                'sort_order' => $request->sort_order ?? 0
            ]);

            DB::table('oc_attribute_group_description')->insert([
                'attribute_group_id' => $groupId,
                'language_id' => 1,
                'name' => $request->name
            ]);

            DB::commit();

            $group = DB::table('oc_attribute_group as ag')
                ->join('oc_attribute_group_description as agd', 'ag.attribute_group_id', '=', 'agd.attribute_group_id')
                ->where('ag.attribute_group_id', $groupId)
                ->where('agd.language_id', 1)
                ->select('ag.*', 'agd.name')
                ->first();

            return response()->json(['success' => true, 'message' => 'Attribute group created successfully', 'data' => $group], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to create attribute group', 'error' => $e->getMessage()], 500);
        }
    }

    public function updateGroup(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:64',
            'sort_order' => 'sometimes|integer'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $group = DB::table('oc_attribute_group')->where('attribute_group_id', $id)->first();
            if (!$group) {
                return response()->json(['success' => false, 'message' => 'Attribute group not found'], 404);
            }

            if ($request->has('sort_order')) {
                DB::table('oc_attribute_group')->where('attribute_group_id', $id)->update([
                    'sort_order' => $request->sort_order
                ]);
            }

            if ($request->has('name')) {
                DB::table('oc_attribute_group_description')
                    ->where('attribute_group_id', $id)
                    ->where('language_id', 1)
                    ->update(['name' => $request->name]);
            }

            DB::commit();

            $updatedGroup = DB::table('oc_attribute_group as ag')
                ->join('oc_attribute_group_description as agd', 'ag.attribute_group_id', '=', 'agd.attribute_group_id')
                ->where('ag.attribute_group_id', $id)
                ->where('agd.language_id', 1)
                ->select('ag.*', 'agd.name')
                ->first();

            return response()->json(['success' => true, 'message' => 'Attribute group updated successfully', 'data' => $updatedGroup]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to update attribute group', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroyGroup($id)
    {
        DB::beginTransaction();
        try {
            $group = DB::table('oc_attribute_group')->where('attribute_group_id', $id)->first();
            if (!$group) {
                return response()->json(['success' => false, 'message' => 'Attribute group not found'], 404);
            }

            // Delete attributes in this group
            $attributes = DB::table('oc_attribute')->where('attribute_group_id', $id)->pluck('attribute_id');
            if ($attributes->isNotEmpty()) {
                DB::table('oc_attribute_description')->whereIn('attribute_id', $attributes)->delete();
                DB::table('oc_product_attribute')->whereIn('attribute_id', $attributes)->delete();
                DB::table('oc_attribute')->whereIn('attribute_id', $attributes)->delete();
            }

            DB::table('oc_attribute_group_description')->where('attribute_group_id', $id)->delete();
            DB::table('oc_attribute_group')->where('attribute_group_id', $id)->delete();

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Attribute group deleted successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to delete attribute group', 'error' => $e->getMessage()], 500);
        }
    }

    // Attributes Management
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $groupId = $request->get('attribute_group_id');

        $query = DB::table('oc_attribute as a')
            ->leftJoin('oc_attribute_description as ad', function($join) {
                $join->on('a.attribute_id', '=', 'ad.attribute_id')
                     ->where('ad.language_id', '=', 1);
            })
            ->leftJoin('oc_attribute_group_description as agd', function($join) {
                $join->on('a.attribute_group_id', '=', 'agd.attribute_group_id')
                     ->where('agd.language_id', '=', 1);
            })
            ->select('a.*', 'ad.name', 'agd.name as group_name');

        if ($search) {
            $query->where('ad.name', 'like', "%{$search}%");
        }

        if ($groupId) {
            $query->where('a.attribute_group_id', $groupId);
        }

        $attributes = $query->orderBy('a.sort_order')->paginate($perPage);

        return response()->json(['success' => true, 'data' => $attributes]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'attribute_group_id' => 'required|integer',
            'name' => 'required|string|max:64',
            'sort_order' => 'sometimes|integer'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $attributeId = DB::table('oc_attribute')->insertGetId([
                'attribute_group_id' => $request->attribute_group_id,
                'sort_order' => $request->sort_order ?? 0
            ]);

            DB::table('oc_attribute_description')->insert([
                'attribute_id' => $attributeId,
                'language_id' => 1,
                'name' => $request->name
            ]);

            DB::commit();

            $attribute = DB::table('oc_attribute as a')
                ->join('oc_attribute_description as ad', 'a.attribute_id', '=', 'ad.attribute_id')
                ->where('a.attribute_id', $attributeId)
                ->where('ad.language_id', 1)
                ->select('a.*', 'ad.name')
                ->first();

            return response()->json(['success' => true, 'message' => 'Attribute created successfully', 'data' => $attribute], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to create attribute', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $attribute = DB::table('oc_attribute as a')
            ->leftJoin('oc_attribute_description as ad', function($join) {
                $join->on('a.attribute_id', '=', 'ad.attribute_id')
                     ->where('ad.language_id', '=', 1);
            })
            ->leftJoin('oc_attribute_group_description as agd', function($join) {
                $join->on('a.attribute_group_id', '=', 'agd.attribute_group_id')
                     ->where('agd.language_id', '=', 1);
            })
            ->where('a.attribute_id', $id)
            ->select('a.*', 'ad.name', 'agd.name as group_name')
            ->first();

        if (!$attribute) {
            return response()->json(['success' => false, 'message' => 'Attribute not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $attribute]);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'attribute_group_id' => 'sometimes|required|integer',
            'name' => 'sometimes|required|string|max:64',
            'sort_order' => 'sometimes|integer'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $attribute = DB::table('oc_attribute')->where('attribute_id', $id)->first();
            if (!$attribute) {
                return response()->json(['success' => false, 'message' => 'Attribute not found'], 404);
            }

            $attributeData = [];
            if ($request->has('attribute_group_id')) $attributeData['attribute_group_id'] = $request->attribute_group_id;
            if ($request->has('sort_order')) $attributeData['sort_order'] = $request->sort_order;

            if (!empty($attributeData)) {
                DB::table('oc_attribute')->where('attribute_id', $id)->update($attributeData);
            }

            if ($request->has('name')) {
                DB::table('oc_attribute_description')
                    ->where('attribute_id', $id)
                    ->where('language_id', 1)
                    ->update(['name' => $request->name]);
            }

            DB::commit();

            $updatedAttribute = DB::table('oc_attribute as a')
                ->join('oc_attribute_description as ad', 'a.attribute_id', '=', 'ad.attribute_id')
                ->where('a.attribute_id', $id)
                ->where('ad.language_id', 1)
                ->select('a.*', 'ad.name')
                ->first();

            return response()->json(['success' => true, 'message' => 'Attribute updated successfully', 'data' => $updatedAttribute]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to update attribute', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $attribute = DB::table('oc_attribute')->where('attribute_id', $id)->first();
            if (!$attribute) {
                return response()->json(['success' => false, 'message' => 'Attribute not found'], 404);
            }

            DB::table('oc_product_attribute')->where('attribute_id', $id)->delete();
            DB::table('oc_attribute_description')->where('attribute_id', $id)->delete();
            DB::table('oc_attribute')->where('attribute_id', $id)->delete();

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Attribute deleted successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to delete attribute', 'error' => $e->getMessage()], 500);
        }
    }
}
