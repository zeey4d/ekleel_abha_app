// src/store/types.ts
import { RootState } from '@/store/store';

// Re-export RootState from store to keep it in one place
export type { RootState } from '@/store/store';

// Define common types used across slices

// Pagination
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  [key: string]: any; // Additional response properties
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Common Entity Types
export interface BaseEntity {
  id: number | string;
  [key: string]: any;
}

// UI Types
export interface ModalState {
  open: boolean;
  type: string | null;
  props?: Record<string, any>;
}

export interface DrawerState {
  open: boolean;
  type: string | null;
  props?: Record<string, any>;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  showProgress?: boolean;
}

// Filter Types
export interface PriceRange {
  min: number;
  max: number;
}

export interface FilterOption {
  id: string | number;
  name: string;
  count?: number;
}

export interface ActiveFilter {
  type: 'category' | 'brand' | 'price' | 'rating' | 'attribute' | 'in_stock' | 'on_sale';
  value: string | number | boolean | PriceRange;
  label: string;
}

export interface AttributeFilter {
  id: number;
  name: string;
  values: FilterOption[];
}

// Product Comparison Types
export interface ProductComparisonItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  [key: string]: any;
}

// Recently Viewed Types
export interface RecentlyViewedProduct {
  id: number | string;
  name: string;
  price: number;
  final_price: number;
  image: string | null;
  thumb_image?: string | null;
  date_viewed: string;
  [key: string]: any;
}

// User Preferences Types
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  units: 'metric' | 'imperial';
  notifications: {
    email: boolean;
    push: boolean;
    sms?: boolean;
  };
  productView: {
    layout: 'grid' | 'list';
    itemsPerPage: number;
  };
  privacy: {
    showEmailPublicly: boolean;
    allowNotifications: boolean;
    allowMarketing: boolean;
  };
  accessibility: {
    reduceMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'normal' | 'large';
  };
  recentlyViewedLimit: number;
  defaultAddressId?: number | string;
  wishlistVisibility: 'public' | 'private';
  [key: string]: any;
}

// Loading and Error State Types
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

// Export slices state types
export type {
  UIState,
  FilterState,
  ComparisonState,
  RecentlyViewedState,
  PreferencesState,
  SlicesState
} from './slices';

import { EntityState } from '@reduxjs/toolkit';

// ==============================
// CMS Types
// ==============================
export interface HomepageContent {
  banner: Array<Banner>;
  featured_categories: Array<{
    id: number;
    name: string;
    image: string | null;
  }>;
  deals_of_the_day: Array<{
    id: number;
    name: string;
    price: number;
    special_price: number;
    discount_percentage: number;
    image: string | null;
    brand: string | null;
  }>;
  top_selling_products: Array<{
    id: number;
    name: string;
    price: number;
    final_price: number;
    is_on_sale: boolean;
    image: string | null;
    total_sold: number;
    brand: string | null;
  }>;
  new_arrivals: Array<{
    id: number;
    name: string;
    price: number;
    final_price: number;
    is_on_sale: boolean;
    image: string | null;
    date_added: string;
    brand: string | null;
  }>;
  testimonials: Array<{
    id: number;
    name: string;
    position: string;
    content: string;
    image: string | null;
    rating: number;
  }>;
  featured_brands: Array<{
    id: number;
    name: string;
    image: string | null;
  }>;
}

export interface StaticPage {
  id: number;
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
  meta_keyword: string;
  slug: string;
}

export interface Banner {
  id: number;
  banner: number;
  banner_type: string | null;
  title: string;
  url: string;
  link: string;
  image: string | null;
  sort_order: number;
  width?: number;
  height?: number;
}

export interface GetBannersParams {
  type?: 'home' | 'category' | 'product';
  limit?: number;
}

export interface GetBannersResponse {
  data: Banner[];
}

export interface GetHomepageContentResponse {
  data: HomepageContent;
}

export interface GetStaticPageResponse {
  data: StaticPage;
}

// ==============================
// Auth Types
// ==============================
export interface Credentials {
  email: string;
  password: string;
  guest_session_id?: string;
}

export interface RegisterCredentials {
  firstname: string;
  lastname: string;
  email: string;
  telephone: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterVerification {
  email: string;
  code: string;
  device_name?: string;
  guest_session_id?: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
  };
}

export interface RegisterResponse {
  message: string;
  verification_required: boolean;
  expires_in_seconds: number;
  email: string;
  // data?: any; // Removed as it wasn't in the original but might be useful
}

export interface VerifyRegistrationResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
  };
}

export interface ResendOtpResponse {
  message: string;
  expires_in_seconds: number;
}

export interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  telephone: string;
  full_name: string;
  is_admin: boolean;
  date_added: string;
}

export interface UpdateProfileData {
  [key: string]: string | undefined;
  firstname?: string;
  lastname?: string;
  telephone?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
    full_name: string;
  };
}

export interface ChangePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ApiError {
  error?: {
    status?: number;
    data?: any;
  };
}

// ==============================
// Cart Types
// ==============================
export interface CartItemOption {
  id: number;
  name: string;
  value: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  model: string;
  quantity: number;
  price: number;
  final_price: number;
  total: number;
  image: string | null;
  options: CartItemOption[];
}

export interface CartSummary {
  subtotal: number;
  tax: number;
  tax_rate?: string | number;
  shipping: number;
  shipping_cost?: number;
  free_shipping_threshold?: number;
  total: number; // This maps to grand_total in new structure
  grand_total?: number; // Explicit field from backend
  item_count: number; // This maps to total_items
  total_items?: number; // Explicit field from backend
}

export interface CartResponse {
  data: {
    items: CartItem[];
    summary: CartSummary;
  };
}

export interface MergeGuestCartPayload {
  guest_session_id: string;
}

export interface AddGuestCartItemPayload {
  session_id: string;
  product_id: number;
  quantity: number;
  option?: Record<string, any>;
}

export interface GetGuestCartParams {
  session_id: string;
}

export interface CartState extends EntityState<CartItem, number> {
  loading: boolean;
  error: string | null;
  summary: CartSummary | null;
}

export interface AddToCartPayload {
  product_id: number;
  quantity: number;
  option?: Record<string, any>;
}

export interface UpdateCartItemPayload {
  id: number;
  quantity: number;
}

export interface RemoveFromCartPayload {
  id: number;
}

// ==============================
// Product Types
// ==============================
export interface Product {
  id: string | number;
  name: string;
  description?: string;
  model?: string;
  price: number;
  final_price: number;
  is_on_sale?: boolean;
  on_sale?: boolean; // Alternative field name from search
  discount_percentage?: number;
  quantity?: number;
  image?: string | null;
  main_image?: string | null;
  images?: string[] | null;
  manufacturer?: string;
  brand?: string | { id: number; name: string; image?: string } | null;
  in_stock?: boolean;
  stock_quantity?: number;
  average_rating?: number;
  rating?: number; // Alternative field name from search
  review_count?: number;
  date_added?: string;
  status?: boolean;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  categories?: Array<{
    id: number;
    name: string;
  }>;
  viewed?: number;
  total_sold?: number;
  name_en?: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  thumbnail?: string;
  [key: string]: any;
}

export interface GetProductsParams {
  category?: number | null;
  min_price?: number | null;
  max_price?: number | null;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'best_selling';
  page?: number;
  per_page?: number;
  brand?: string | null;
}

export interface GetProductsResponse {
  data: Product[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
  filters?: {
    category?: {
      id: number;
      name: string;
    };
    price_range?: {
      min: number;
      max: number;
    };
  };
}

export interface ProductState extends EntityState<Product, string | number> {
  loading: boolean;
  error: string | null;
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
  filters?: {
    category?: {
      id: number;
      name: string;
    };
    price_range?: {
      min: number;
      max: number;
    };
  };
}

// ==============================
// Address Types
// ==============================
export interface Address {
  id: number | string;
  firstname: string;
  lastname: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  postcode: string;
  country_id: number;
  zone_id: number;
  default: boolean;
  custom_field?: Record<string, any>;
  [key: string]: any;
}

export interface AddressState extends EntityState<Address, number | string> {
  loading: boolean;
  error: any;
  defaultAddressId: number | string | null;
}

export interface AddressResponse {
  data: Address[];
}

// ==============================
// Brand Types
// ==============================
export interface Brand {
  id: number;
  name: string;
  image: string | null;
  sort_order: number;
  product_count?: number;
  products?: BrandProduct[];
}

export interface BrandProduct {
  id: number;
  name: string;
  price: number;
  final_price: number;
  is_on_sale: boolean;
  discount_percentage: number;
  image: string | null;
  average_rating: number;
  review_count: number;
}

export interface GetBrandsParams {
  page?: number;
  limit?: number;
  sort?: 'name' | 'popularity';
}

export interface GetBrandProductsParams {
  id: number;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
}

export interface GetFeaturedBrandsParams {
  limit?: number;
}

export interface GetBrandsByLetterParams {
  letter: string;
  page?: number;
  limit?: number;
  sort?: 'name' | 'popularity';
}

export interface BrandsResponse {
  data: Brand[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface BrandDetailResponse {
  data: {
    id: number;
    name: string;
    image: string | null;
    sort_order: number;
    products: BrandProduct[];
    product_count: number;
  };
}

export interface FeaturedBrandsResponse {
  data: Brand[];
}

export interface ExtendedBrandsState extends EntityState<Brand, number> {
  loading: boolean;
  error: string | null;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// ==============================
// Category Types
// ==============================
export interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string | null;
  parent_id: number;
  children_count: number;
  children?: Category[];
  product_count?: number;
  meta_title?: string;
  meta_description?: string;
  meta_keyword?: string;
  [key: string]: any;
}

export interface ProductParams {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
  min_price?: number;
  max_price?: number;
  attributes?: string;
}

export interface GetProductsByCategoryArgs {
  id: number;
  params?: ProductParams;
}

export interface GetCategoryTreeParams {
  parent_id?: number;
  include_products?: boolean;
}

export interface CategoryState extends EntityState<Category, number> {
  loading: boolean;
  error: string | null;
  tree: Category[] | null;
}

export interface CategoryApiResponse {
  data: Category[];
}

export interface CategoryDetailResponse {
  data: {
    id: number;
    name: string;
    description: string;
    image: string | null;
    meta_title: string;
    meta_description: string;
    meta_keyword: string;
    products: any[];
    filters: any[];
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// ==============================
// Coupon Types
// ==============================
export interface CouponValidation {
  id: number;
  code: string;
  type: 'P' | 'F';
  discount: number;
  total: number;
  description: string;
  [key: string]: any;
}

export interface Promotion {
  id: number;
  name: string;
  code: string;
  type: 'P' | 'F';
  discount: number;
  shipping: boolean;
  total: number;
  description: string;
  date_start: string;
  date_end: string;
  formatted_discount: string;
}

export interface ValidateCouponParams {
  code: string;
  subtotal: number;
  customer_id?: number;
}

export interface GetActivePromotionsParams {
  page?: number;
  limit?: number;
  category?: number;
}

// ==============================
// Notification Types
// ==============================
export interface Notification {
  id: string | number;
  title: string;
  message: string;
  type: 'order' | 'product' | 'general' | 'promotion';
  data: Record<string, any>;
  read: boolean;
  date_added: string;
  date_read?: string | null;
  [key: string]: any;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  type?: 'order' | 'product' | 'general';
  read?: boolean;
}

export interface NotificationState extends EntityState<Notification, string | number> {
  loading: boolean;
  error: string | null;
  unreadCount: number;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface NotificationStates extends EntityState<Notification, string | number> {
  loading: boolean;
  error: string | null;
  unreadCount: number;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// ==============================
// Order Types
// ==============================
export interface OrderItem {
  order_product_id?: string | number;
  id?: string | number; // Alias for order_product_id
  order_id: string | number;
  product_id: string | number;
  name: string;
  model: string;
  quantity: number;
  price: number;
  total: number;
  tax: number;
  reward?: number;
  image?: string;
  [key: string]: any;
}

export interface OrderTotal {
  code: string;
  title: string;
  value: number;
  sort_order: number;
  [key: string]: any;
}

export interface OrderHistory {
  status: string;
  status_id: number;
  comment: string;
  date_added: string;
  notify: boolean;
  [key: string]: any;
}

export interface OrderAddress {
  address_1: string;
  address_2?: string;
  city: string;
  postcode: string;
  country: string;
  zone: string;
  [key: string]: any;
}

export interface Order {
  order_id: string | number;
  id?: string | number; // Alias for order_id
  invoice_no: string | number;
  invoice_prefix?: string;
  store_id?: number;
  store_name?: string;
  store_url?: string;
  customer_id: number;
  customer_group_id?: number;
  firstname: string;
  lastname: string;
  email: string;
  telephone?: string;
  total: number;
  order_status_id: number;
  status_id?: number; // Alias for order_status_id
  status?: string;
  date_added: string;
  date_modified?: string;
  // Shipping Info
  shipping_firstname?: string;
  shipping_lastname?: string;
  shipping_address_1?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_postcode?: string;
  shipping_country?: string;
  shipping_country_id?: number;
  shipping_zone?: string;
  shipping_zone_id?: number;
  shipping_method: string;
  shipping_code?: string;
  // Payment Info
  payment_firstname?: string;
  payment_lastname?: string;
  payment_address_1?: string;
  payment_address_2?: string;
  payment_city?: string;
  payment_postcode?: string;
  payment_country?: string;
  payment_country_id?: number;
  payment_zone?: string;
  payment_zone_id?: number;
  payment_method: string;
  payment_code?: string;
  // Other
  comment?: string;
  currency_code?: string;
  currency_value?: number;
  ip?: string;
  user_agent?: string;
  // Legacy computed fields
  shipping?: {
    cost: number;
    free_threshold: number;
    is_free: boolean;
  };
  tax?: {
    rate: string;
    amount: number;
  };
  // Related data
  products?: OrderItem[];
  totals?: OrderTotal[];
  history?: OrderHistory[];
  shipping_address?: OrderAddress;
  payment_address?: OrderAddress;
  [key: string]: any;
}

export interface CreateOrderPayload {
  shipping_address_id?: number;
  payment_method: string;
  shipping_method?: string;
  comment?: string;
  coupon_code?: string;
  // Guest checkout fields
  guest_session_id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  telephone?: string;
  // Address fields for guest checkout without saved address
  address?: {
    address_1: string;
    address_2?: string;
    city: string;
    postcode: string;
    country_id: number;
    zone_id: number;
  };
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
}

export interface RequestCancellationPayload {
  orderId: string | number;
  reason: string;
}

export interface RequestReturnRefundPayload {
  id: string | number;
  reason: string;
  product_ids: number[];
  quantities: number[];
  images?: string[];
}

export interface OrderState extends EntityState<Order, string | number> {
  loading: boolean;
  error: string | null;
  currentOrder: Order | null;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}


// ==============================
// Payment Types
// ==============================
export interface PaymentRequestData {
  order_id: number;
  amount: number;
  currency: 'SAR' | 'USD' | 'EUR' | 'AED';
}

export interface PaymentPostActionData {
  amount: number;
  currency: 'SAR' | 'USD' | 'EUR' | 'AED';
}

export interface HyperPayPaymentResponse {
  success: boolean;
  data: any;
  status: number;
}

export interface PaymentStatusResponse {
  success: boolean;
  data: any;
  status: number;
}

export interface PaymentCallbackResponse {
  message: string;
  order_id: number | null;
  result: any;
}

// ==============================
// Review Types
// ==============================
export type ReviewId = string | number;

export interface Review {
  id: ReviewId;
  author: string;
  text: string;
  rating: number;
  date_added: string;
  date_modified?: string;
  helpful_count?: number;
  reported?: boolean;
  user?: {
    id: number;
    name: string;
  };
  product_id?: number;
  product_name?: string;
  status?: 'approved' | 'pending';
}

export interface ProductReviewResponse {
  product: {
    id: number;
    name: string;
    average_rating: number;
    total_reviews: number;
  };
  reviews: {
    data: Review[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface UserReviewResponse {
  data: Array<{
    id: number;
    product_id: number;
    product_name: string;
    text: string;
    rating: number;
    status: 'approved' | 'pending';
    date_added: string;
    date_modified?: string;
  }>;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ReviewSubmitData {
  rating: number;
  text: string;
}

export interface ReviewUpdateData extends Partial<ReviewSubmitData> {
  reviewId: ReviewId;
}

export interface GetProductReviewsParams {
  productId: number;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'highest' | 'lowest';
  rating?: number;
}

export interface GetUserReviewsParams {
  page?: number;
  limit?: number;
}

export interface ReportReviewParams {
  reviewId: ReviewId;
  reason: string;
}

export interface ReviewsState extends EntityState<Review, ReviewId> {
  loading: boolean;
  error: string | null;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ==============================
// Search Types
// ==============================
export interface SearchProduct {
  id: string | number;
  name_en?: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  price: number;
  final_price: number;
  stock_quantity?: number;
  quantity: number;
  rating?: number;
  review_count?: number;
  image?: string;
  main_image?: string;
  images?: string[];
  thumbnail?: string;
  model?: string;
  name: string;
  on_sale: boolean;
  status: boolean;
  date_added: string;
  [key: string]: any;
}

export interface FacetValue {
  value: string;
  count: number;
  [key: string]: any;
}

export interface Facet {
  field: string;
  values: FacetValue[];
  stats?: {
    count: number;
    min?: number;
    max?: number;
    avg?: number;
    sum?: number;
  };
}

export interface SearchFacets {
  [key: string]: Facet | undefined;
  categories?: Facet;
  price_range?: Facet;
  on_sale?: Facet;
  status?: Facet;
}

export interface SearchPagination {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface SearchParams {
  q?: string;
  page?: number;
  per_page?: number;
  categories?: string[];
  category_ids?: (string | number)[];
  price_range?: string[];
  on_sale?: boolean | string | null;
  status?: boolean | string | null;
  sort_by?: 'price_asc' | 'price_desc' | 'date_added_desc' | 'date_added_asc' | 'relevance';
  min_price?: number | null;
  max_price?: number | null;
}

export interface AutocompleteParams {
  q: string;
  limit?: number;
}

export interface SearchResponse {
  success: boolean;
  data: {
    products: SearchProduct[];
    facets: SearchFacets;
    pagination: SearchPagination;
    search_time_ms?: number;
  };
}

export interface AutocompleteResponse {
  success: boolean;
  suggestions: Array<{
    id: string | number;
    name_en?: string;
    name_ar?: string;
    price: number;
    image?: string;
    main_image?: string;
  }>;
}

export interface SearchState extends EntityState<SearchProduct, string | number> {
  loading: boolean;
  error: string | null;
  facets: SearchFacets;
  pagination: SearchPagination;
  searchTimeMs: number;
  lastSearchQuery: string | null;
  suggestions: Array<{
    id: string | number;
    name_en?: string;
    name_ar?: string;
    price: number;
    image?: string;
    main_image?: string;
  }>;
}

// ==============================
// Seller Types
// ==============================
export interface Seller {
  id: string | number;
  name: string;
  phone: string;
  phone2?: string;
  address: string;
  facebook_link?: string;
  telegram_link?: string;
  twitter_link?: string;
  tiktok_link?: string;
  instagram_link?: string;
  snap_link?: string;
  comment?: string;
  status: 'active' | 'pending';
  total_products: number;
  created_at: string;
  updated_at?: string;
  [key: string]: any;
}

export interface GetSellersParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'pending' | 'all';
}

export interface GetSellerProductsParams {
  id: string | number;
  page?: number;
  limit?: number;
}

export interface ApplyToBecomeSellerPayload {
  name: string;
  phone: string;
  address?: string;
  facebook_link?: string;
  instagram_link?: string;
  comment?: string;
  phone2?: string;
  telegram_link?: string;
  twitter_link?: string;
  tiktok_link?: string;
  snap_link?: string;
}

export interface SellerState extends EntityState<Seller, string | number> {
  loading: boolean;
  error: string | null;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
}

export interface SellersResponse {
  data: Seller[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SellerProductsResponse {
  seller: {
    id: string | number;
    name: string;
  };
  products: {
    data: any[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

// ==============================
// Settings Types
// ==============================
export interface Language {
  id: number;
  name: string;
  code: string;
  locale: string;
  image: string;
  is_default: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  decimal_place: number;
  value: number;
}

export interface StoreSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  url: string;
  logo: string;
  icon: string;
}

export interface SocialMedia {
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
}

export interface ContactSettings {
  email: string;
  phone: string;
  address: string;
  working_hours: string;
  social_media: SocialMedia;
}

export interface FeatureFlags {
  guest_checkout: boolean;
  wishlist_enabled: boolean;
  reviews_enabled: boolean;
  coupons_enabled: boolean;
}

export interface SiteSettings {
  store: StoreSettings;
  currency: Currency;
  languages: Language[];
  contact: ContactSettings;
  features: FeatureFlags;
  updated_at: string;
}

export interface GeoZone {
  id: number;
  name: string;
  description: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost?: number;
  tax_class_id?: number;
  geo_zone_id?: number;
  minimum_order?: number;
  status: boolean;
}

export interface ShippingSettings {
  methods: ShippingMethod[];
  geo_zones: GeoZone[];
  default_method: string;
  handling_fee: number;
  tax_included: boolean;
  updated_at: string;
}

export interface Policy {
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  updated_at: string;
}

export interface PageContent {
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
  updated_at: string;
}

export interface Pages {
  about: PageContent;
  contact: PageContent;
  privacy: PageContent;
  terms: PageContent;
  return: PageContent;
}

// ==============================
// Wishlist Types
// ==============================
export interface WishlistProduct {
  id: string | number;
  name: string;
  model: string;
  image: string | null;
  price: number;
  final_price: number;
  is_on_sale: boolean;
  in_stock: boolean;
  added_at: string;
  [key: string]: any;
}

export interface WishlistResponse {
  data: WishlistProduct[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface AddToWishlistPayload {
  product_id: string | number;
}

export interface WishlistState extends EntityState<WishlistProduct, string | number> {
  loading: boolean;
  error: string | null;
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  } | null;
}