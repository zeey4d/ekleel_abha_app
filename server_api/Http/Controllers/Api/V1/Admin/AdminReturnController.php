<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminReturnController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $statusId = $request->get('return_status_id');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        $query = DB::table('oc_return as r')
            ->leftJoin('oc_return_status as rs', function($join) {
                $join->on('r.return_status_id', '=', 'rs.return_status_id')
                     ->where('rs.language_id', '=', 1);
            })
            ->leftJoin('oc_return_reason as rr', function($join) {
                $join->on('r.return_reason_id', '=', 'rr.return_reason_id')
                     ->where('rr.language_id', '=', 1);
            })
            ->leftJoin('oc_return_action as ra', function($join) {
                $join->on('r.return_action_id', '=', 'ra.return_action_id')
                     ->where('ra.language_id', '=', 1);
            })
            ->select(
                'r.*',
                'rs.name as return_status_name',
                'rr.name as return_reason_name',
                'ra.name as return_action_name'
            );

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('r.return_id', 'like', "%{$search}%")
                  ->orWhere('r.order_id', 'like', "%{$search}%")
                  ->orWhere('r.firstname', 'like', "%{$search}%")
                  ->orWhere('r.lastname', 'like', "%{$search}%")
                  ->orWhere('r.email', 'like', "%{$search}%");
            });
        }

        if ($statusId !== null) {
            $query->where('r.return_status_id', $statusId);
        }

        if ($dateFrom) {
            $query->where('r.date_added', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->where('r.date_added', '<=', $dateTo);
        }

        $returns = $query->orderBy('r.date_added', 'desc')->paginate($perPage);

        return response()->json(['success' => true, 'data' => $returns]);
    }

    public function show($id)
    {
        $return = DB::table('oc_return as r')
            ->leftJoin('oc_return_status as rs', function($join) {
                $join->on('r.return_status_id', '=', 'rs.return_status_id')
                     ->where('rs.language_id', '=', 1);
            })
            ->leftJoin('oc_return_reason as rr', function($join) {
                $join->on('r.return_reason_id', '=', 'rr.return_reason_id')
                     ->where('rr.language_id', '=', 1);
            })
            ->leftJoin('oc_return_action as ra', function($join) {
                $join->on('r.return_action_id', '=', 'ra.return_action_id')
                     ->where('ra.language_id', '=', 1);
            })
            ->where('r.return_id', $id)
            ->select(
                'r.*',
                'rs.name as return_status_name',
                'rr.name as return_reason_name',
                'ra.name as return_action_name'
            )
            ->first();

        if (!$return) {
            return response()->json(['success' => false, 'message' => 'Return not found'], 404);
        }

        // Get return history
        $history = DB::table('oc_return_history as rh')
            ->leftJoin('oc_return_status as rs', function($join) {
                $join->on('rh.return_status_id', '=', 'rs.return_status_id')
                     ->where('rs.language_id', '=', 1);
            })
            ->where('rh.return_id', $id)
            ->select('rh.*', 'rs.name as status_name')
            ->orderBy('rh.date_added', 'desc')
            ->get();

        $return->history = $history;

        return response()->json(['success' => true, 'data' => $return]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'return_status_id' => 'required|integer',
            'comment' => 'sometimes|string',
            'notify' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $return = DB::table('oc_return')->where('return_id', $id)->first();
            if (!$return) {
                return response()->json(['success' => false, 'message' => 'Return not found'], 404);
            }

            // Update return status
            DB::table('oc_return')
                ->where('return_id', $id)
                ->update([
                    'return_status_id' => $request->return_status_id,
                    'date_modified' => now()
                ]);

            // Add history record
            DB::table('oc_return_history')->insert([
                'return_id' => $id,
                'return_status_id' => $request->return_status_id,
'notify' => $request->notify ?? 0,
                'comment' => $request->comment ?? '',
                'date_added' => now()
            ]);

            DB::commit();

            $updatedReturn = DB::table('oc_return')->where('return_id', $id)->first();

            return response()->json(['success' => true, 'message' => 'Return status updated successfully', 'data' => $updatedReturn]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to update return status', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $return = DB::table('oc_return')->where('return_id', $id)->first();
            if (!$return) {
                return response()->json(['success' => false, 'message' => 'Return not found'], 404);
            }

            DB::table('oc_return_history')->where('return_id', $id)->delete();
            DB::table('oc_return')->where('return_id', $id)->delete();

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Return deleted successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to delete return', 'error' => $e->getMessage()], 500);
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
            DB::table('oc_return_history')->whereIn('return_id', $request->ids)->delete();
            $deleted = DB::table('oc_return')->whereIn('return_id', $request->ids)->delete();

            DB::commit();

            return response()->json(['success' => true, 'message' => "Successfully deleted {$deleted} returns"]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to delete returns', 'error' => $e->getMessage()], 500);
        }
    }

    public function bulkUpdateStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'required|integer',
            'return_status_id' => 'required|integer',
            'comment' => 'sometimes|string',
            'notify' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $updated = DB::table('oc_return')
                ->whereIn('return_id', $request->ids)
                ->update([
                    'return_status_id' => $request->return_status_id,
                    'date_modified' => now()
                ]);

            // Add history records
            foreach ($request->ids as $returnId) {
                DB::table('oc_return_history')->insert([
                    'return_id' => $returnId,
                    'return_status_id' => $request->return_status_id,
                    'notify' => $request->notify ?? 0,
                    'comment' => $request->comment ?? '',
                    'date_added' => now()
                ]);
            }

            DB::commit();

            return response()->json(['success' => true, 'message' => "Successfully updated {$updated} returns"]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to update returns', 'error' => $e->getMessage()], 500);
        }
    }
}
