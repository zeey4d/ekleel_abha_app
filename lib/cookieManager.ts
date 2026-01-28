import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';

export const cookieManager = {
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
};

export default cookieManager;
