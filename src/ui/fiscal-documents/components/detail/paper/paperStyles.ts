/**
 * Tokens of the paper drawn in the detail (lienzo: FiscalDocumentDetail): boxed sections with the
 * heavy rule of a printed invoice, 12 px body.
 */
export const INK = '#1F232B';

export const paperBoxSx = { border: `1.5px solid ${INK}` } as const;

export const paperTextSx = { fontSize: '0.75rem', lineHeight: 1.55, color: '#111827' } as const;
