"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { cookieManager } from "@/lib/cookieManager";

interface ProvidersProps {
  children: React.ReactNode;
}
export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    const checkGuestSession = () => {
      // Ensure guest session ID exists for non-authenticated users
      // This prevents "Unauthorized or missing Session ID" errors from the backend
      if (!cookieManager.isAuthenticated() && !cookieManager.getGuestSessionId()) {
        const newSessionId = 'sess_' + Date.now() + Math.random().toString(36).substring(2, 9);
        cookieManager.setGuestSessionId(newSessionId);
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
      <Toaster />
    </Provider>
  );
}
