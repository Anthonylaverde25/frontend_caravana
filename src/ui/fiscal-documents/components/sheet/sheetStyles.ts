import { Theme } from '@mui/material/styles';

/**
 * Tokens of the provider-document sheet (lienzo: FiscalDocumentEditor, FiscalDocumentDetail): a white
 * page without cards, sections split by a hairline, small uppercase labels.
 */
export const sheetLabelSx = {
	m: 0,
	fontSize: '0.75rem',
	fontWeight: 800,
	letterSpacing: '0.04em',
	textTransform: 'uppercase',
	color: 'text.secondary'
} as const;

export const sheetSectionSx = {
	'& + &': { borderTop: 1, borderColor: 'divider', pt: 2.75 }
} as const;

/** Subtle low-intensity surface background shared between provider card and totals summary. */
export const sheetSubtleBg = (theme: Theme) =>
	theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';

/** The totals box: modern SAP Fiori financial summary panel. */
export const totalsBoxSx = {
	p: 2.5,
	bgcolor: sheetSubtleBg,
	border: 1,
	borderColor: 'divider',
	borderRadius: '8px',
	display: 'flex',
	flexDirection: 'column',
	gap: 1.75
} as const;
