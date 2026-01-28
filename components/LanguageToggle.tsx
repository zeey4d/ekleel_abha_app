import React from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Languages } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_STORAGE_KEY = '@app_language';

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = async () => {
    const currentLang = i18n.language;
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    
    try {
      // Save language preference
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      
      // Change language
      await i18n.changeLanguage(newLang);
      
      // Show alert that app needs restart for RTL to take effect
      Alert.alert(
        currentLang === 'ar' ? 'Language Changed' : 'تم تغيير اللغة',
        currentLang === 'ar' 
          ? 'Please restart the app for the changes to take full effect.'
          : 'يرجى إعادة تشغيل التطبيق لتطبيق التغييرات بالكامل.',
        [{ text: currentLang === 'ar' ? 'OK' : 'حسناً' }]
      );
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleLanguage}
      className="flex-row items-center gap-2 rounded-lg bg-primary/10 px-4 py-2"
      activeOpacity={0.7}
    >
      <Icon as={Languages} size={20} className="text-primary" />
      <Text className="text-sm font-semibold text-primary">
        {i18n.language === 'ar' ? 'English' : 'العربية'}
      </Text>
    </TouchableOpacity>
  );
}
