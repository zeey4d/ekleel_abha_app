import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store/store';
// import { cookieManager } from "@/lib/cookieManager";
import { authStorage } from '@/lib/authStorage';
import NetInfo from '@react-native-community/netinfo';

// Custom baseQuery with retry logic
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_BASE_SERVER || 'http://127.0.0.1:8000/api/v1',
  prepareHeaders: async (headers, { getState }) => {
    const token = await authStorage.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Accept', 'application/json');
    const locale = authStorage.getLocale();
    headers.set('Accept-Language', locale);
    return headers;
  },
  // Timeout for mobile networks
  timeout: 15000,
});

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 2 });

// Enhanced baseQuery with network check
const baseQueryWithNetworkCheck: typeof baseQueryWithRetry = async (args, api, extraOptions) => {
  try {
    const networkState = await NetInfo.fetch();
    
    // Explicitly check for false (it can be null on some platforms initially)
    if (networkState.isConnected === false) {
      return {
        error: {
          status: 'FETCH_ERROR',
          statusText: 'Offline',
          data: undefined,
          error: 'No Internet Connection',
        },
      };
    }
  } catch (e) {
    // Fallback if NetInfo fails, just proceed
    console.warn('NetInfo fetch failed', e);
  }
  
  return baseQueryWithRetry(args, api, extraOptions);
};

// Define the base API instance
export const apiSlice = createApi({
  reducerPath: 'api',

  baseQuery: baseQueryWithNetworkCheck,
  
  // ⏱️ Global Cache Settings
  keepUnusedDataFor: 300, // 5 minutes default
  refetchOnFocus: false,  // Do not refetch on window focus by default (save data)
  refetchOnReconnect: true, // Refetch when network comes back
  refetchOnMountOrArgChange: false, // Use cache if available

  tagTypes: [
    // Public/Customer tags
    'Product',
    'Wishlist',
    'Brand',
    'Cart',
    'Category',
    'Order',
    'User',
    'Address',
    'Review',
    'Seller',
    'Coupon',
    'Promotion',
    'Notification',
    'Page',
    'Banner',
    'Settings',
    'Shipping',
    'Policy',
    'Search',
    'Homepage',
    'PaymentMethods',

    // Admin tags
    'AdminProduct',
    'AdminCategory',
    'AdminOrder',
    'AdminCustomer',
    'AdminCoupon',
    'AdminBanner',
    'AdminManufacturer',
    'AdminReview',
    'AdminCity',
    'AdminCountry',
    'AdminZone',
    'AdminLanguage',
    'AdminAttribute',
    'AdminAttributeGroup',
    'AdminAnalytics',
    'AdminNotification',
    'AdminReturn',
    'AdminSettings',
    'AdminCustomerGroup',
    'AdminMediaFolder',
    'AdminMedia',
    'AdminPayment',
    'PaymentTransaction',
    'PaymentMethod',
    'PaymentDispute',
    'PaymentStats',
    'TaxClass',
    'TaxRate',
    'AdminUser',
    'AdminRole',
    'AdminPage',
    'AdminFaq',
  ],

  endpoints: () => ({}),
});
