// Global toast bridge so non-component code (axios interceptors, services)
// can trigger PrimeReact toasts — mirrors Angular's injectable MessageService.
let toastRef = null;

export function setToastRef(ref) {
  toastRef = ref;
}

export function showToast(message) {
  if (toastRef) {
    toastRef.show(message);
  }
}
