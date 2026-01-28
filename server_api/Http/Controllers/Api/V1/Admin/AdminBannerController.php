<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminBannerController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');

        $query = DB::table('oc_banner');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($status !== null) {
            $query->where('status', $status);
        }

        $banners = $query->paginate($perPage);

        return response()->json(['success' => true, 'data' => $banners]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:64',
            'status' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $bannerId = DB::table('oc_banner')->insertGetId([
                'name' => $request->name,
                'status' => $request->status
            ]);

            // Add images
            if ($request->has('images') && is_array($request->images)) {
                foreach ($request->images as $image) {
                    DB::table('oc_banner_image')->insert([
                        'banner_id' => $bannerId,
                        'language_id' => $image['language_id'] ?? 1,
                        'title' => $image['title'] ?? '',
                        'link' => $image['link'] ?? '',
                        'image' => $image['image'] ?? '',
                        'sort_order' => $image['sort_order'] ?? 0
                    ]);
                }
            }

            DB::commit();

            $banner = DB::table('oc_banner')->where('banner_id', $bannerId)->first();

            return response()->json(['success' => true, 'message' => 'Banner created successfully', 'data' => $banner], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to create banner', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $banner = DB::table('oc_banner')->where('banner_id', $id)->first();

        if (!$banner) {
            return response()->json(['success' => false, 'message' => 'Banner not found'], 404);
        }

        $images = DB::table('oc_banner_image')->where('banner_id', $id)->orderBy('sort_order')->get();
        $banner->images = $images;

        return response()->json(['success' => true, 'data' => $banner]);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:64',
            'status' => 'sometimes|required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $banner = DB::table('oc_banner')->where('banner_id', $id)->first();
            if (!$banner) {
                return response()->json(['success' => false, 'message' => 'Banner not found'], 404);
            }

            $bannerData = [];
            if ($request->has('name')) $bannerData['name'] = $request->name;
            if ($request->has('status')) $bannerData['status'] = $request->status;

            if (!empty($bannerData)) {
                DB::table('oc_banner')->where('banner_id', $id)->update($bannerData);
            }

            // Update images
            if ($request->has('images')) {
                DB::table('oc_banner_image')->where('banner_id', $id)->delete();
                if (is_array($request->images)) {
                    foreach ($request->images as $image) {
                        DB::table('oc_banner_image')->insert([
                            'banner_id' => $id,
                            'language_id' => $image['language_id'] ?? 1,
                            'title' => $image['title'] ?? '',
                            'link' => $image['link'] ?? '',
                            'image' => $image['image'] ?? '',
                            'sort_order' => $image['sort_order'] ?? 0
                        ]);
                    }
                }
            }

            DB::commit();

            $updatedBanner = DB::table('oc_banner')->where('banner_id', $id)->first();

            return response()->json(['success' => true, 'message' => 'Banner updated successfully', 'data' => $updatedBanner]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to update banner', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $banner = DB::table('oc_banner')->where('banner_id', $id)->first();
            if (!$banner) {
                return response()->json(['success' => false, 'message' => 'Banner not found'], 404);
            }

            DB::table('oc_banner_image')->where('banner_id', $id)->delete();
            DB::table('oc_banner')->where('banner_id', $id)->delete();

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Banner deleted successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to delete banner', 'error' => $e->getMessage()], 500);
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
            DB::table('oc_banner_image')->whereIn('banner_id', $request->ids)->delete();
            $deleted = DB::table('oc_banner')->whereIn('banner_id', $request->ids)->delete();

            DB::commit();

            return response()->json(['success' => true, 'message' => "Successfully deleted {$deleted} banners"]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to delete banners', 'error' => $e->getMessage()], 500);
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
            $updated = DB::table('oc_banner')
                ->whereIn('banner_id', $request->ids)
                ->update(['status' => $request->status]);

            return response()->json(['success' => true, 'message' => "Successfully updated {$updated} banners"]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update banners', 'error' => $e->getMessage()], 500);
        }
    }
}
