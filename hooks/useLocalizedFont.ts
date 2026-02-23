import { useMemo } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedFont } from '@/lib/rtl-utils';

type FontWeight = 'regular' | 'bold';

/**
 * React hook that returns the correct font family for the current language.
 *
 * @example
 *   const fontFamily = useLocalizedFont('bold');
 *   <Text style={{ fontFamily }}>Hello</Text>
 */
export function useLocalizedFont(weight: FontWeight = 'regular'): string {
  const { language } = useLanguage();
  return useMemo(
    () => getLocalizedFont(language, weight),
    [language, weight],
  );
}
