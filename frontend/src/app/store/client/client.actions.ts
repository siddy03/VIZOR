import { createAction, props } from '@ngrx/store';
import { Client } from '../../services/client.service';

export const loadClients = createAction(
    '[Client] Load Clients',
    props<{ clients: Client[] }>()
);

export const addClient = createAction(
    '[Client] Add Client',
    props<{ client: Client }>()
);

export const updateClient = createAction(
    '[Client] Update Client',
    props<{ client: Client }>()
);

export const deleteClient = createAction(
    '[Client] Delete Client',
    props<{ id: number }>()
);
