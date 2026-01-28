<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminCountryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');

        $query = DB::table('oc_country');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('iso_code_2', 'like', "%{$search}%")
                  ->orWhere('iso_code_3', 'like', "%{$search}%");
            });
        }

        if ($status !== null) {
            $query->where('status', $status);
        }

        $countries = $query->orderBy('name')->paginate($perPage);

        return response()->json(['success' => true, 'data' => $countries]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:128',
            'iso_code_2' => 'required|string|max:2',
            'iso_code_3' => 'required|string|max:3',
            'status' => 'required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $countryId = DB::table('oc_country')->insertGetId([
                'name' => $request->name,
                'iso_code_2' => $request->iso_code_2,
                'iso_code_3' => $request->iso_code_3,
                'address_format' => $request->address_format ?? '',
                'postcode_required' => $request->postcode_required ?? 0,
                'status' => $request->status
            ]);

            $country = DB::table('oc_country')->where('country_id', $countryId)->first();

            return response()->json(['success' => true, 'message' => 'Country created successfully', 'data' => $country], 201);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to create country', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $country = DB::table('oc_country')->where('country_id', $id)->first();

        if (!$country) {
            return response()->json(['success' => false, 'message' => 'Country not found'], 404);
        }

        // Get zones count
        $zonesCount = DB::table('oc_zone')->where('country_id', $id)->count();
        $country->zones_count = $zonesCount;

        return response()->json(['success' => true, 'data' => $country]);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:128',
            'iso_code_2' => 'sometimes|required|string|max:2',
            'iso_code_3' => 'sometimes|required|string|max:3',
            'status' => 'sometimes|required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $country = DB::table('oc_country')->where('country_id', $id)->first();
            if (!$country) {
                return response()->json(['success' => false, 'message' => 'Country not found'], 404);
            }

            $countryData = [];
            if ($request->has('name')) $countryData['name'] = $request->name;
            if ($request->has('iso_code_2')) $countryData['iso_code_2'] = $request->iso_code_2;
            if ($request->has('iso_code_3')) $countryData['iso_code_3'] = $request->iso_code_3;
            if ($request->has('address_format')) $countryData['address_format'] = $request->address_format;
            if ($request->has('postcode_required')) $countryData['postcode_required'] = $request->postcode_required;
            if ($request->has('status')) $countryData['status'] = $request->status;

            if (!empty($countryData)) {
                DB::table('oc_country')->where('country_id', $id)->update($countryData);
            }

            $updatedCountry = DB::table('oc_country')->where('country_id', $id)->first();

            return response()->json(['success' => true, 'message' => 'Country updated successfully', 'data' => $updatedCountry]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update country', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $country = DB::table('oc_country')->where('country_id', $id)->first();
            if (!$country) {
                return response()->json(['success' => false, 'message' => 'Country not found'], 404);
            }

            DB::table('oc_country')->where('country_id', $id)->delete();

            return response()->json(['success' => true, 'message' => 'Country deleted successfully']);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete country', 'error' => $e->getMessage()], 500);
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
            $deleted = DB::table('oc_country')->whereIn('country_id', $request->ids)->delete();

            return response()->json(['success' => true, 'message' => "Successfully deleted {$deleted} countries"]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete countries', 'error' => $e->getMessage()], 500);
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
            $updated = DB::table('oc_country')
                ->whereIn('country_id', $request->ids)
                ->update(['status' => $request->status]);

            return response()->json(['success' => true, 'message' => "Successfully updated {$updated} countries"]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update countries', 'error' => $e->getMessage()], 500);
        }
    }
}
