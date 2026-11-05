import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { BatchAlert, BatchAlertSeverity } from '@/core/batches/domain/entities/BatchOverview';
import SanitaryExposureAlertDialog from '@/ui/gestation/components/sanitary-exposure/SanitaryExposureAlertDialog';
import { orderLink } from '../../../utils/herdFormat';

const SEVERITY: Record<BatchAlertSeverity, { icon: string; color: string }> = {
	error: { icon: 'heroicons-outline:exclamation-circle', color: 'error.main' },
	warning: { icon: 'heroicons-outline:exclamation-triangle', color: 'warning.dark' },
	info: { icon: 'heroicons-outline:information-circle', color: 'text.secondary' }
};

const linkSx = { p: 0, minWidth: 0, fontWeight: 600, textTransform: 'none', whiteSpace: 'nowrap' } as const;

interface HerdBatchNoveltiesProps {
	alerts: BatchAlert[];
	onShowAll: () => void;
}

/**
 * What most needs attention in the batch (the server sorts them), in one line under the figures.
 * The rest wait in their tab. With nothing pending the line is not there at all.
 */
export function HerdBatchNovelties({ alerts, onShowAll }: HerdBatchNoveltiesProps) {
	const navigate = useNavigate();
	// A sanitary exposure is not an order: it opens its own dialog in place.
	const [exposureAlertId, setExposureAlertId] = useState<number | null>(null);
	const alert = alerts[0];

	if (!alert) return null;

	const isExposure = alert.link?.kind === 'sanitary_exposure_alert';
	const target = alert.link && !isExposure ? orderLink(alert.link.kind, alert.link.id) : null;
	const open = isExposure ? () => setExposureAlertId(alert.link!.id) : target ? () => navigate(target) : null;
	const severity = SEVERITY[alert.severity];
	const others = alerts.length - 1;

	return (
		<Box
			sx={{
				display: 'flex',
				flexWrap: 'wrap',
				alignItems: 'center',
				columnGap: 1.25,
				rowGap: 0.5,
				px: { xs: 2.5, md: 3.5 },
				py: 1.25
			}}
		>
			<FuseSvgIcon
				size={18}
				sx={{ color: severity.color, flexShrink: 0 }}
			>
				{severity.icon}
			</FuseSvgIcon>
			<Typography sx={{ flex: '1 1 200px', minWidth: 0, fontSize: '0.8125rem' }}>{alert.message}</Typography>
			{others > 0 && (
				<Button
					variant="text"
					size="small"
					onClick={onShowAll}
					sx={linkSx}
				>
					{`Ver ${others} ${others === 1 ? 'novedad más' : 'novedades más'}`}
				</Button>
			)}
			{open && (
				<Button
					variant="text"
					size="small"
					onClick={open}
					sx={linkSx}
				>
					{alert.link?.code ?? 'Ver'}
				</Button>
			)}
			<SanitaryExposureAlertDialog
				alertId={exposureAlertId}
				onClose={() => setExposureAlertId(null)}
			/>
		</Box>
	);
}

export default HerdBatchNovelties;
