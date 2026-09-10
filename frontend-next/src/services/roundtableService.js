import { api } from '@/lib/api';
import { store } from '@/store';
import {
  loadRoundtables as loadRoundtablesAction,
  addRoundtable as addRoundtableAction,
  updateRoundtable as updateRoundtableAction,
  deleteRoundtable as deleteRoundtableAction,
} from '@/store/roundtableSlice';

export async function loadRoundtables() {
  try {
    const { data } = await api.get('/api/roundtables');
    store.dispatch(loadRoundtablesAction(data));
  } catch (error) {
    console.error('Failed to load roundtables from API', error);
  }
}

export function getRoundtables() {
  return store.getState().roundtable.roundtables;
}

export async function addRoundtable(roundtable) {
  try {
    const { data } = await api.post('/api/roundtables', roundtable);
    store.dispatch(addRoundtableAction(data));
  } catch (error) {
    console.error('Failed to add roundtable', error);
    store.dispatch(addRoundtableAction(roundtable));
  }
}

export function getRoundtableById(id) {
  return store.getState().roundtable.roundtables.find((r) => r.id === id);
}

export async function updateRoundtable(updatedRoundtable) {
  try {
    const { data } = await api.put(`/api/roundtables/${updatedRoundtable.id}`, updatedRoundtable);
    store.dispatch(updateRoundtableAction(data));
  } catch (error) {
    console.error('Failed to update roundtable', error);
    store.dispatch(updateRoundtableAction(updatedRoundtable));
  }
}

export async function deleteRoundtable(id) {
  try {
    await api.delete(`/api/roundtables/${id}`);
    store.dispatch(deleteRoundtableAction(id));
    return true;
  } catch (error) {
    console.error(`Failed to delete roundtable ${id}`, error);
    return false;
  }
}
