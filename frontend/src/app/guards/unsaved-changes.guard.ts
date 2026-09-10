import { CanDeactivateFn } from '@angular/router';

export const unsavedChangesGuard: CanDeactivateFn<any> = (component) => {
  return window.confirm('You have unsaved changes! Are you sure you want to leave this page?');
};
