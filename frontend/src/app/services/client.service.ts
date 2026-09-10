import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { selectAllClients, selectClientById } from '../store/client/client.selectors';
import * as ClientActions from '../store/client/client.actions';
import { firstValueFrom } from 'rxjs';

export interface Client {
    id: number;
    name: string;
    abbreviation: string;
    parentClient: string;
    peerGroups: string;
    roundtables: string;
    projects: string;
    domains: string[];
    identityProvider: string;
    active: boolean;
    selfDatabase: boolean;
    status: string; // 'Active' or 'Inactive'

    // Raw selection data retained for edit mode
    peerGroupIds?: any[];
    roundtableIds?: any[];
    projectIds?: any[];
}

@Injectable({
    providedIn: 'root'
})
export class ClientService {
    private store = inject(Store<AppState>);
    private http = inject(HttpClient);

    readonly clients$ = this.store.select(selectAllClients);

    async loadClients(): Promise<void> {
        try {
            const clients = await firstValueFrom(
                this.http.get<Client[]>('/api/clients')
            );
            this.store.dispatch(ClientActions.loadClients({ clients }));
        } catch (error) {
            console.error('Failed to load clients from API', error);
        }
    }

    getClients(): Client[] {
        let clients: Client[] = [];
        this.store.select(selectAllClients).subscribe(c => clients = c).unsubscribe();
        return clients;
    }

    async addClient(client: Client): Promise<void> {
        try {
            const created = await firstValueFrom(
                this.http.post<Client>('/api/clients', client)
            );
            this.store.dispatch(ClientActions.addClient({ client: created }));
        } catch (error) {
            console.error('Failed to add client', error);
            // Fallback for mock backend
            const newClient = { ...client, id: Date.now() };
            this.store.dispatch(ClientActions.addClient({ client: newClient }));
        }
    }

    getClientById(id: number): Client | undefined {
        let client: Client | undefined;
        this.store.select(selectClientById(id)).subscribe(c => client = c).unsubscribe();
        return client;
    }

    async updateClient(updatedClient: Client): Promise<void> {
        try {
            const saved = await firstValueFrom(
                this.http.put<Client>(`/api/clients/${updatedClient.id}`, updatedClient)
            );
            this.store.dispatch(ClientActions.updateClient({ client: saved }));
        } catch (error) {
            console.error('Failed to update client', error);
            this.store.dispatch(ClientActions.updateClient({ client: updatedClient }));
        }
    }

    async deleteClient(id: number): Promise<void> {
        try {
            await firstValueFrom(this.http.delete(`/api/clients/${id}`));
            this.store.dispatch(ClientActions.deleteClient({ id }));
        } catch (error) {
            console.error('Failed to delete client', error);
            this.store.dispatch(ClientActions.deleteClient({ id }));
        }
    }
}
