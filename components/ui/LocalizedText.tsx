import React from 'react';
import { Text, TextProps, I18nManager } from 'react-native';
import { getLocalizedFont } from '@/lib/rtl-utils';

interface LocalizedTextProps extends TextProps {
  bold?: boolean;
}

/**
 * A Text component that automatically applies the correct font family
 * based on the current app language (Arabic: Cairo, English: Lato).
 *
 * Usage:
 *   <LocalizedText bold>Hello World</LocalizedText>
 */
export const LocalizedText = ({ style, bold, ...props }: LocalizedTextProps) => {
  const currentLang = I18nManager.isRTL ? 'ar' : 'en';
  const fontFamily = getLocalizedFont(currentLang, bold ? 'bold' : 'regular');

  return <Text style={[{ fontFamily }, style]} {...props} />;
};
