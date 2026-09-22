import { useTheme } from '@mui/material';

/**
 * The colour tokens of the pre-service screens, in one place.
 *
 * The transfer view is read side by side with "Pre-Servicio & Toros" and has to look
 * like the same product: same slate borders, same accents, same tinted chips. Repeating
 * the hexes in every component is how the two screens drift apart.
 */
export interface TransferPalette {
	isDark: boolean;
	active: string;
	success: string;
	warning: string;
	error: string;
	neutral: string;
	female: string;
	male: string;
	cardBg: string;
	cardBorder: string;
	softBg: string;
	softBorder: string;
	rowAlt: string;
	rowSelected: string;
	sapHeader: string;
	sapGreen: string;
	sapGreenHover: string;
	sapEmerald: string;
	sapTeal: string;
	sapSlate: string;
	sapBorder: string;
	sapHighlight: string;
}

export function useTransferPalette(): TransferPalette {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	return {
		isDark,
		active: isDark ? '#60a5fa' : '#0a6ed1',
		success: isDark ? '#34d399' : '#107e3e',
		warning: isDark ? '#fb923c' : '#e6600d',
		error: isDark ? '#f87171' : '#dc2626',
		neutral: isDark ? '#94a3b8' : '#64748b',
		female: isDark ? '#f472b6' : '#be185d',
		male: isDark ? '#60a5fa' : '#0a6ed1',
		cardBg: isDark ? '#1e293b' : '#ffffff',
		cardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
		softBg: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
		softBorder: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
		rowAlt: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
		rowSelected: isDark ? 'rgba(96, 165, 250, 0.12)' : '#eff6ff',
		sapHeader: '#0f382c',
		sapGreen: '#0e5a3c',
		sapGreenHover: '#09432c',
		sapEmerald: '#059669',
		sapTeal: '#0d9488',
		sapSlate: isDark ? '#0f172a' : '#f4f6f8',
		sapBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
		sapHighlight: isDark ? 'rgba(5, 150, 105, 0.15)' : '#e8f5e9'
	};
}

export default useTransferPalette;
