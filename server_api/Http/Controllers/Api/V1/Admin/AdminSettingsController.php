<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminSettingsController extends Controller
{
    /**
     * Get all settings
     */
    public function index(Request $request)
    {
        $group = $request->get('group'); // Filter by settings group
        $storeId = $request->get('store_id', 0);

        $query = DB::table('oc_setting')->where('store_id', $storeId);

        if ($group) {
            $query->where('group', $group);
        }

        $settings = $query->orderBy('group')->orderBy('key')->get();

        // Group settings by group name
        $grouped = $settings->groupBy('group')->map(function($items) {
            return $items->mapWithKeys(function($item) {
                return [$item->key => json_decode($item->value, true) ?? $item->value];
            });
        });

        return response()->json(['success' => true, 'data' => $grouped]);
    }

    /**
     * Get specific setting
     */
    public function show($key, Request $request)
    {
        $storeId = $request->get('store_id', 0);

        $setting = DB::table('oc_setting')
            ->where('store_id', $storeId)
            ->where('key', $key)
            ->first();

        if (!$setting) {
            return response()->json(['success' => false, 'message' => 'Setting not found'], 404);
        }

        $setting->value = json_decode($setting->value, true) ?? $setting->value;

        return response()->json(['success' => true, 'data' => $setting]);
    }

    /**
     * Update or create setting
     */
    public function update(Request $request, $key)
    {
        $validator = Validator::make($request->all(), [
            'value' => 'required',
            'group' => 'required|string|max:32',
            'store_id' => 'sometimes|integer'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $storeId = $request->get('store_id', 0);
            $value = is_array($request->value) ? json_encode($request->value) : $request->value;

            $existing = DB::table('oc_setting')
                ->where('store_id', $storeId)
                ->where('key', $key)
                ->first();

            if ($existing) {
                DB::table('oc_setting')
                    ->where('setting_id', $existing->setting_id)
                    ->update([
                        'value' => $value,
                        'serialized' => is_array($request->value) ? 1 : 0
                    ]);
                $settingId = $existing->setting_id;
            } else {
                $settingId = DB::table('oc_setting')->insertGetId([
                    'store_id' => $storeId,
                    'code' => $request->group,
                    'key' => $key,
                    'value' => $value,
                    'serialized' => is_array($request->value) ? 1 : 0
                ]);
            }

            $setting = DB::table('oc_setting')->where('setting_id', $settingId)->first();
            $setting->value = json_decode($setting->value, true) ?? $setting->value;

            return response()->json(['success' => true, 'message' => 'Setting updated successfully', 'data' => $setting]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update setting', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Bulk update settings
     */
    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'group' => 'required|string|max:32',
            'store_id' => 'sometimes|integer'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $storeId = $request->get('store_id', 0);
            $updated = 0;

            foreach ($request->settings as $key => $value) {
                $serializedValue = is_array($value) ? json_encode($value) : $value;

                $existing = DB::table('oc_setting')
                    ->where('store_id', $storeId)
                    ->where('key', $key)
                    ->first();

                if ($existing) {
                    DB::table('oc_setting')
                        ->where('setting_id', $existing->setting_id)
                        ->update([
                            'value' => $serializedValue,
                            'serialized' => is_array($value) ? 1 : 0
                        ]);
                } else {
                    DB::table('oc_setting')->insert([
                        'store_id' => $storeId,
                        'code' => $request->group,
                        'key' => $key,
                        'value' => $serializedValue,
                        'serialized' => is_array($value) ? 1 : 0
                    ]);
                }
                $updated++;
            }

            DB::commit();

            return response()->json(['success' => true, 'message' => "Successfully updated {$updated} settings"]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to update settings', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete setting
     */
    public function destroy($key, Request $request)
    {
        try {
            $storeId = $request->get('store_id', 0);

            $setting = DB::table('oc_setting')
                ->where('store_id', $storeId)
                ->where('key', $key)
                ->first();

            if (!$setting) {
                return response()->json(['success' => false, 'message' => 'Setting not found'], 404);
            }

            DB::table('oc_setting')
                ->where('store_id', $storeId)
                ->where('key', $key)
                ->delete();

            return response()->json(['success' => true, 'message' => 'Setting deleted successfully']);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete setting', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Clear cache
     */
    public function clearCache(Request $request)
    {
        try {
            // Clear Laravel cache
            \Artisan::call('cache:clear');
            \Artisan::call('config:clear');
            \Artisan::call('route:clear');
            \Artisan::call('view:clear');

            // Clear database cache table
            DB::table('cache')->truncate();

            return response()->json(['success' => true, 'message' => 'Cache cleared successfully']);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to clear cache', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get store information
     */
    public function getStoreInfo(Request $request)
    {
        $storeId = $request->get('store_id', 0);

        $settings = DB::table('oc_setting')
            ->where('store_id', $storeId)
            ->whereIn('key', [
                'config_name',
                'config_owner',
                'config_address',
                'config_email',
                'config_telephone',
                'config_fax',
                'config_image',
                'config_open',
                'config_comment',
                'config_meta_title',
                'config_meta_description',
                'config_meta_keyword'
            ])
            ->get()
            ->mapWithKeys(function($item) {
                return [$item->key => json_decode($item->value, true) ?? $item->value];
            });

        return response()->json(['success' => true, 'data' => $settings]);
    }

    /**
     * Update store information
     */
    public function updateStoreInfo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'config_name' => 'sometimes|string|max:255',
            'config_email' => 'sometimes|email',
            'config_telephone' => 'sometimes|string|max:32',
            'store_id' => 'sometimes|integer'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $storeId = $request->get('store_id', 0);
            $updated = 0;

            $allowedFields = [
                'config_name', 'config_owner', 'config_address', 'config_email',
                'config_telephone', 'config_fax', 'config_image', 'config_open',
                'config_comment', 'config_meta_title', 'config_meta_description',
                'config_meta_keyword'
            ];

            foreach ($allowedFields as $field) {
                if ($request->has($field)) {
                    $value = $request->$field;
                    $serializedValue = is_array($value) ? json_encode($value) : $value;

                    $existing = DB::table('oc_setting')
                        ->where('store_id', $storeId)
                        ->where('key', $field)
                        ->first();

                    if ($existing) {
                        DB::table('oc_setting')
                            ->where('setting_id', $existing->setting_id)
                            ->update([
                                'value' => $serializedValue,
                                'serialized' => is_array($value) ? 1 : 0
                            ]);
                    } else {
                        DB::table('oc_setting')->insert([
                            'store_id' => $storeId,
                            'code' => 'config',
                            'key' => $field,
                            'value' => $serializedValue,
                            'serialized' => is_array($value) ? 1 : 0
                        ]);
                    }
                    $updated++;
                }
            }

            DB::commit();

            return response()->json(['success' => true, 'message' => "Successfully updated {$updated} store settings"]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to update store information', 'error' => $e->getMessage()], 500);
        }
    }
}
