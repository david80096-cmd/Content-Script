'use client';

import { ReactNode } from 'react';
import { AuthProvider, AuthGuard } from '@/src/components/AuthGuard';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        {children}
        <Toaster position="top-right" />
      </AuthGuard>
    </AuthProvider>
  );
}
