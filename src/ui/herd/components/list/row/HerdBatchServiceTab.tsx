import { ButtonBase, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

import { SERVICE_COLOR } from '../../../utils/herdFormat';

interface HerdBatchServiceTabProps {
	code: string;
	onOpen?: () => void;
}

/** "EN SERVICIO · code" sitting on the top border of a batch under service. */
export function HerdBatchServiceTab({ code, onOpen }: HerdBatchServiceTabProps) {
	return (
		<Tooltip title={onOpen ? 'Ver orden de servicio' : `Servicio ${code} sobre este lote`}>
			<ButtonBase
				onClick={onOpen}
				disabled={!onOpen}
				sx={{
					position: 'absolute',
					top: -11,
					left: 64,
					zIndex: 2,
					height: 22,
					px: 1.25,
					gap: 0.75,
					borderRadius: '6px',
					bgcolor: SERVICE_COLOR,
					color: '#FFFFFF',
					boxShadow: '0 1px 2px rgba(16,24,40,.18)',
					'&.Mui-disabled': { color: '#FFFFFF' }
				}}
			>
				<FuseSvgIcon size={12}>heroicons-outline:fire</FuseSvgIcon>
				<Typography
					component="span"
					sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em' }}
				>
					EN SERVICIO
				</Typography>
				<Typography
					component="span"
					aria-hidden="true"
					sx={{ fontSize: '0.68rem', opacity: 0.55 }}
				>
					·
				</Typography>
				<Typography
					component="span"
					sx={{ fontSize: '0.68rem', fontFamily: 'monospace', fontWeight: 600 }}
				>
					{code}
				</Typography>
			</ButtonBase>
		</Tooltip>
	);
}

export default HerdBatchServiceTab;
