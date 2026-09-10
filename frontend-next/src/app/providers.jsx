'use client';

import React, { useEffect, useRef } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PrimeReactProvider } from 'primereact/api';
import { Toast } from 'primereact/toast';
import { store } from '@/store';
import { AuthProvider } from '@/context/AuthContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { setToastRef } from '@/lib/toast';

export function Providers({ children }) {
  const toastRef = useRef(null);

  useEffect(() => {
    setToastRef(toastRef.current);
    return () => setToastRef(null);
  }, []);

  return (
    <ReduxProvider store={store}>
      <PrimeReactProvider>
        <AuthProvider>
          <LayoutProvider>
            {/* Global Toast Notifications Container (mirrors <p-toast>) */}
            <Toast ref={toastRef} />
            {children}
          </LayoutProvider>
        </AuthProvider>
      </PrimeReactProvider>
    </ReduxProvider>
  );
}
