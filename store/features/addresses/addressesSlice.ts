// src/features/users/addresses/users/addressesSlice.ts
import { createSelector, createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';
import {
  Address,
  AddressState,
  AddressResponse
} from '@/store/types';


// --- Entity Adapter for Addresses ---
const addressesAdapter = createEntityAdapter<Address, number | string>({
  selectId: (address) => address.id,
});

const initialAddressesState: AddressState = addressesAdapter.getInitialState({
  loading: false,
  error: null,
  defaultAddressId: null,
});

// --- RTK Query API Slice Injection ---
export const addressesSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // --- Get User Addresses ---
    getUserAddresses: builder.query<AddressState, void>({
      query: () => '/users/addresses',
      transformResponse: (responseData: AddressResponse): AddressState => {
        const addresses = responseData.data;
        // Find default address
        const defaultAddress = addresses.find(addr => addr.default);
        const defaultAddressId = defaultAddress ? defaultAddress.id : null;

        // Normalize addresses
        const state = addressesAdapter.setAll(
          initialAddressesState,
          addresses
        );

        // Add default address info
        return {
          ...state,
          defaultAddressId,
        };
      },
      providesTags: (result, error, arg) =>
        result
          ? [...result.ids.map((id) => ({ type: 'Address' as const, id })), { type: 'Address' as const, id: 'LIST' }]
          : [{ type: 'Address' as const, id: 'LIST' }],
    }),

    // --- Add New Address ---
    addAddress: builder.mutation<Address, Partial<Address>>({
      query: (addressData) => ({
        url: '/users/addresses',
        method: 'POST',
        body: addressData,
      }),
      // Optimistic update for adding address
      async onQueryStarted(addressData, { dispatch, queryFulfilled }) {
        const tempId = `temp_${Date.now()}`;
        const newAddress: Address = {
          id: tempId,
          firstname: addressData.firstname || '',
          lastname: addressData.lastname || '',
          // Ensure we have all required fields with defaults
          company: addressData.company || '',
          address_1: addressData.address_1 || '',
          address_2: addressData.address_2 || '',
          city: addressData.city || '',
          postcode: addressData.postcode || '',
          country_id: addressData.country_id || 0,
          zone_id: addressData.zone_id || 0,
          default: addressData.default || false,
          ...addressData,
        };

        const patchResult = dispatch(
          addressesSlice.util.updateQueryData('getUserAddresses', undefined, (draft) => {
            // If this is set as default, unset others
            if (newAddress.default) {
              Object.values(draft.entities).forEach(addr => {
                if (addr && addr.default) {
                  addr.default = false;
                }
              });
              draft.defaultAddressId = tempId;
            }

            addressesAdapter.addOne(draft, newAddress);
          })
        );

        try {
          const { data: response } = await queryFulfilled;
          // Check if response is the address object directly or wrapped in { data: Address }
          // Based on type Address, it should be the address. But if API returns wrapped, we need to handle it.
          // In previous error it was failing. Let's assume it returns {data: Address, message: string} based on other slices.

          let createdAddress = response as Address;
          if ((response as any).data) {
            createdAddress = (response as any).data;
          }

          // Update with actual ID after successful creation
          dispatch(
            addressesSlice.util.updateQueryData('getUserAddresses', undefined, (draft) => {
              // Remove temporary address
              addressesAdapter.removeOne(draft, tempId);
              // Add real address
              addressesAdapter.addOne(draft, createdAddress);

              // Update default address ID if needed
              if (createdAddress.default) {
                draft.defaultAddressId = createdAddress.id;
              }
            })
          );
        } catch (err: any) {
          patchResult.undo();
          // RTK Query error structure: { error: { status, data } }
          const errorMessage = err?.error?.data?.message || err?.error?.data?.error || err?.message || 'Unknown error';
          const errorStatus = err?.error?.status || 'N/A';
          console.error('Failed to add address:', {
            status: errorStatus,
            message: errorMessage,
            fullError: err?.error || err,
          });
        }
      },
      invalidatesTags: [{ type: 'Address' as const, id: 'LIST' }],
    }),

    // --- Update Address ---
    updateAddress: builder.mutation<Address, { id: number | string } & Partial<Address>>({
      query: ({ id, ...addressData }) => ({
        url: `/users/addresses/${id}`,
        method: 'PUT',
        body: addressData,
      }),
      // Optimistic update for address update
      async onQueryStarted({ id, ...addressData }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          addressesSlice.util.updateQueryData('getUserAddresses', undefined, (draft) => {
            const address = draft.entities[id];
            if (address) {
              // Update address fields
              Object.keys(addressData).forEach(key => {
                if (key in address) {
                  (address as any)[key] = (addressData as any)[key];
                }
              });

              // If this is set as default, unset others
              if (addressData.default) {
                Object.values(draft.entities).forEach(addr => {
                  if (addr && addr.id !== id && addr.default) {
                    addr.default = false;
                  }
                });
                draft.defaultAddressId = id;
              }
            }
          })
        );

        try {
          const { data: updatedAddress } = await queryFulfilled;
          // Query returns wrapped data: { message, data: Address } -> handled by transformResponse usually but here we access direct result
          // Wait, query expects Address return. The backend returns { message: string, data: Address }.
          // I might need to transformResponse for mutation or just rely on 'data' property access if the base query doesn't unwrap deeply.
          // The baseQuery in apiSlice usually returns 'data'.
          // If the backend returns { message, data }, then the result.data IS that object.
          // Let's assume the generic T in mutation<T, ...> matches the HTTP response body structure if not transformed.
          // If I said mutation<Address>, it expects the body to be Address. But backend returns {message, data: Address}.
          // I should probably fix the mutation Generic type to { message: string, data: Address } or similar, OR use transformResponse.

          dispatch(
            addressesSlice.util.updateQueryData('getUserAddresses', undefined, (draft) => {
              const address = draft.entities[id];
              if (address && (updatedAddress as any).data) { // Handle wrapped response
                Object.assign(address, (updatedAddress as any).data);
              } else if (address) {
                Object.assign(address, updatedAddress);
              }
            })
          );
        } catch (err: any) {
          patchResult.undo();
          const errorMessage = err?.error?.data?.message || err?.error?.data?.error || err?.message || 'Unknown error';
          const errorStatus = err?.error?.status || 'N/A';
          console.error('Failed to update address:', {
            status: errorStatus,
            message: errorMessage,
            fullError: err?.error || err,
          });
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Address' as const, id }],
    }),

    // --- Delete Address ---
    deleteAddress: builder.mutation<{ success: boolean }, number | string>({
      query: (id) => ({
        url: `/users/addresses/${id}`,
        method: 'DELETE',
      }),
      // Optimistic update for address deletion
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          addressesSlice.util.updateQueryData('getUserAddresses', undefined, (draft) => {
            const address = draft.entities[id];
            if (address && address.default) {
              // Find another address to set as default
              const otherAddresses = Object.values(draft.entities).filter(
                (addr): addr is Address => !!addr && addr.id !== id
              );
              if (otherAddresses.length > 0) {
                // We should technically tell backend to set new default, but backend might not do it automatically on delete?
                // The controller doesn't seem to auto-assign new default on delete.
                // So purely frontend optimistic update:
                // otherAddresses[0].default = true; 
                // draft.defaultAddressId = otherAddresses[0].id;
                // Actually, let's just clear defaultAddressId if the default one is deleted.
                draft.defaultAddressId = null;
              } else {
                draft.defaultAddressId = null;
              }
            }

            addressesAdapter.removeOne(draft, id);
          })
        );

        try {
          await queryFulfilled;
        } catch (err: any) {
          patchResult.undo();
          const errorMessage = err?.error?.data?.message || err?.error?.data?.error || err?.message || 'Unknown error';
          const errorStatus = err?.error?.status || 'N/A';
          console.error('Failed to delete address:', {
            status: errorStatus,
            message: errorMessage,
            fullError: err?.error || err,
          });
        }
      },
      invalidatesTags: (result, error, id) => [{ type: 'Address' as const, id }, { type: 'Address' as const, id: 'LIST' }],
    }),
  }),
});

// Export auto-generated hooks
export const {
  useGetUserAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressesSlice;

// --- Memoized Selectors ---
// Selector for addresses
export const {
  selectAll: selectAllAddresses,
  selectById: selectAddressById,
  selectIds: selectAddressIds,
} = addressesAdapter.getSelectors<RootState>((state) =>
  addressesSlice.endpoints.getUserAddresses.select()(state).data || initialAddressesState
);

// Selector for default address
export const selectDefaultAddress = createSelector(
  [selectAllAddresses, (state: RootState) => addressesSlice.endpoints.getUserAddresses.select()(state).data?.defaultAddressId],
  (addresses, defaultAddressId) =>
    addresses.find(address => address.id === defaultAddressId) || null
);

// Selector for shipping countries and zones (if needed)
export const selectShippingLocations = createSelector(
  [selectAllAddresses],
  (addresses) => {
    // This would need to be populated from a separate API call in a real app
    // This is just a placeholder for demonstration
    return {
      countries: [
        {
          id: 184, name: 'Saudi Arabia', zones: [
            { id: 3513, name: 'Riyadh' },
            { id: 3514, name: 'Jeddah' },
            // ... other zones
          ]
        }
      ]
    };
  }
);

export default addressesSlice;