import { I18nManager } from 'react-native';

// ============================================================================
// RTL Utility Helpers
// ============================================================================

/**
 * A collection of RTL-aware utilities to avoid repeating
 * direction logic across components.
 *
 * Usage:
 *   import { rtl } from '@/lib/rtl-utils';
 *
 *   style={{ transform: [{ translateX: rtl.flipX(100) }] }}
 *   style={rtl.mirrorIcon()}
 *   const icon = rtl.select('arrow-right', 'arrow-left');
 */
export const rtl = {
  /** Whether the current layout direction is RTL */
  get isRTL(): boolean {
    return I18nManager.isRTL;
  },

  /**
   * Flip a translateX value for RTL.
   * Positive values slide right in LTR, left in RTL.
   */
  flipX(value: number): number {
    return I18nManager.isRTL ? -value : value;
  },

  /**
   * Returns a transform style that mirrors an element horizontally in RTL.
   * Useful for directional icons (chevrons, arrows).
   */
  mirrorIcon(): { transform: { scaleX: number }[] } {
    return { transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] };
  },

  /**
   * Pick a value based on current text direction.
   *
   * @example
   *   rtl.select('en-font', 'ar-font')
   *   rtl.select('left', 'right')
   */
  select<T>(ltrValue: T, rtlValue: T): T {
    return I18nManager.isRTL ? rtlValue : ltrValue;
  },
};

// ============================================================================
// Font helpers
// ============================================================================

const FONT_MAP = {
  ar: { regular: 'Cairo_400Regular', bold: 'Cairo_700Bold' },
  en: { regular: 'Lato_400Regular', bold: 'Lato_700Bold' },
} as const;

type FontWeight = 'regular' | 'bold';
type FontLanguage = keyof typeof FONT_MAP;

/**
 * Returns the correct font family string for the given language + weight.
 *
 * @example
 *   const font = getLocalizedFont('ar', 'bold'); // "Cairo_700Bold"
 */
export function getLocalizedFont(
  lang: FontLanguage,
  weight: FontWeight = 'regular',
): string {
  return FONT_MAP[lang]?.[weight] ?? FONT_MAP.ar[weight];
}
