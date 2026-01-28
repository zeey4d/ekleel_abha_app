<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminLanguageController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');

        $query = DB::table('oc_language');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($status !== null) {
            $query->where('status', $status);
        }

        $languages = $query->orderBy('sort_order')->paginate($perPage);

        return response()->json(['success' => true, 'data' => $languages]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:32',
            'code' => 'required|string|max:5|unique:oc_language,code',
            'locale' => 'required|string|max:255',
            'status' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $languageId = DB::table('oc_language')->insertGetId([
                'name' => $request->name,
                'code' => $request->code,
                'locale' => $request->locale,
                'image' => $request->image ?? '',
                'directory' => $request->directory ?? '',
                'sort_order' => $request->sort_order ?? 0,
                'status' => $request->status
            ]);

            $language = DB::table('oc_language')->where('language_id', $languageId)->first();

            return response()->json(['success' => true, 'message' => 'Language created successfully', 'data' => $language], 201);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to create language', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $language = DB::table('oc_language')->where('language_id', $id)->first();

        if (!$language) {
            return response()->json(['success' => false, 'message' => 'Language not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $language]);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:32',
            'code' => 'sometimes|required|string|max:5|unique:oc_language,code,' . $id . ',language_id',
            'locale' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $language = DB::table('oc_language')->where('language_id', $id)->first();
            if (!$language) {
                return response()->json(['success' => false, 'message' => 'Language not found'], 404);
            }

            $languageData = [];
            if ($request->has('name')) $languageData['name'] = $request->name;
            if ($request->has('code')) $languageData['code'] = $request->code;
            if ($request->has('locale')) $languageData['locale'] = $request->locale;
            if ($request->has('image')) $languageData['image'] = $request->image;
            if ($request->has('directory')) $languageData['directory'] = $request->directory;
            if ($request->has('sort_order')) $languageData['sort_order'] = $request->sort_order;
            if ($request->has('status')) $languageData['status'] = $request->status;

            if (!empty($languageData)) {
                DB::table('oc_language')->where('language_id', $id)->update($languageData);
            }

            $updatedLanguage = DB::table('oc_language')->where('language_id', $id)->first();

            return response()->json(['success' => true, 'message' => 'Language updated successfully', 'data' => $updatedLanguage]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update language', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $language = DB::table('oc_language')->where('language_id', $id)->first();
            if (!$language) {
                return response()->json(['success' => false, 'message' => 'Language not found'], 404);
            }

            // Check if it's the only active language
            $activeCount = DB::table('oc_language')->where('status', 1)->count();
            if ($activeCount <= 1 && $language->status == 1) {
                return response()->json(['success' => false, 'message' => 'Cannot delete the only active language'], 400);
            }

            DB::table('oc_language')->where('language_id', $id)->delete();

            return response()->json(['success' => true, 'message' => 'Language deleted successfully']);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete language', 'error' => $e->getMessage()], 500);
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

        try {
            $deleted = DB::table('oc_language')->whereIn('language_id', $request->ids)->delete();

            return response()->json(['success' => true, 'message' => "Successfully deleted {$deleted} languages"]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete languages', 'error' => $e->getMessage()], 500);
        }
    }

    public function bulkUpdateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'required|integer',
            'status' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $updated = DB::table('oc_language')
                ->whereIn('language_id', $request->ids)
                ->update(['status' => $request->status]);

            return response()->json(['success' => true, 'message' => "Successfully updated {$updated} languages"]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update languages', 'error' => $e->getMessage()], 500);
        }
    }
}
