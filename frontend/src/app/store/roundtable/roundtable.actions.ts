import { createAction, props } from '@ngrx/store';
import { Roundtable } from '../../services/roundtable.service';

export const loadRoundtables = createAction(
    '[Roundtable] Load Roundtables',
    props<{ roundtables: Roundtable[] }>()
);

export const addRoundtable = createAction(
    '[Roundtable] Add Roundtable',
    props<{ roundtable: Roundtable }>()
);

export const updateRoundtable = createAction(
    '[Roundtable] Update Roundtable',
    props<{ roundtable: Roundtable }>()
);
