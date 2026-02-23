"use client";

import { Provider } from "react-redux";
import { store } from "./store";
// import { Toaster } from "@/components/ui/sonner";
import Toast from 'react-native-toast-message';

import { useEffect } from "react";
import { authStorage } from "@/lib/authStorage";

interface ProvidersProps {
  children: React.ReactNode;
}
export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    const checkGuestSession = async () => {
      // Ensure guest session ID exists for non-authenticated users
      // This prevents "Unauthorized or missing Session ID" errors from the backend
      const isAuth = await authStorage.isAuthenticated();
      if (!isAuth) {
        await authStorage.ensureGuestSessionId();
      }
    };

    // Check on mount
    checkGuestSession();

    // Check on auth changes (e.g. logout)
    window.addEventListener('authChange', checkGuestSession);
    return () => window.removeEventListener('authChange', checkGuestSession);
  }, []);

  return (
    <Provider store={store}>
      {children}
      <Toast />
    </Provider>
  );
}
