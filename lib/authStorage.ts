import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';

export const authStorage = {
  getToken: async () => {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },
  // Synchronous fallback for places where a sync value is expected by selectors
  getTokenSync: () => {
    // AsyncStorage is async; return null as a safe default for sync checks.
    return null;
  },
  setToken: async (token: string) => {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },
  removeToken: async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },
  getLocale: () => {
    return i18next.language || 'ar';
  },
  isTokenExpired: () => {
    // Basic placeholder; implement real expiry logic if token contains expiry timestamp
    return false;
  },
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      // Simple check: exists and is a string
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },
  ensureGuestSessionId: async () => {
    try {
      let sessionId = await AsyncStorage.getItem('guest_session_id');
      if (!sessionId) {
        // Generate a simple random session ID if not exists
        sessionId = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        await AsyncStorage.setItem('guest_session_id', sessionId);
      }
      return sessionId;
    } catch (error) {
      console.error('Error ensuring guest session:', error);
      // Return a temporary one in case of error, though it won't persist
      return 'guest_' + Math.random().toString(36).substring(2, 15);
    }
  },
};

export default authStorage;
