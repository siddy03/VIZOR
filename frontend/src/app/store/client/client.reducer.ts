import { createReducer, on } from '@ngrx/store';
import { Client } from '../../services/client.service';
import * as ClientActions from './client.actions';

export interface ClientState {
    clients: Client[];
}

export const initialState: ClientState = {
    clients: []
};

export const clientReducer = createReducer(
    initialState,
    on(ClientActions.loadClients, (state, { clients }) => ({
        ...state,
        clients
    })),
    on(ClientActions.addClient, (state, { client }) => ({
        ...state,
        clients: [...state.clients, client]
    })),
    on(ClientActions.updateClient, (state, { client }) => ({
        ...state,
        clients: state.clients.map(c => c.id === client.id ? client : c)
    })),
    on(ClientActions.deleteClient, (state, { id }) => ({
        ...state,
        clients: state.clients.filter(c => c.id !== id)
    }))
);
