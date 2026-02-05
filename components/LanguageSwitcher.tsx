import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { cn } from '@/lib/utils'; // Assuming you have this utility based on global.css presence

const LANGUAGES = [
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'en', label: 'English', dir: 'ltr' },
];

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  const handleLanguageChange = (langCode: string) => {
    if (langCode !== language) {
      changeLanguage(langCode);
    }
  };

  return (
    <View style={styles.container}>
      {LANGUAGES.map((lang) => {
        const isSelected = language === lang.code;
        return (
          <TouchableOpacity
            key={lang.code}
            onPress={() => handleLanguageChange(lang.code)}
            style={[
              styles.option,
              isSelected && styles.optionSelected
            ]}
            activeOpacity={0.7}
          >
           <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
             <Text style={[styles.text, isSelected && styles.textSelected]}>
                {lang.label}
              </Text>
           </View>
            
            {isSelected && (
              <Check size={20} color="#000" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  optionSelected: {
    borderColor: '#000',
    backgroundColor: '#fafafa',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  textSelected: {
    color: '#000',
    fontWeight: '700',
  },
});
