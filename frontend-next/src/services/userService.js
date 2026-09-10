import { api } from '@/lib/api';
import { store } from '@/store';
import {
  loadUsers as loadUsersAction,
  addUser as addUserAction,
  updateUser as updateUserAction,
  deleteUser as deleteUserAction,
  loadUserRequests as loadUserRequestsAction,
  deleteUserRequest as deleteUserRequestAction,
} from '@/store/userSlice';

export async function loadUsers() {
  try {
    const { data } = await api.get('/api/users');
    store.dispatch(loadUsersAction(data));
  } catch (error) {
    console.error('Failed to load users from API', error);
  }
}

export function getUsers() {
  return store.getState().user.users;
}

export function getUserById(id) {
  return store.getState().user.users.find((u) => u.id === id);
}

export async function addUser(user) {
  try {
    const { data } = await api.post('/api/users', user);
    store.dispatch(addUserAction(data));
    return data;
  } catch (error) {
    console.error('Failed to add user', error);
    return null;
  }
}

export async function updateUser(updatedUser) {
  try {
    const { data } = await api.put(`/api/users/${updatedUser.id}`, updatedUser);
    store.dispatch(updateUserAction(data));
    return data;
  } catch (error) {
    console.error('Failed to update user', error);
    return null;
  }
}

export async function deleteUser(id) {
  try {
    await api.delete(`/api/users/${id}`);
    store.dispatch(deleteUserAction(id));
    return true;
  } catch (error) {
    console.error(`Failed to delete user ${id}`, error);
    return false;
  }
}

export async function loadUserRequests() {
  try {
    const { data } = await api.get('/api/user-requests');
    store.dispatch(loadUserRequestsAction(data));
  } catch (error) {
    console.error('Failed to load user requests from API', error);
  }
}

export async function deleteUserRequest(id) {
  try {
    await api.delete(`/api/user-requests/${id}`);
    store.dispatch(deleteUserRequestAction(id));
    return true;
  } catch (error) {
    console.error(`Failed to delete user request ${id}`, error);
    return false;
  }
}
