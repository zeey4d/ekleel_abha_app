import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "@/store/features/api/apiSlice";
import { slicesReducer } from "@/store/slices";

// Define the RootState type explicitly to include all slices
export type RootState = {
  [apiSlice.reducerPath]: ReturnType<typeof apiSlice.reducer>;
} & ReturnType<typeof slicesReducer>;

// Configure the Redux store
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    ...slicesReducer, // Spread the combined reducers from the slices directory
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

// Inferred types for store, state, and dispatch
export type AppDispatch = typeof store.dispatch;
// RootState is already defined above





// import { configureStore } from "@reduxjs/toolkit";
// import { apiSlice } from "@/store/features/api/apiSlice";
// import { slicesReducer } from "./slices";

// // Configure the Redux store
// export const store = configureStore({
//   reducer: {
//     [apiSlice.reducerPath]: apiSlice.reducer,
//     ...slicesReducer, // Spread the combined reducers from the slices directory
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(apiSlice.middleware),
//   devTools: process.env.NODE_ENV !== "production",
// });

// // Inferred types for store, state, and dispatch
// export type AppDispatch = typeof store.dispatch;
// export type RootState = ReturnType<typeof store.getState>;