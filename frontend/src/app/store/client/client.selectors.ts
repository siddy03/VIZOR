import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ClientState } from './client.reducer';
import { AppState } from '../app.state';

export const selectClientState = (state: AppState) => state.client;

export const selectAllClients = createSelector(
    selectClientState,
    (state: ClientState) => state.clients
);

export const selectClientById = (id: number) => createSelector(
    selectAllClients,
    (clients) => clients.find(c => c.id === id)
);
