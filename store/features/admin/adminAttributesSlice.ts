// store/features/admin/adminAttributesSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// Types
export interface AdminAttribute {
    attribute_id: number;
    attribute_group_id: number;
    name: string;
    sort_order: number;
    attribute_group_name?: string;
}

export interface AdminAttributeGroup {
    attribute_group_id: number;
    name: string;
    sort_order: number;
}

export interface AdminAttributesParams {
    page?: number;
    per_page?: number;
    search?: string;
    attribute_group_id?: number;
}

export interface CreateAttributePayload {
    attribute_group_id: number;
    name: string;
    language_id: number;
    sort_order?: number;
}

export interface UpdateAttributePayload {
    id: number;
    data: Partial<CreateAttributePayload>;
}

export interface CreateAttributeGroupPayload {
    name: string;
    language_id: number;
    sort_order?: number;
}

export interface UpdateAttributeGroupPayload {
    id: number;
    data: Partial<CreateAttributeGroupPayload>;
}

export interface AdminAttributesState extends EntityState<AdminAttribute, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

export interface AdminAttributeGroupsState extends EntityState<AdminAttributeGroup, number> {
    loading: boolean;
    error: string | null;
    pagination?: any;
}

// Entity Adapters
const adminAttributesAdapter = createEntityAdapter<AdminAttribute, number>({
    selectId: (attribute) => attribute.attribute_id,
    sortComparer: (a, b) => a.sort_order - b.sort_order,
});

const adminAttributeGroupsAdapter = createEntityAdapter<AdminAttributeGroup, number>({
    selectId: (group) => group.attribute_group_id,
    sortComparer: (a, b) => a.sort_order - b.sort_order,
});

const initialAttributesState: AdminAttributesState = adminAttributesAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

const initialAttributeGroupsState: AdminAttributeGroupsState = adminAttributeGroupsAdapter.getInitialState({
    loading: false,
    error: null,
    pagination: undefined,
});

// API Slice
export const adminAttributesSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Get all attributes (admin)
        getAdminAttributes: builder.query<AdminAttributesState, AdminAttributesParams>({
            query: (params) => ({
                url: '/admin/attributes',
                params,
            }),
            transformResponse: (response: any): AdminAttributesState => {
                const state = adminAttributesAdapter.setAll(initialAttributesState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminAttribute' as const, id })),
                        { type: 'AdminAttribute' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminAttribute' as const, id: 'LIST' }],
        }),

        // Get single attribute (admin)
        getAdminAttribute: builder.query<AdminAttribute, number>({
            query: (id) => `/admin/attributes/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminAttribute' as const, id }],
        }),

        // Create attribute
        createAdminAttribute: builder.mutation<AdminAttribute, CreateAttributePayload>({
            query: (data) => ({
                url: '/admin/attributes',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminAttribute' as const, id: 'LIST' }],
        }),

        // Update attribute
        updateAdminAttribute: builder.mutation<AdminAttribute, UpdateAttributePayload>({
            query: ({ id, data }) => ({
                url: `/admin/attributes/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminAttribute' as const, id },
                { type: 'AdminAttribute' as const, id: 'LIST' },
            ],
        }),

        // Delete attribute
        deleteAdminAttribute: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/attributes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminAttribute' as const, id },
                { type: 'AdminAttribute' as const, id: 'LIST' },
            ],
        }),

        // Get all attribute groups (admin)
        getAdminAttributeGroups: builder.query<AdminAttributeGroupsState, AdminAttributesParams>({
            query: (params) => ({
                url: '/admin/attributes/groups',
                params,
            }),
            transformResponse: (response: any): AdminAttributeGroupsState => {
                const state = adminAttributeGroupsAdapter.setAll(initialAttributeGroupsState, response.data.data);
                return {
                    ...state,
                    pagination: response.data.meta || response.data,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminAttributeGroup' as const, id })),
                        { type: 'AdminAttributeGroup' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminAttributeGroup' as const, id: 'LIST' }],
        }),

        // Get single attribute group (admin)
        getAdminAttributeGroup: builder.query<AdminAttributeGroup, number>({
            query: (id) => `/admin/attributes/groups/${id}`,
            transformResponse: (response: any) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminAttributeGroup' as const, id }],
        }),

        // Create attribute group
        createAdminAttributeGroup: builder.mutation<AdminAttributeGroup, CreateAttributeGroupPayload>({
            query: (data) => ({
                url: '/admin/attributes/groups',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: [{ type: 'AdminAttributeGroup' as const, id: 'LIST' }],
        }),

        // Update attribute group
        updateAdminAttributeGroup: builder.mutation<AdminAttributeGroup, UpdateAttributeGroupPayload>({
            query: ({ id, data }) => ({
                url: `/admin/attributes/groups/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: any) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminAttributeGroup' as const, id },
                { type: 'AdminAttributeGroup' as const, id: 'LIST' },
            ],
        }),

        // Delete attribute group
        deleteAdminAttributeGroup: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/admin/attributes/groups/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminAttributeGroup' as const, id },
                { type: 'AdminAttributeGroup' as const, id: 'LIST' },
            ],
        }),
    }),
});

// Export hooks
export const {
    useGetAdminAttributesQuery,
    useGetAdminAttributeQuery,
    useCreateAdminAttributeMutation,
    useUpdateAdminAttributeMutation,
    useDeleteAdminAttributeMutation,
    useGetAdminAttributeGroupsQuery,
    useGetAdminAttributeGroupQuery,
    useCreateAdminAttributeGroupMutation,
    useUpdateAdminAttributeGroupMutation,
    useDeleteAdminAttributeGroupMutation,
} = adminAttributesSlice;

// Selectors
export const {
    selectAll: selectAllAdminAttributes,
    selectById: selectAdminAttributeById,
    selectIds: selectAdminAttributeIds,
} = adminAttributesAdapter.getSelectors<RootState>(
    (state) =>
        adminAttributesSlice.endpoints.getAdminAttributes.select({})(state).data || initialAttributesState
);

export const {
    selectAll: selectAllAdminAttributeGroups,
    selectById: selectAdminAttributeGroupById,
    selectIds: selectAdminAttributeGroupIds,
} = adminAttributeGroupsAdapter.getSelectors<RootState>(
    (state) =>
        adminAttributesSlice.endpoints.getAdminAttributeGroups.select({})(state).data || initialAttributeGroupsState
);

export default adminAttributesSlice;
