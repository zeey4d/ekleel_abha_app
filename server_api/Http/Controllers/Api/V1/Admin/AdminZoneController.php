<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminZoneController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $countryId = $request->get('country_id');
        $status = $request->get('status');

        $query = DB::table('oc_zone as z')
            ->leftJoin('oc_country as c', 'z.country_id', '=', 'c.country_id')
            ->select('z.*', 'c.name as country_name');

        if ($search) {
            $query->where('z.name', 'like', "%{$search}%");
        }

        if ($countryId) {
            $query->where('z.country_id', $countryId);
        }

        if ($status !== null) {
            $query->where('z.status', $status);
        }

        $zones = $query->orderBy('z.name')->paginate($perPage);

        return response()->json(['success' => true, 'data' => $zones]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'country_id' => 'required|integer',
            'name' => 'required|string|max:128',
            'code' => 'required|string|max:32',
            'status' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $zoneId = DB::table('oc_zone')->insertGetId([
                'country_id' => $request->country_id,
                'name' => $request->name,
                'code' => $request->code,
                'status' => $request->status
            ]);

            $zone = DB::table('oc_zone')->where('zone_id', $zoneId)->first();

            return response()->json(['success' => true, 'message' => 'Zone created successfully', 'data' => $zone], 201);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to create zone', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $zone = DB::table('oc_zone as z')
            ->leftJoin('oc_country as c', 'z.country_id', '=', 'c.country_id')
            ->where('z.zone_id', $id)
            ->select('z.*', 'c.name as country_name')
            ->first();

        if (!$zone) {
            return response()->json(['success' => false, 'message' => 'Zone not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $zone]);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'country_id' => 'sometimes|required|integer',
            'name' => 'sometimes|required|string|max:128',
            'code' => 'sometimes|required|string|max:32',
            'status' => 'sometimes|required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $zone = DB::table('oc_zone')->where('zone_id', $id)->first();
            if (!$zone) {
                return response()->json(['success' => false, 'message' => 'Zone not found'], 404);
            }

            $zoneData = [];
            if ($request->has('country_id')) $zoneData['country_id'] = $request->country_id;
            if ($request->has('name')) $zoneData['name'] = $request->name;
            if ($request->has('code')) $zoneData['code'] = $request->code;
            if ($request->has('status')) $zoneData['status'] = $request->status;

            if (!empty($zoneData)) {
                DB::table('oc_zone')->where('zone_id', $id)->update($zoneData);
            }

            $updatedZone = DB::table('oc_zone')->where('zone_id', $id)->first();

            return response()->json(['success' => true, 'message' => 'Zone updated successfully', 'data' => $updatedZone]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update zone', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $zone = DB::table('oc_zone')->where('zone_id', $id)->first();
            if (!$zone) {
                return response()->json(['success' => false, 'message' => 'Zone not found'], 404);
            }

            DB::table('oc_zone')->where('zone_id', $id)->delete();

            return response()->json(['success' => true, 'message' => 'Zone deleted successfully']);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete zone', 'error' => $e->getMessage()], 500);
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
            $deleted = DB::table('oc_zone')->whereIn('zone_id', $request->ids)->delete();

            return response()->json(['success' => true, 'message' => "Successfully deleted {$deleted} zones"]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete zones', 'error' => $e->getMessage()], 500);
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
            return response()->json(['success' => false, 'errors' =>$validator->errors()], 422);
        }

        try {
            $updated = DB::table('oc_zone')
                ->whereIn('zone_id', $request->ids)
                ->update(['status' => $request->status]);

            return response()->json(['success' => true, 'message' => "Successfully updated {$updated} zones"]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update zones', 'error' => $e->getMessage()], 500);
        }
    }
}
