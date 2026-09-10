import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  userRequests: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loadUsers(state, action) {
      state.users = action.payload;
    },
    addUser(state, action) {
      state.users.push(action.payload);
    },
    updateUser(state, action) {
      state.users = state.users.map((u) =>
        u.id === action.payload.id ? action.payload : u
      );
    },
    deleteUser(state, action) {
      state.users = state.users.filter((u) => u.id !== action.payload);
    },
    loadUserRequests(state, action) {
      state.userRequests = action.payload;
    },
    deleteUserRequest(state, action) {
      state.userRequests = state.userRequests.filter((r) => r.id !== action.payload);
    },
  },
});

export const {
  loadUsers,
  addUser,
  updateUser,
  deleteUser,
  loadUserRequests,
  deleteUserRequest,
} = userSlice.actions;
export default userSlice.reducer;
