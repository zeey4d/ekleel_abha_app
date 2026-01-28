<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminCityController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $zoneId = $request->get('zone_id');
        $countryId = $request->get('country_id');
        $status = $request->get('status');

        $query = DB::table('oc_cities as c')
            ->leftJoin('oc_zone as z', 'c.zone_id', '=', 'z.zone_id')
            ->leftJoin('oc_country as co', 'c.country_id', '=', 'co.country_id')
            ->select('c.*', 'z.name as zone_name', 'co.name as country_name');

        if ($search) {
            $query->where('c.name', 'like', "%{$search}%");
        }

        if ($zoneId) {
            $query->where('c.zone_id', $zoneId);
        }

        if ($countryId) {
            $query->where('c.country_id', $countryId);
        }

        if ($status !== null) {
            $query->where('c.status', $status);
        }

        $cities = $query->orderBy('c.name')->paginate($perPage);

        return response()->json(['success' => true, 'data' => $cities]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'zone_id' => 'required|integer',
            'country_id' => 'required|integer',
            'status' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $cityId = DB::table('oc_cities')->insertGetId([
                'zone_id' => $request->zone_id,
                'country_id' => $request->country_id,
                'name' => $request->name,
                'description' => $request->description ?? null,
                'status' => $request->status
            ]);

            $city = DB::table('oc_cities')->where('city_id', $cityId)->first();

            return response()->json(['success' => true, 'message' => 'City created successfully', 'data' => $city], 201);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to create city', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $city = DB::table('oc_cities as c')
            ->leftJoin('oc_zone as z', 'c.zone_id', '=', 'z.zone_id')
            ->leftJoin('oc_country as co', 'c.country_id', '=', 'co.country_id')
            ->where('c.city_id', $id)
            ->select('c.*', 'z.name as zone_name', 'co.name as country_name')
            ->first();

        if (!$city) {
            return response()->json(['success' => false, 'message' => 'City not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $city]);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'zone_id' => 'sometimes|required|integer',
            'country_id' => 'sometimes|required|integer',
            'status' => 'sometimes|required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $city = DB::table('oc_cities')->where('city_id', $id)->first();
            if (!$city) {
                return response()->json(['success' => false, 'message' => 'City not found'], 404);
            }

            $cityData = [];
            if ($request->has('name')) $cityData['name'] = $request->name;
            if ($request->has('zone_id')) $cityData['zone_id'] = $request->zone_id;
            if ($request->has('country_id')) $cityData['country_id'] = $request->country_id;
            if ($request->has('description')) $cityData['description'] = $request->description;
            if ($request->has('status')) $cityData['status'] = $request->status;

            if (!empty($cityData)) {
                DB::table('oc_cities')->where('city_id', $id)->update($cityData);
            }

            $updatedCity = DB::table('oc_cities')->where('city_id', $id)->first();

            return response()->json(['success' => true, 'message' => 'City updated successfully', 'data' => $updatedCity]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update city', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $city = DB::table('oc_cities')->where('city_id', $id)->first();
            if (!$city) {
                return response()->json(['success' => false, 'message' => 'City not found'], 404);
            }

            DB::table('oc_cities')->where('city_id', $id)->delete();

            return response()->json(['success' => true, 'message' => 'City deleted successfully']);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete city', 'error' => $e->getMessage()], 500);
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
            $deleted = DB::table('oc_cities')->whereIn('city_id', $request->ids)->delete();

            return response()->json(['success' => true, 'message' => "Successfully deleted {$deleted} cities"]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete cities', 'error' => $e->getMessage()], 500);
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
            $updated = DB::table('oc_cities')
                ->whereIn('city_id', $request->ids)
                ->update(['status' => $request->status]);

            return response()->json(['success' => true, 'message' => "Successfully updated {$updated} cities"]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update cities', 'error' => $e->getMessage()], 500);
        }
    }
}
