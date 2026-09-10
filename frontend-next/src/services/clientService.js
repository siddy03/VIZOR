import { api } from '@/lib/api';
import { store } from '@/store';
import {
  loadClients as loadClientsAction,
  addClient as addClientAction,
  updateClient as updateClientAction,
  deleteClient as deleteClientAction,
} from '@/store/clientSlice';

export async function loadClients() {
  try {
    const { data } = await api.get('/api/clients');
    store.dispatch(loadClientsAction(data));
  } catch (error) {
    console.error('Failed to load clients from API', error);
  }
}

export function getClients() {
  return store.getState().client.clients;
}

export async function addClient(client) {
  try {
    const { data } = await api.post('/api/clients', client);
    store.dispatch(addClientAction(data));
  } catch (error) {
    console.error('Failed to add client', error);
    // Fallback for mock backend
    store.dispatch(addClientAction({ ...client, id: Date.now() }));
  }
}

export function getClientById(id) {
  return store.getState().client.clients.find((c) => c.id === id);
}

export async function updateClient(updatedClient) {
  try {
    const { data } = await api.put(`/api/clients/${updatedClient.id}`, updatedClient);
    store.dispatch(updateClientAction(data));
  } catch (error) {
    console.error('Failed to update client', error);
    store.dispatch(updateClientAction(updatedClient));
  }
}

export async function deleteClient(id) {
  try {
    await api.delete(`/api/clients/${id}`);
    store.dispatch(deleteClientAction(id));
  } catch (error) {
    console.error('Failed to delete client', error);
    store.dispatch(deleteClientAction(id));
  }
}
