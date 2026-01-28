<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminReviewController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');
        $productId = $request->get('product_id');

        $query = DB::table('oc_review as r')
            ->leftJoin('oc_product_description as pd', function($join) {
                $join->on('r.product_id', '=', 'pd.product_id')
                     ->where('pd.language_id', '=', 1);
            })
            ->select('r.*', 'pd.name as product_name');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('r.author', 'like', "%{$search}%")
                  ->orWhere('r.text', 'like', "%{$search}%")
                  ->orWhere('pd.name', 'like', "%{$search}%");
            });
        }

        if ($status !== null) {
            $query->where('r.status', $status);
        }

        if ($productId) {
            $query->where('r.product_id', $productId);
        }

        $reviews = $query->orderBy('r.date_added', 'desc')->paginate($perPage);

        return response()->json(['success' => true, 'data' => $reviews]);
    }

    public function show($id)
    {
        $review = DB::table('oc_review as r')
            ->leftJoin('oc_product_description as pd', function($join) {
                $join->on('r.product_id', '=', 'pd.product_id')
                     ->where('pd.language_id', '=', 1);
            })
            ->where('r.review_id', $id)
            ->select('r.*', 'pd.name as product_name')
            ->first();

        if (!$review) {
            return response()->json(['success' => false, 'message' => 'Review not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $review]);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|required|boolean',
            'rating' => 'sometimes|required|integer|min:1|max:5'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $review = DB::table('oc_review')->where('review_id', $id)->first();
            if (!$review) {
                return response()->json(['success' => false, 'message' => 'Review not found'], 404);
            }

            $reviewData = [];
            if ($request->has('status')) $reviewData['status'] = $request->status;
            if ($request->has('rating')) $reviewData['rating'] = $request->rating;
            if ($request->has('text')) $reviewData['text'] = $request->text;

            if (!empty($reviewData)) {
                $reviewData['date_modified'] = now();
                DB::table('oc_review')->where('review_id', $id)->update($reviewData);
            }

            $updatedReview = DB::table('oc_review')->where('review_id', $id)->first();

            return response()->json(['success' => true, 'message' => 'Review updated successfully', 'data' => $updatedReview]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update review', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $review = DB::table('oc_review')->where('review_id', $id)->first();
            if (!$review) {
                return response()->json(['success' => false, 'message' => 'Review not found'], 404);
            }

            DB::table('oc_review')->where('review_id', $id)->delete();

            return response()->json(['success' => true, 'message' => 'Review deleted successfully']);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete review', 'error' => $e->getMessage()], 500);
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
            $deleted = DB::table('oc_review')->whereIn('review_id', $request->ids)->delete();

            return response()->json(['success' => true, 'message' => "Successfully deleted {$deleted} reviews"]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete reviews', 'error' => $e->getMessage()], 500);
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
            $updated = DB::table('oc_review')
                ->whereIn('review_id', $request->ids)
                ->update([
                    'status' => $request->status,
                    'date_modified' => now()
                ]);

            return response()->json(['success' => true, 'message' => "Successfully updated {$updated} reviews"]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update reviews', 'error' => $e->getMessage()], 500);
        }
    }
}
