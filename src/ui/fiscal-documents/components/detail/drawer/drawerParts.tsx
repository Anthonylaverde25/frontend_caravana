import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';
import { Box, Typography } from '@mui/material';

const labelSx = { m: 0, fontSize: '0.69rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6B7280' } as const;

/** A section of the drawer: small uppercase title and what it holds (lienzo: .drw-s). */
export const DrawerBlock = ({ title, children }: { title?: string; children: ReactNode }) => (
	<Box component="section" sx={{ px: 2.5, py: 2, borderBottom: '1px solid #F1F2F4', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
		{title && <Typography component="h3" sx={labelSx}>{title}</Typography>}
		{children}
	</Box>
);

/** The grey band at the top of a tab: its headline amount, big, and its breakdown (lienzo: .drw-total). */
export const DrawerTotal = ({ label, value, tone, children }: { label: string; value: string; tone?: string; children?: ReactNode }) => (
	<Box sx={{ px: 2.5, py: 2, bgcolor: '#F8F9FA', borderBottom: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
		<Typography sx={{ ...labelSx, fontSize: '0.72rem', letterSpacing: '0.04em', color: '#4B5563' }}>{label}</Typography>
		<Typography sx={{ fontSize: '1.62rem', fontWeight: 800, whiteSpace: 'nowrap', color: tone }}>{value}</Typography>
		{children && <Box sx={{ mt: 0.75 }}>{children}</Box>}
	</Box>
);

/** Label on the left, value on the right (lienzo: dl.pr). */
export const Facts = ({ rows }: { rows: { term: string; value: ReactNode; strong?: boolean }[] }) => (
	<Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'max-content minmax(0, 1fr)', columnGap: 2, rowGap: '9px', fontSize: '0.8rem', lineHeight: 1.35 }}>
		{rows.map((r, i) => (
			<Box key={`${r.term}-${i}`} sx={{ display: 'contents' }}>
				<Typography component="dt" sx={{ fontSize: 'inherit', color: '#6B7280', whiteSpace: 'nowrap' }}>{r.term}</Typography>
				<Typography component="dd" sx={{ m: 0, fontSize: 'inherit', textAlign: 'right', fontWeight: r.strong ? 800 : 400, minWidth: 0 }}>{r.value}</Typography>
			</Box>
		))}
	</Box>
);

/** A linked document as a small card: its label, and a caption and amount below (lienzo: a.lnk). */
export const LinkCard = ({ to, title, caption, amount }: { to: string; title: ReactNode; caption?: string; amount?: string }) => (
	<Box component={RouterLink} to={to} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 1.5, py: 1.25, border: 1, borderColor: 'divider', borderRadius: '6px', textDecoration: 'none', color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}>
		<Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0D47A1' }}>{title}</Typography>
		{(caption || amount) && (
			<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, fontSize: '0.72rem', color: 'text.secondary' }}>
				<span>{caption}</span>
				{amount && <Box component="span" sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'text.primary' }}>{amount}</Box>}
			</Box>
		)}
	</Box>
);
