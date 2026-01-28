// src/store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// --- Types ---
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

export interface LoadingState {
  [key: string]: boolean;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  showProgress?: boolean;
}

export interface UIState {
  modal: ModalState;
  drawer: DrawerState;
  loading: LoadingState;
  notifications: NotificationState[];
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  cartOpen: boolean;
  wishlistOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  // Add other UI-specific states as needed
}

// --- Initial State ---
const initialState: UIState = {
  modal: {
    open: false,
    type: null,
    props: {},
  },
  drawer: {
    open: false,
    type: null,
    props: {},
  },
  loading: {},
  notifications: [],
  sidebarOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
  cartOpen: false,
  wishlistOpen: false,
  theme: 'system',
  language: 'en',
  currency: 'SAR',
};

// --- Slice ---
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // --- Modal Actions ---
    openModal: (state, action: PayloadAction<{ type: string; props?: Record<string, any> }>) => {
      state.modal = {
        open: true,
        type: action.payload.type,
        props: action.payload.props || {},
      };
    },
    closeModal: (state) => {
      state.modal = {
        open: false,
        type: null,
        props: {},
      };
    },

    // --- Drawer Actions ---
    openDrawer: (state, action: PayloadAction<{ type: string; props?: Record<string, any> }>) => {
      state.drawer = {
        open: true,
        type: action.payload.type,
        props: action.payload.props || {},
      };
    },
    closeDrawer: (state) => {
      state.drawer = {
        open: false,
        type: null,
        props: {},
      };
    },

    // --- Loading Actions ---
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading;
    },
    setBulkLoading: (state, action: PayloadAction<LoadingState>) => {
      state.loading = { ...state.loading, ...action.payload };
    },

    // --- Notification Actions ---
    addNotification: (state, action: PayloadAction<Omit<NotificationState, 'id'>>) => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const notification: NotificationState = {
        id,
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(notification => notification.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // --- Sidebar Actions ---
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    // --- Mobile Menu Actions ---
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },

    // --- Search Actions ---
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.searchOpen = action.payload;
    },

    // --- Cart Actions ---
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.cartOpen = action.payload;
    },

    // --- Wishlist Actions ---
    setWishlistOpen: (state, action: PayloadAction<boolean>) => {
      state.wishlistOpen = action.payload;
    },

    // --- Theme Actions ---
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },

    // --- Language Actions ---
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },

    // --- Currency Actions ---
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
  },
});

// --- Actions ---
export const {
  openModal,
  closeModal,
  openDrawer,
  closeDrawer,
  setLoading,
  setBulkLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  setSidebarOpen,
  setMobileMenuOpen,
  setSearchOpen,
  setCartOpen,
  setWishlistOpen,
  setTheme,
  setLanguage,
  setCurrency,
} = uiSlice.actions;

// --- Selectors ---
export const selectModal = (state: RootState) => state.ui.modal;
export const selectDrawer = (state: RootState) => state.ui.drawer;
export const selectLoading = (state: RootState) => state.ui.loading;
export const selectNotifications = (state: RootState) => state.ui.notifications;
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectMobileMenuOpen = (state: RootState) => state.ui.mobileMenuOpen;
export const selectSearchOpen = (state: RootState) => state.ui.searchOpen;
export const selectCartOpen = (state: RootState) => state.ui.cartOpen;
export const selectWishlistOpen = (state: RootState) => state.ui.wishlistOpen;
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectLanguage = (state: RootState) => state.ui.language;
export const selectCurrency = (state: RootState) => state.ui.currency;

// --- Selector Factories ---
export const selectIsLoading = (key: string) => (state: RootState) => state.ui.loading[key] || false;
export const selectNotificationById = (id: string) => (state: RootState) => 
  state.ui.notifications.find((notification:NotificationState )  => notification.id === id);

// --- Reducer ---
export default uiSlice.reducer;