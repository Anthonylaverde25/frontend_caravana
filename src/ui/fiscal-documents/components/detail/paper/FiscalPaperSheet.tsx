import { Box } from '@mui/material';
import { FiscalDocumentDetail } from '@/core/fiscal/domain/entities/FiscalDocument';
import { formatDate } from '@/core/stock/domain/rules/quantityFormat';
import FiscalPaperHeader from './FiscalPaperHeader';
import FiscalPaperItems from './FiscalPaperItems';
import FiscalPaperTotals from './FiscalPaperTotals';
import { paperBoxSx, paperTextSx } from './paperStyles';

/**
 * The registered document drawn as the provider's paper (lienzo: FiscalDocumentDetail): its boxed
 * sections, the lines, and the totals at the foot, inside the same frame as the register's grid. A
 * voided one carries its stamp.
 */
export default function FiscalPaperSheet({ document: d }: { document: FiscalDocumentDetail }) {
	return (
		<Box
			component="article"
			aria-label="Comprobante"
			sx={{
				position: 'relative',
				width: '100%',
				maxWidth: '800px', // Standard A4 document width proportion (~210mm)
				minHeight: { xs: 'auto', sm: 1060, md: 1120 }, // Standard A4 document height (~297mm)
				mx: 'auto',
				boxSizing: 'border-box',
				bgcolor: '#FFFFFF',
				color: '#111827',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: '3px',
				boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
				p: { xs: 2.5, sm: 4, md: 5 },
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
				overflow: 'hidden',
				'@media print': {
					maxWidth: 'none',
					minHeight: 'auto',
					boxShadow: 'none',
					border: 'none',
					p: 0,
					m: 0
				}
			}}
		>
			{d.status === 'VOIDED' && (
				<Box
					aria-hidden
					sx={{
						position: 'absolute',
						top: 90,
						right: -40,
						transform: 'rotate(18deg)',
						border: '3px solid',
						borderColor: 'error.main',
						color: 'error.main',
						px: 6,
						py: 0.5,
						fontWeight: 900,
						fontSize: '1.4rem',
						letterSpacing: '0.2em',
						opacity: 0.55
					}}
				>
					ANULADO
				</Box>
			)}
			<FiscalPaperHeader document={d} />
			<FiscalPaperItems document={d} />
			<Box sx={{ flex: 1, minHeight: 32 }} />
			{d.linesAmount !== null && <FiscalPaperTotals document={d} />}
			<Box component="section" sx={{ ...paperBoxSx, ...paperTextSx, p: '8px 14px', color: '#4B5563' }}>
				Cargado desde el papel del proveedor el {formatDate(d.createdAt)}
				{d.createdBy ? ` por ${d.createdBy}` : ''}. {d.notes ? `Notas: ${d.notes}` : 'Sin notas.'}
			</Box>
		</Box>
	);
}
