/**
 * Determines if a given hex color is perceptually dark based on standard YIQ luminance.
 */
export const isColorDark = (hexColor?: string | null): boolean => {
  if (!hexColor || !hexColor.startsWith('#')) return false;
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
};

/**
 * Returns a high-contrast accent or surface color given a background.
 */
export const getContrastSurface = (
  isDark: boolean,
  active = false
): {
  bg: string;
  border: string;
  hoverBg: string;
  hoverBorder: string;
  shadow: string;
} => {
  if (isDark) {
    return {
      bg: active ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.08)',
      border: active ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0.22)',
      hoverBg: 'rgba(255, 255, 255, 0.14)',
      hoverBorder: 'rgba(255, 255, 255, 0.45)',
      shadow: '0 2px 5px rgba(0, 0, 0, 0.25)',
    };
  }
  return {
    bg: active ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    border: active ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.18)',
    hoverBg: 'rgba(0, 0, 0, 0.07)',
    hoverBorder: 'rgba(0, 0, 0, 0.35)',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
  };
};
