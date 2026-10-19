import { useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { FiscalDocumentDetail } from '@/core/fiscal/domain/entities/FiscalDocument';
import SummaryTab from './SummaryTab';
import ImputationTab from './ImputationTab';
import HistoryTab, { historyOf } from './HistoryTab';

type DrawerTab = 'summary' | 'imputation' | 'history';

const TABS: { value: DrawerTab; label: string }[] = [
	{ value: 'summary', label: 'Resumen' },
	{ value: 'imputation', label: 'Imputación' },
	{ value: 'history', label: 'Historial' }
];

/**
 * The side panel of the paper (lienzo: FiscalDocumentDetail), in the same frame as the register's grid.
 * "Actividad" (internal notes, emails, shared links) waits for its logic and is left out.
 */
export default function FiscalDetailDrawer({ document, onHide }: { document: FiscalDocumentDetail; onHide: () => void }) {
	const [tab, setTab] = useState<DrawerTab>('summary');
	const events = historyOf(document).length;

	return (
		<Box
			component="aside"
			aria-label="Detalle del comprobante"
			sx={{
				bgcolor: 'background.paper',
				borderLeft: 1,
				borderColor: 'divider',
				width: { xs: '100%', lg: 380, xl: 400 },
				minWidth: { xs: '100%', lg: 380, xl: 400 },
				maxWidth: { xs: '100%', lg: 380, xl: 400 },
				height: '100%',
				minHeight: 0,
				display: 'flex',
				flexDirection: 'column',
				flexShrink: 0,
				overflow: 'hidden',
				displayPrint: 'none'
			}}
		>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 1.5,
					pl: 2.5,
					pr: 2,
					pt: 2,
					pb: 1.75,
					borderBottom: 1,
					borderColor: 'divider',
					flexShrink: 0
				}}
			>
				<Box>
					<Typography component="h2" sx={{ fontSize: '0.95rem', fontWeight: 700 }}>
						Detalle
					</Typography>
					<Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
						{document.label}
					</Typography>
				</Box>
				<IconButton
					aria-label="Ocultar panel"
					onClick={onHide}
					size="small"
					sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
				>
					<FuseSvgIcon size={18}>heroicons-outline:chevron-double-right</FuseSvgIcon>
				</IconButton>
			</Box>
			<Box
				role="tablist"
				aria-label="Panel"
				sx={{
					display: 'flex',
					px: 1.5,
					borderBottom: 1,
					borderColor: 'divider',
					bgcolor: 'background.paper',
					flexShrink: 0
				}}
			>
				{TABS.map((t) => (
					<Box
						key={t.value}
						component="button"
						type="button"
						role="tab"
						aria-selected={tab === t.value}
						onClick={() => setTab(t.value)}
						sx={{
							height: 42,
							px: 1.25,
							border: 0,
							borderBottom: '2px solid',
							borderColor: tab === t.value ? 'primary.main' : 'transparent',
							bgcolor: 'transparent',
							fontFamily: 'inherit',
							fontSize: '0.82rem',
							fontWeight: tab === t.value ? 700 : 500,
							color: tab === t.value ? 'primary.main' : 'text.secondary',
							cursor: 'pointer',
							display: 'inline-flex',
							alignItems: 'center',
							gap: 0.75,
							whiteSpace: 'nowrap',
							transition: 'color 150ms ease, border-color 150ms ease',
							'&:hover': {
								color: 'text.primary'
							}
						}}
					>
						{t.label}
						{t.value === 'history' && (
							<Box
								component="span"
								sx={{
									fontSize: '0.68rem',
									fontWeight: 700,
									bgcolor: (theme) => (tab === t.value ? theme.palette.primary.light : theme.palette.action.hover),
									color: (theme) => (tab === t.value ? theme.palette.primary.contrastText : theme.palette.text.secondary),
									borderRadius: '10px',
									px: 0.75,
									py: '1px'
								}}
							>
								{events}
							</Box>
						)}
					</Box>
				))}
			</Box>
			<Box
				sx={{
					flex: '1 1 auto',
					overflowY: 'auto',
					minHeight: 0
				}}
			>
				{tab === 'summary' && <SummaryTab document={document} />}
				{tab === 'imputation' && <ImputationTab document={document} />}
				{tab === 'history' && <HistoryTab document={document} />}
			</Box>
		</Box>
	);
}
