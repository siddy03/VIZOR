import { createSlice } from '@reduxjs/toolkit';

function loadFromLocalStorage() {
  if (typeof localStorage === 'undefined') return [];
  const stored = localStorage.getItem('vizor_roundtables');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing roundtables from localStorage', e);
    }
  }
  return [];
}

const initialState = {
  roundtables: loadFromLocalStorage(),
};

const roundtableSlice = createSlice({
  name: 'roundtable',
  initialState,
  reducers: {
    loadRoundtables(state, action) {
      state.roundtables = action.payload;
    },
    addRoundtable(state, action) {
      const current = state.roundtables;
      const newId = current.length > 0 ? Math.max(...current.map((r) => r.id)) + 1 : 1;
      state.roundtables.push({ ...action.payload, id: newId });
    },
    updateRoundtable(state, action) {
      const index = state.roundtables.findIndex((r) => r.id === action.payload.id);
      if (index === -1) return;
      state.roundtables[index] = action.payload;
    },
    deleteRoundtable(state, action) {
      state.roundtables = state.roundtables.filter((r) => r.id !== action.payload);
    },
  },
});

export const { loadRoundtables, addRoundtable, updateRoundtable, deleteRoundtable } = roundtableSlice.actions;
export default roundtableSlice.reducer;
