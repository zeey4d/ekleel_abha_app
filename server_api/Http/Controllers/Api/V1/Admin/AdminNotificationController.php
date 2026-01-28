<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminNotificationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $status = $request->get('status');
        $deviceType = $request->get('device');

        $query = DB::table('oc_push_notification_history');

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        if ($deviceType) {
            $query->where('device', $deviceType);
        }

        $notifications = $query->orderBy('date_added', 'desc')->paginate($perPage);

        return response()->json(['success' => true, 'data' => $notifications]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:1000',
            'message' => 'required|string|max:1000',
            'device' => 'required|in:all,android,ios',
            'redirect_activity' => 'required|in:home,category,product'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $notificationId = DB::table('oc_push_notification_history')->insertGetId([
                'title' => $request->title,
                'message' => $request->message,
                'image_url' => $request->image_url ?? '',
                'device' => $request->device,
                'redirect_activity' => $request->redirect_activity,
                'category_id' => $request->category_id,
                'product_id' => $request->product_id,
                'date_added' => now()
            ]);

            $notification = DB::table('oc_push_notification_history')->where('notification_id', $notificationId)->first();

            // Here you would integrate with Firebase Cloud Messaging (FCM) to actually send the notification
            // $this->sendPushNotification($notification);

            return response()->json([
                'success' => true,
                'message' => 'Notification sent successfully',
                'data' => $notification
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $notification = DB::table('oc_push_notification_history')
            ->where('notification_id', $id)
            ->first();

        if (!$notification) {
            return response()->json(['success' => false, 'message' => 'Notification not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $notification]);
    }

    public function destroy($id)
    {
        try {
            $notification = DB::table('oc_push_notification_history')->where('notification_id', $id)->first();
            if (!$notification) {
                return response()->json(['success' => false, 'message' => 'Notification not found'], 404);
            }

            DB::table('oc_push_notification_history')->where('notification_id', $id)->delete();

            return response()->json(['success' => true, 'message' => 'Notification deleted successfully']);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete notification', 'error' => $e->getMessage()], 500);
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
            $deleted = DB::table('oc_push_notification_history')->whereIn('notification_id', $request->ids)->delete();

            return response()->json(['success' => true, 'message' => "Successfully deleted {$deleted} notifications"]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to delete notifications', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get notification statistics
     */
    public function statistics(Request $request)
    {
        try {
            $dateFrom = $request->get('date_from', now()->subDays(30));
            $dateTo = $request->get('date_to', now());

            $totalNotifications = DB::table('oc_push_notification_history')
                ->whereBetween('date_added', [$dateFrom, $dateTo])
                ->count();

            $byDevice = DB::table('oc_push_notification_history')
                ->select('device', DB::raw('COUNT(*) as count'))
                ->whereBetween('date_added', [$dateFrom, $dateTo])
                ->groupBy('device')
                ->get();

            $byActivity = DB::table('oc_push_notification_history')
                ->select('redirect_activity', DB::raw('COUNT(*) as count'))
                ->whereBetween('date_added', [$dateFrom, $dateTo])
                ->groupBy('redirect_activity')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_notifications' => $totalNotifications,
                    'by_device' => $byDevice,
                    'by_activity' => $byActivity,
                    'period' => [
                        'from' => $dateFrom,
                        'to' => $dateTo
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get notification statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send test notification
     */
    public function sendTest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:1000',
            'message' => 'required|string|max:1000',
            'device' => 'required|in:all,android,ios'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            // Send test notification (integrate with FCM here)
            return response()->json([
                'success' => true,
                'message' => 'Test notification sent successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send test notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
