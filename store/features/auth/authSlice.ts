import { createSelector } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { authStorage } from '@/lib/authStorage';



import {
  Credentials,
  RegisterCredentials,
  RegisterVerification,
  ApiError,
  ResetPasswordData,
  ForgotPasswordData,
  ChangePasswordData,
  UpdateProfileData,
  UserProfile,
  ResendOtpResponse,
  LoginResponse,
  RegisterResponse,
  VerifyRegistrationResponse,
  UpdateProfileResponse,
  RequestDeleteAccountDataPayload,
  VerifyDeleteAccountDataPayload,
  RequestDeleteAccountPayload,
  VerifyDeleteAccountPayload,
  DeleteRequestResponse,
  DeleteVerifyResponse
} from '@/store/types';


const handleAuthError = (err: any, action: string) => {
  console.error(`${action} failed:`, err);
  return err;
};

// ==============================
// Token Management (using cookieManager)
export const authSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(credentials, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          handleAuthError(err, 'Registration');
        }
      },
    }),

    verifyRegistration: builder.mutation<VerifyRegistrationResponse, RegisterVerification>({
      query: (verificationData) => ({
        url: '/auth/register/verify',
        method: 'POST',
        body: verificationData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.access_token) {
            await authStorage.setToken(data.access_token);
            dispatch(authSlice.util.prefetch('getMe', undefined, { force: true }));
          }
        } catch (err) {
          handleAuthError(err, 'Registration verification');
        }
      },
    }),

    resendRegistrationOtp: builder.mutation<ResendOtpResponse, { email: string }>({
      query: ({ email }) => ({
        url: '/auth/register/resend-otp',
        method: 'POST',
        body: { email },
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          handleAuthError(err, 'Resending OTP');
        }
      },
    }),

    login: builder.mutation<LoginResponse, Credentials>({
      query: ({ email, password, guest_session_id }) => ({
        url: '/auth/login',
        method: 'POST',
        body: { email, password, guest_session_id },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await authStorage.setToken(data.access_token);
          dispatch(authSlice.util.prefetch('getMe', undefined, { force: true }));
        } catch (err) {
          const error = handleAuthError(err, 'Login');
          throw error;
        }
      },
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          handleAuthError(err, 'Logout');
        } finally {
          await authStorage.removeToken();
          dispatch(apiSlice.util.invalidateTags(['User', 'Cart', 'Wishlist', 'Order']));
        }
      },
    }),

    getMe: builder.query<UserProfile, void>({
      query: () => ({
        url: '/auth/me',
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 60,
      transformResponse: (response: UserProfile) => response,
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          const e = err as ApiError;
          if (e?.error?.status === 401) {
            // Optionally remove token
            // await authStorage.removeToken();
          }
        }
      },
    }),

    updateProfile: builder.mutation<UpdateProfileResponse, UpdateProfileData>({
      query: (profileData) => ({
        url: '/auth/me',
        method: 'PUT',
        body: profileData,
      }),
      async onQueryStarted(profileData, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          authSlice.util.updateQueryData('getMe', undefined, (draft: UserProfile) => {
            Object.keys(profileData).forEach((key) => {
              if (profileData[key] !== undefined) {
                (draft as any)[key] = profileData[key];
              }
            });
          })
        );

        try {
          const { data } = await queryFulfilled;
          // Update with server response data (partial user)
          dispatch(
            authSlice.util.updateQueryData('getMe', undefined, (draft: UserProfile) => {
              if (data.user) {
                Object.assign(draft, data.user);
              }
            })
          );
        } catch (err) {
          patchResult.undo();
          const error = handleAuthError(err, 'Profile update');
          throw error;
        }
      },
      invalidatesTags: ['User'],
    }),

    changePassword: builder.mutation<void, ChangePasswordData>({
      query: (passwordData) => ({
        url: '/auth/me/password',
        method: 'PUT',
        body: passwordData,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          const error = handleAuthError(err, 'Password change');
          throw error;
        }
      },
    }),

    forgotPassword: builder.mutation<void, ForgotPasswordData>({
      query: ({ email }) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          const error = handleAuthError(err, 'Password reset request');
          throw error;
        }
      },
    }),

    resetPassword: builder.mutation<void, ResetPasswordData>({
      query: (resetData) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: resetData,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          const error = handleAuthError(err, 'Password reset');
          throw error;
        }
      },
    }),

    requestDeleteAccountData: builder.mutation<DeleteRequestResponse, RequestDeleteAccountDataPayload>({
      query: (payload) => ({
        url: '/auth/delete-data/request',
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          const error = handleAuthError(err, 'Request delete account data');
          throw error;
        }
      },
    }),

    verifyDeleteAccountData: builder.mutation<DeleteVerifyResponse, VerifyDeleteAccountDataPayload>({
      query: (payload) => ({
        url: '/auth/delete-data/verify',
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          const error = handleAuthError(err, 'Verify delete account data');
          throw error;
        } finally {
          await authStorage.removeToken();
          dispatch(apiSlice.util.invalidateTags(['User', 'Cart', 'Wishlist', 'Order']));
        }
      },
    }),

    requestDeleteAccount: builder.mutation<DeleteRequestResponse, RequestDeleteAccountPayload>({
      query: (payload) => ({
        url: '/auth/delete-account/request',
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          const error = handleAuthError(err, 'Request delete account');
          throw error;
        }
      },
    }),

    verifyDeleteAccount: builder.mutation<DeleteVerifyResponse, VerifyDeleteAccountPayload>({
      query: (payload) => ({
        url: '/auth/delete-account/verify',
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          const error = handleAuthError(err, 'Verify delete account');
          throw error;
        } finally {
          await authStorage.removeToken();
          dispatch(apiSlice.util.invalidateTags(['User', 'Cart', 'Wishlist', 'Order']));
        }
      },
    }),
  }),
});

// ==============================
// Export Hooks
// ==============================
export const {
  useRegisterMutation,
  useVerifyRegistrationMutation,
  useResendRegistrationOtpMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRequestDeleteAccountDataMutation,
  useVerifyDeleteAccountDataMutation,
  useRequestDeleteAccountMutation,
  useVerifyDeleteAccountMutation,
} = authSlice;

// ==============================
// Selectors
// ==============================
export const selectCurrentUser = createSelector(
  [authSlice.endpoints.getMe.select()],
  (result) => result.data ?? null
);

export const selectIsAuthenticated = createSelector(
  [authSlice.endpoints.getMe.select()],
  (result) => !!result.data && !result.isError
);

export const selectAuthLoading = createSelector(
  [authSlice.endpoints.getMe.select()],
  (result) => result.isLoading
);

export const selectAuthError = createSelector(
  [authSlice.endpoints.getMe.select()],
  (result) => result.error
);

// ==============================
// Utility Functions
// ==============================
export const checkAuthStatus = async (): Promise<boolean> => {
  return await authStorage.isAuthenticated();
};

export const getAuthToken = async (): Promise<string | null> => await authStorage.getToken();

export default authSlice;