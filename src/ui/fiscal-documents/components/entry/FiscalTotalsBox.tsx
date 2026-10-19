import { useState } from 'react';
import { Alert, Box, Button, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { type Dec, dec, sub } from '@/core/stock/domain/rules/decimal';
import { formatMoney } from '@/core/stock/domain/rules/quantityFormat';
import { SummaryRow } from '@/core/fiscal/domain/rules/fiscalPreview';
import { filledInputProps } from '@/ui/weaning-orders/components/form/formStyles';
import { totalsBoxSx } from '../sheet/sheetStyles';

interface FiscalTotalsBoxProps {
	net: Dec;
	rows: SummaryRow[];
	total: Dec;
	declaredTotal: string;
	onDeclaredTotal: (value: string) => void;
	error?: string;
	/** A delivery note has no total on its paper (DC14): no control against it. */
	controlsTotal: boolean;
	notes?: string;
	onOpenNotes?: () => void;
	onClearNotes?: () => void;
}

const subtleBtnSx = {
	textTransform: 'none',
	fontSize: '0.78rem',
	fontWeight: 600,
	color: 'text.secondary',
	bgcolor: (theme: any) =>
		theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
	border: 1,
	borderColor: 'divider',
	borderRadius: '6px',
	px: 1.25,
	py: 0.6,
	boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
	transition: 'all 0.15s ease-in-out',
	display: 'inline-flex',
	alignItems: 'center',
	gap: 0.75,
	'&:hover': {
		color: 'text.primary',
		bgcolor: (theme: any) =>
			theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.09)',
		borderColor: 'text.secondary'
	}
};

const Line = ({ label, value }: { label: string; value: string }) => (
	<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', py: 0.25 }}>
		<Typography component="dt" sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
			{label}
		</Typography>
		<Typography
			component="dd"
			sx={{
				m: 0,
				fontSize: '0.85rem',
				fontWeight: 600,
				textAlign: 'right',
				whiteSpace: 'nowrap',
				fontVariantNumeric: 'tabular-nums',
				color: 'text.primary'
			}}
		>
			{value}
		</Typography>
	</Box>
);

/**
 * The totals as the paper prints them, and the total copied from the paper to control the load
 * (DS19). The issuer rounds VAT per rate, not per line: up to one peso is the same total.
 */
export default function FiscalTotalsBox({
	net,
	rows,
	total,
	declaredTotal,
	onDeclaredTotal,
	error,
	controlsTotal,
	notes,
	onOpenNotes,
	onClearNotes
}: FiscalTotalsBoxProps) {
	const declared = dec(declaredTotal);
	const difference = declared === null ? null : sub(declared, total);
	const onePeso = dec('1') ?? 0n;
	const matches = difference !== null && difference >= -onePeso && difference <= onePeso;

	const [showDeclaredInput, setShowDeclaredInput] = useState(Boolean(declaredTotal));
	const isDeclaredOpen = showDeclaredInput || Boolean(declaredTotal);

	return (
		<Box sx={totalsBoxSx}>
			<Box
				component="dl"
				sx={{
					m: 0,
					display: 'flex',
					flexDirection: 'column',
					gap: 0.5
				}}
			>
				<Line label="Importe neto" value={formatMoney(net)} />
				{rows.map((r) => (
					<Line key={r.label} label={r.label} value={formatMoney(r.amount)} />
				))}
			</Box>

			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="baseline"
				sx={{ borderTop: 1, borderColor: 'divider', pt: 1.25 }}
			>
				<Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: 'text.primary' }}>
					Total
				</Typography>
				<Typography
					sx={{
						fontWeight: 800,
						fontSize: '1.25rem',
						whiteSpace: 'nowrap',
						fontVariantNumeric: 'tabular-nums',
						color: 'text.primary'
					}}
				>
					{formatMoney(total)}
				</Typography>
			</Stack>

			{/* Optional features area: Control de total del papel & Nota interna */}
			{(controlsTotal || onOpenNotes) && (
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						gap: 1.25,
						borderTop: '1px dashed',
						borderColor: 'divider',
						pt: 1.25
					}}
				>
					{/* Inactive button triggers row */}
					{((!isDeclaredOpen && controlsTotal) || (!notes && onOpenNotes)) && (
						<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
							{!isDeclaredOpen && controlsTotal && (
								<Button
									size="small"
									variant="text"
									onClick={() => setShowDeclaredInput(true)}
									startIcon={<FuseSvgIcon size={14}>heroicons-outline:scale</FuseSvgIcon>}
									sx={subtleBtnSx}
								>
									+ Total del papel
								</Button>
							)}
							{!notes && onOpenNotes && (
								<Button
									size="small"
									variant="text"
									onClick={onOpenNotes}
									startIcon={<FuseSvgIcon size={14}>heroicons-outline:document-text</FuseSvgIcon>}
									sx={subtleBtnSx}
								>
									+ Nota interna
								</Button>
							)}
						</Stack>
					)}

					{/* Active Paper Total Control Card */}
					{controlsTotal && isDeclaredOpen && (
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								gap: 1.25,
								bgcolor: 'background.paper',
								p: 1.25,
								borderRadius: '6px',
								border: 1,
								borderColor: 'divider'
							}}
						>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Stack direction="row" spacing={0.75} alignItems="center">
									<FuseSvgIcon size={14}>heroicons-outline:scale</FuseSvgIcon>
									<Typography
										sx={{
											fontSize: '0.68rem',
											fontWeight: 800,
											color: 'text.secondary',
											textTransform: 'uppercase',
											letterSpacing: '0.04em'
										}}
									>
										Control con total del papel
									</Typography>
								</Stack>
								<Tooltip title="Cerrar control">
									<IconButton
										size="small"
										aria-label="Cerrar control de total"
										onClick={() => {
											onDeclaredTotal('');
											setShowDeclaredInput(false);
										}}
										sx={{
											color: 'text.secondary',
											bgcolor: (theme) =>
												theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
											border: 1,
											borderColor: 'divider',
											borderRadius: '6px',
											width: 24,
											height: 24,
											p: 0,
											boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
											transition: 'all 0.15s ease-in-out',
											'&:hover': {
												color: 'error.main',
												bgcolor: (theme) => alpha(theme.palette.error.main, 0.12),
												borderColor: (theme) => alpha(theme.palette.error.main, 0.35)
											}
										}}
									>
										<FuseSvgIcon size={12}>heroicons-outline:x-mark</FuseSvgIcon>
									</IconButton>
								</Tooltip>
							</Box>

							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: 'minmax(0, 1fr) 140px',
									gap: 1.25,
									alignItems: 'center'
								}}
							>
								<Typography sx={{ fontSize: '0.74rem', color: 'text.secondary', lineHeight: 1.3 }}>
									Copiá el total del papel para verificar la carga.
								</Typography>
								<TextField
									autoFocus
									label="Total del papel"
									variant="filled"
									size="small"
									value={declaredTotal}
									InputProps={filledInputProps}
									placeholder="0,00"
									inputProps={{
										inputMode: 'decimal',
										style: { textAlign: 'right', fontWeight: 700, fontSize: '0.85rem' }
									}}
									onChange={(e) => onDeclaredTotal(e.target.value)}
									error={!!error}
									helperText={error}
								/>
							</Box>

							{difference !== null && (
								<Alert
									severity={matches ? 'success' : 'warning'}
									icon={
										<FuseSvgIcon size={16}>
											{matches ? 'heroicons-outline:check-circle' : 'heroicons-outline:exclamation-triangle'}
										</FuseSvgIcon>
									}
									sx={{
										fontSize: '0.76rem',
										py: 0.25,
										px: 1,
										borderRadius: '6px',
										'& .MuiAlert-message': { fontWeight: 500 }
									}}
								>
									{matches
										? 'Coincide con el total calculado.'
										: `Difiere en ${formatMoney(difference)} del total del papel. Se puede registrar igual.`}
								</Alert>
							)}
						</Box>
					)}

					{/* Active Internal Note Card */}
					{onOpenNotes && notes && (
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								gap: 0.5,
								bgcolor: 'background.paper',
								p: 1.25,
								borderRadius: '6px',
								border: 1,
								borderColor: 'divider'
							}}
						>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Stack direction="row" spacing={0.75} alignItems="center">
									<FuseSvgIcon size={14}>heroicons-outline:document-text</FuseSvgIcon>
									<Typography
										sx={{
											fontSize: '0.68rem',
											fontWeight: 800,
											color: 'text.secondary',
											textTransform: 'uppercase',
											letterSpacing: '0.04em'
										}}
									>
										Nota interna
									</Typography>
								</Stack>
								<Stack direction="row" spacing={0.5}>
									<IconButton
										size="small"
										onClick={onOpenNotes}
										aria-label="Editar nota"
										sx={{ p: 0.25, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
									>
										<FuseSvgIcon size={13}>heroicons-outline:pencil</FuseSvgIcon>
									</IconButton>
									{onClearNotes && (
										<IconButton
											size="small"
											onClick={onClearNotes}
											aria-label="Eliminar nota"
											sx={{ p: 0.25, color: 'text.secondary', '&:hover': { color: 'error.main' } }}
										>
											<FuseSvgIcon size={13}>heroicons-outline:trash</FuseSvgIcon>
										</IconButton>
									)}
								</Stack>
							</Box>
							<Typography sx={{ fontSize: '0.78rem', color: 'text.primary', whiteSpace: 'pre-wrap' }}>
								{notes}
							</Typography>
						</Box>
					)}
				</Box>
			)}
		</Box>
	);
}
