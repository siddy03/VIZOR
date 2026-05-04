import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { selectTitle } from '../store/layout/layout.selectors';
import * as LayoutActions from '../store/layout/layout.actions';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private store = inject(Store<AppState>);

  // Expose title as a Signal backed by NgRx store
  public readonly title = toSignal(this.store.select(selectTitle), { initialValue: 'Home' });

  setTitle(title: string) {
    this.store.dispatch(LayoutActions.setTitle({ title }));
  }
}
