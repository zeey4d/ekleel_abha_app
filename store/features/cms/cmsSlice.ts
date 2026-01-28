// src/features/cms/cmsSlice.ts
import { createSelector } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';
import {
  HomepageContent,
  StaticPage,
  Banner,
  GetBannersParams,
  GetBannersResponse,
  GetHomepageContentResponse,
  GetStaticPageResponse
} from '@/store/types';

// --- RTK Query API Slice Injection ---
export const cmsSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Get Homepage Content ---
    getHomepageContent: builder.query<HomepageContent, void>({
      query: () => '/pages/home',
      transformResponse: (response: GetHomepageContentResponse) => response.data,
      providesTags: ['Homepage'],
      keepUnusedDataFor: 3600,
    }),

    // --- Get About Page Content ---
    getAboutPage: builder.query<StaticPage, void>({
      query: () => '/pages/about',
      transformResponse: (response: GetStaticPageResponse) => response.data,
      providesTags: (result, error, slug) => [{ type: 'Page', id: 'about' }],
      keepUnusedDataFor: 3600,
    }),

    // --- Get Static Page by Slug ---
    getStaticPage: builder.query<StaticPage, string>({
      query: (slug) => `/pages/${slug}`,
      transformResponse: (response: GetStaticPageResponse) => response.data,
      providesTags: (result, error, slug) => [{ type: 'Page', id: slug }],
      keepUnusedDataFor: 3600,
    }),

    // --- Get Banners ---
    getBanners: builder.query<Banner[], GetBannersParams>({
      query: ({ type = 'home', limit = 10 }) => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (limit) params.append('limit', limit.toString());
        return `/pages/banners?${params.toString()}`;
      },
      transformResponse: (response: GetBannersResponse) => response.data,
      providesTags: (result, error, { type }) =>
        [{ type: 'Banner', id: type }, { type: 'Banner', id: 'LIST' }],
      keepUnusedDataFor: 3600,
    }),
  }),
});

// Export auto-generated hooks
export const {
  useGetHomepageContentQuery,
  useGetAboutPageQuery,
  useGetStaticPageQuery,
  useGetBannersQuery,
} = cmsSlice;

// --- Memoized Selectors ---

export const selectHomepageContent = createSelector(
  [cmsSlice.endpoints.getHomepageContent.select()],
  (result) => result.data || null
);

export const selectAboutPageContent = createSelector(
  [cmsSlice.endpoints.getAboutPage.select()],
  (result) => result.data || null
);

export const selectStaticPageContent = createSelector(
  [(state: RootState, slug: string) => cmsSlice.endpoints.getStaticPage.select(slug)(state)],
  (result) => result.data || null
);

export const selectBannersByType = createSelector(
  [(state: RootState, params: GetBannersParams) => cmsSlice.endpoints.getBanners.select(params)(state)],
  (result) => result.data || []
);

// --- Sub-Selectors ---

export const selectFeaturedCategories = createSelector(
  [selectHomepageContent],
  (content) => content?.featured_categories || []
);

export const selectDealsOfTheDay = createSelector(
  [selectHomepageContent],
  (content) => content?.deals_of_the_day || []
);

export const selectTopSellingProducts = createSelector(
  [selectHomepageContent],
  (content) => content?.top_selling_products || []
);

export const selectNewArrivals = createSelector(
  [selectHomepageContent],
  (content) => content?.new_arrivals || []
);

export const selectTestimonials = createSelector(
  [selectHomepageContent],
  (content) => content?.testimonials || []
);

export const selectFeaturedBrands = createSelector(
  [selectHomepageContent],
  (content) => content?.featured_brands || []
);

export default cmsSlice;