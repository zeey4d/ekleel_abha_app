// store/features/admin/adminMediaSlice.ts
import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';
import { RootState } from '@/store/store';

// =============================================================================
// Types - Updated to match new AdminMediaController (IDs are now Paths)
// =============================================================================

/** Unified item type returned by the controller index endpoint */
export interface MediaItem {
    id: string; // Path is the ID
    name: string;
    is_dir: boolean;
    size: number;
    mod_date: string;
    updated_at?: string;
    // Folder-specific
    parent_id?: string | null;
    children_count?: number;
    // File-specific
    file_name?: string;
    mime_type?: string;
    ext?: string;
    url?: string;
    thumbnailUrl?: string | null;
    folder_id?: string | null;
}

/** Media file type for file-specific operations */
export interface MediaFile {
    id: string;
    name: string;
    file_name: string;
    is_dir: false;
    size: number;
    mod_date: string;
    mime_type: string;
    ext: string;
    url: string;
    thumbnailUrl: string | null;
    folder_id: string | null;
    updated_at: string;
}

/** Media folder type for folder operations */
export interface MediaFolder {
    id: string;
    name: string;
    is_dir: true;
    size: 0;
    mod_date: string;
    parent_id: string | null;
    children_count: number;
    // From showFolder with parent relation
    parent?: MediaFolder | null;
    updated_at?: string;
    created_at?: string;
}

/** Parameters for fetching media list */
export interface AdminMediaParams {
    folder_id?: string | null;
    search?: string;
    sort_by?: 'name' | 'size' | 'created_at';
    sort_direction?: 'asc' | 'desc';
}

/** Parameters for fetching folders list */
export interface AdminFoldersParams {
    parent_id?: string | null;
}

/** Upload media payload */
export interface UploadMediaPayload {
    file: File;
    folder_id?: string | null;
}

/** Bulk upload payload */
export interface BulkUploadPayload {
    files: File[];
    folder_id?: string | null;
}

/** Update media (rename) payload */
export interface UpdateMediaPayload {
    id: string;
    data: {
        name?: string;
    };
}

/** Create folder payload */
export interface CreateFolderPayload {
    name: string;
    parent_id?: string | null;
}

/** Update folder payload */
export interface UpdateFolderPayload {
    id: string; // Current path
    data: {
        name?: string;
        parent_id?: string | null;
    };
}

/** Bulk move payload */
export interface BulkMovePayload {
    media_ids: string[];
    folder_id: string | null;
}

/** Bulk delete payload */
export interface BulkDeleteMediaPayload {
    media_ids: string[];
}

/** Media stats from controller */
export interface MediaStats {
    total_files: number;
    total_size: number;
    types: Record<string, number>;
}

/** Response structure from index endpoint */
export interface MediaIndexResponse {
    success: boolean;
    current_folder_id: string | null;
    data: MediaItem[];
}

/** Response structure from folder operations */
export interface FolderResponse {
    success: boolean;
    message?: string;
    data: MediaFolder;
}

/** Response structure from getFolders */
export interface FoldersListResponse {
    success: boolean;
    data: MediaFolder[];
}

/** Response structure from file operations */
export interface FileResponse {
    success: boolean;
    message?: string;
    data: MediaFile;
}

/** Response structure from stats endpoint */
export interface StatsResponse {
    success: boolean;
    data: MediaStats;
}

// =============================================================================
// Entity Adapter
// =============================================================================

export interface AdminMediaState extends EntityState<MediaItem, string> {
    loading: boolean;
    error: string | null;
    currentFolderId: string | null;
}

const adminMediaAdapter = createEntityAdapter<MediaItem, string>({
    selectId: (item) => item.id,
    sortComparer: (a, b) => {
        // Folders first, then by updated_at desc
        if (a.is_dir && !b.is_dir) return -1;
        if (!a.is_dir && b.is_dir) return 1;
        const aDate = a.updated_at || a.mod_date || '';
        const bDate = b.updated_at || b.mod_date || '';
        return bDate.localeCompare(aDate);
    },
});

const initialState: AdminMediaState = adminMediaAdapter.getInitialState({
    loading: false,
    error: null,
    currentFolderId: null,
});

// =============================================================================
// API Slice
// =============================================================================

export const adminMediaSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Get unified list of folders and files for a specific folder
         * GET /admin/media?folder_id=&search=&sort_by=&sort_direction=
         */
        getAdminMedia: builder.query<AdminMediaState, AdminMediaParams>({
            query: (params) => ({
                url: '/admin/media',
                params: {
                    folder_id: params.folder_id ?? null,
                    search: params.search,
                    sort_by: params.sort_by,
                    sort_direction: params.sort_direction,
                },
            }),
            transformResponse: (response: MediaIndexResponse): AdminMediaState => {
                const state = adminMediaAdapter.setAll(initialState, response.data || []);
                return {
                    ...state,
                    currentFolderId: response.current_folder_id,
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'AdminMedia' as const, id })),
                        { type: 'AdminMedia' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminMedia' as const, id: 'LIST' }],
        }),

        /**
         * Get folders list for navigation/moving
         * GET /admin/media/folders?parent_id=
         */
        getAdminMediaFolders: builder.query<MediaFolder[], AdminFoldersParams | void>({
            query: (params) => ({
                url: '/admin/media/folders',
                params: params ? { parent_id: params.parent_id } : {},
            }),
            transformResponse: (response: FoldersListResponse) => response.data,
            providesTags: (result) =>
                result
                    ? [
                        ...result.map((folder) => ({ type: 'AdminMediaFolder' as const, id: folder.id })),
                        { type: 'AdminMediaFolder' as const, id: 'LIST' },
                    ]
                    : [{ type: 'AdminMediaFolder' as const, id: 'LIST' }],
        }),

        /**
         * Get single folder details
         * GET /admin/media/folders/{id}
         */
        getAdminMediaFolder: builder.query<MediaFolder, string>({
            query: (id) => `/admin/media/folders/${encodeURIComponent(id)}`,
            transformResponse: (response: FolderResponse) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminMediaFolder' as const, id }],
        }),

        /**
         * Create folder
         * POST /admin/media/folders
         */
        createAdminMediaFolder: builder.mutation<MediaFolder, CreateFolderPayload>({
            query: (data) => ({
                url: '/admin/media/folders',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: FolderResponse) => response.data,
            invalidatesTags: [
                { type: 'AdminMediaFolder' as const, id: 'LIST' },
                { type: 'AdminMedia' as const, id: 'LIST' },
            ],
        }),

        /**
         * Update folder (rename or move)
         * PUT /admin/media/folders/{id}
         */
        updateAdminMediaFolder: builder.mutation<MediaFolder, UpdateFolderPayload>({
            query: ({ id, data }) => ({
                url: `/admin/media/folders/${encodeURIComponent(id)}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: FolderResponse) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminMediaFolder' as const, id },
                { type: 'AdminMediaFolder' as const, id: 'LIST' },
                { type: 'AdminMedia' as const, id: 'LIST' },
            ],
        }),

        /**
         * Delete folder (must be empty)
         * DELETE /admin/media/folders/{id}
         */
        deleteAdminMediaFolder: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/admin/media/folders/${encodeURIComponent(id)}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminMediaFolder' as const, id },
                { type: 'AdminMediaFolder' as const, id: 'LIST' },
                { type: 'AdminMedia' as const, id: 'LIST' },
            ],
        }),

        /**
         * Upload single file
         * POST /admin/media
         */
        uploadAdminMedia: builder.mutation<MediaFile, FormData>({
            query: (formData) => ({
                url: '/admin/media',
                method: 'POST',
                body: formData,
            }),
            transformResponse: (response: FileResponse) => response.data,
            invalidatesTags: [
                { type: 'AdminMedia' as const, id: 'LIST' },
                { type: 'AdminMedia' as const, id: 'STATS' },
            ],
        }),

        /**
         * Bulk upload files
         * POST /admin/media/bulk-upload
         */
        bulkUploadAdminMedia: builder.mutation<MediaFile[], FormData>({
            query: (formData) => ({
                url: '/admin/media/bulk-upload',
                method: 'POST',
                body: formData,
            }),
            transformResponse: (response: { success: boolean; message: string; data: MediaFile[] }) => response.data,
            invalidatesTags: [
                { type: 'AdminMedia' as const, id: 'LIST' },
                { type: 'AdminMedia' as const, id: 'STATS' },
            ],
        }),

        /**
         * Get single file details
         * GET /admin/media/{id}
         */
        getAdminMediaFile: builder.query<MediaFile, string>({
            query: (id) => `/admin/media/${encodeURIComponent(id)}`,
            transformResponse: (response: FileResponse) => response.data,
            providesTags: (result, error, id) => [{ type: 'AdminMedia' as const, id }],
        }),

        /**
         * Update file (rename)
         * PUT /admin/media/{id}
         */
        updateAdminMedia: builder.mutation<MediaFile, UpdateMediaPayload>({
            query: ({ id, data }) => ({
                url: `/admin/media/${encodeURIComponent(id)}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: FileResponse) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: 'AdminMedia' as const, id },
                { type: 'AdminMedia' as const, id: 'LIST' },
            ],
        }),

        /**
         * Delete file
         * DELETE /admin/media/{id}
         */
        deleteAdminMedia: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/admin/media/${encodeURIComponent(id)}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'AdminMedia' as const, id },
                { type: 'AdminMedia' as const, id: 'LIST' },
                { type: 'AdminMedia' as const, id: 'STATS' },
            ],
        }),

        /**
         * Bulk delete files
         * POST /admin/media/bulk-delete
         */
        bulkDeleteAdminMedia: builder.mutation<{ success: boolean; message: string }, BulkDeleteMediaPayload>({
            query: (data) => ({
                url: '/admin/media/bulk-delete',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [
                { type: 'AdminMedia' as const, id: 'LIST' },
                { type: 'AdminMedia' as const, id: 'STATS' },
            ],
        }),

        /**
         * Bulk move files
         * POST /admin/media/bulk-move
         */
        bulkMoveAdminMedia: builder.mutation<{ success: boolean; message: string }, BulkMovePayload>({
            query: (data) => ({
                url: '/admin/media/bulk-move',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [
                { type: 'AdminMedia' as const, id: 'LIST' },
            ],
        }),

        /**
         * Get media stats
         * GET /admin/media/stats
         */
        getAdminMediaStats: builder.query<MediaStats, void>({
            query: () => '/admin/media/stats',
            transformResponse: (response: StatsResponse) => response.data,
            providesTags: [{ type: 'AdminMedia' as const, id: 'STATS' }],
        }),
    }),
});

// =============================================================================
// Export hooks
// =============================================================================

export const {
    // Queries
    useGetAdminMediaQuery,
    useGetAdminMediaFoldersQuery,
    useGetAdminMediaFolderQuery,
    useGetAdminMediaFileQuery,
    useGetAdminMediaStatsQuery,
    // Mutations
    useUploadAdminMediaMutation,
    useBulkUploadAdminMediaMutation,
    useUpdateAdminMediaMutation,
    useDeleteAdminMediaMutation,
    useBulkDeleteAdminMediaMutation,
    useBulkMoveAdminMediaMutation,
    useCreateAdminMediaFolderMutation,
    useUpdateAdminMediaFolderMutation,
    useDeleteAdminMediaFolderMutation,
} = adminMediaSlice;

// =============================================================================
// Selectors
// =============================================================================

export const {
    selectAll: selectAllAdminMedia,
    selectById: selectAdminMediaById,
    selectIds: selectAdminMediaIds,
} = adminMediaAdapter.getSelectors<RootState>(
    (state) =>
        adminMediaSlice.endpoints.getAdminMedia.select({})(state).data || initialState
);

// Helper selectors
export const selectAdminMediaFolders = (items: MediaItem[]): MediaFolder[] =>
    items.filter((item): item is MediaItem & { is_dir: true } => item.is_dir) as unknown as MediaFolder[];

export const selectAdminMediaFiles = (items: MediaItem[]): MediaFile[] =>
    items.filter((item): item is MediaItem & { is_dir: false } => !item.is_dir) as unknown as MediaFile[];

export default adminMediaSlice;
