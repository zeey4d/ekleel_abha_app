import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store/store';
// import { cookieManager } from "@/lib/cookieManager";
import { cookieManager } from '@/lib/cookieManager';

// Define the base API instance
export const apiSlice = createApi({
  reducerPath: 'api',

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_BASE_SERVER || 'http://127.0.0.1:8000/api/v1',
    prepareHeaders: async (headers, { getState }) => {
      const token = await cookieManager.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Accept', 'application/json');
      const locale = cookieManager.getLocale();
      headers.set('Accept-Language', locale);
      return headers;
    },
  }),

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
