import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  clients: [],
};

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    loadClients(state, action) {
      state.clients = action.payload;
    },
    addClient(state, action) {
      state.clients.push(action.payload);
    },
    updateClient(state, action) {
      state.clients = state.clients.map((c) =>
        c.id === action.payload.id ? action.payload : c
      );
    },
    deleteClient(state, action) {
      state.clients = state.clients.filter((c) => c.id !== action.payload);
    },
  },
});

export const { loadClients, addClient, updateClient, deleteClient } = clientSlice.actions;
export default clientSlice.reducer;


//mkdir -p app/dashboard
//touch app/dashboard/page.tsx


//mkdir -p app/dashboard/users
//touch app/dashboard/users/page.tsx