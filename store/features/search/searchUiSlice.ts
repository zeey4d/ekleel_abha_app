
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from "@/store/store";

interface SearchUiState {
    recentSearches: string[];
}

const initialState: SearchUiState = {
    recentSearches: [],
};

const searchUiSlice = createSlice({
    name: 'searchUi',
    initialState,
    reducers: {
        addRecentSearch: (state, action: PayloadAction<string>) => {
            const query = action.payload.trim();
            if (!query) return;
            // Remove if exists to push to top
            state.recentSearches = state.recentSearches.filter(s => s !== query);
            // Add to front
            state.recentSearches.unshift(query);
            // Limit to 10
            if (state.recentSearches.length > 10) {
                state.recentSearches.pop();
            }
        },
        clearRecentSearches: (state) => {
            state.recentSearches = [];
        },
        removeRecentSearch: (state, action: PayloadAction<string>) => {
             state.recentSearches = state.recentSearches.filter(s => s !== action.payload);
        }
    }
});

export const { addRecentSearch, clearRecentSearches, removeRecentSearch } = searchUiSlice.actions;

export const selectRecentSearches = (state: RootState) => state.searchUi.recentSearches;

export default searchUiSlice.reducer;
