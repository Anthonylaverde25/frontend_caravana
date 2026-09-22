/**
 * Data-visualization palette for the dashboard.
 * Surfaces and text come from the MUI theme; these tokens only color data marks and status.
 */
export const DASHBOARD_COLORS = {
	accent: '#1F5C45',
	accentMid: '#6FA088',
	accentLight: '#C9DCCF',
	band: '#CFE3D6',
	track: '#ECEBE5',
	neutral: '#C9C6BB',
	neutralDark: '#6B706C',
	ochre: '#C98A1E',
	ochreLine: '#B26B00',
	danger: '#A3201A',
	info: '#6C8FB8',
	ink: '#1A1D1B'
} as const;

export type StatusTone = 'ok' | 'warn' | 'bad' | 'info' | 'neutral';

interface ToneColors {
	fg: string;
	bg: string;
}

const LIGHT_TONES: Record<StatusTone, ToneColors> = {
	ok: { fg: '#17613B', bg: '#E3F1E8' },
	warn: { fg: '#834700', bg: '#FBEFD9' },
	bad: { fg: '#A3201A', bg: '#FBE4E1' },
	info: { fg: '#244E7A', bg: '#E4ECF5' },
	neutral: { fg: '#434843', bg: '#ECEBE5' }
};

const DARK_TONES: Record<StatusTone, ToneColors> = {
	ok: { fg: '#8FD4AE', bg: 'rgba(143, 212, 174, 0.14)' },
	warn: { fg: '#F2C27A', bg: 'rgba(242, 194, 122, 0.14)' },
	bad: { fg: '#F29B91', bg: 'rgba(242, 155, 145, 0.14)' },
	info: { fg: '#9DBFE6', bg: 'rgba(157, 191, 230, 0.14)' },
	neutral: { fg: '#C9CCC7', bg: 'rgba(201, 204, 199, 0.12)' }
};

export function toneColors(tone: StatusTone, isDark: boolean): ToneColors {
	return (isDark ? DARK_TONES : LIGHT_TONES)[tone];
}

/** Text color for a delta: green means favorable, not "went up". */
export function deltaColor(favorable: boolean | null, isDark: boolean): string {
	if (favorable === null) return isDark ? '#C9CCC7' : '#4A504C';

	return toneColors(favorable ? 'ok' : 'bad', isDark).fg;
}
