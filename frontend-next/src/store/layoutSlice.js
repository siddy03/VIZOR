import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarCollapsed: false,
  title: 'Home',
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarState(state, action) {
      state.sidebarCollapsed = action.payload;
    },
    setTitle(state, action) {
      state.title = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarState, setTitle } = layoutSlice.actions;
export default layoutSlice.reducer;
