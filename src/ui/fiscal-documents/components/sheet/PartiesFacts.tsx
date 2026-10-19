import { Box, Chip, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCompany } from '@/contexts/CompanyContext';

interface PartiesFactsProps {
	cuit: string | null;
	location: string | null;
}

/**
 * SAP Fiori Object Header Facet: Supplier & Recipient metadata.
 */
export default function PartiesFacts({ cuit, location }: PartiesFactsProps) {
	const { activeCompanyId, companies } = useCompany();
	const company = companies.find((c) => c.id === activeCompanyId);

	return (
		<Stack spacing={0.75}>
			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
				flexWrap="wrap"
				useFlexGap
			>
				{cuit ? (
					<Chip
						size="small"
						label={`CUIT: ${cuit}`}
						sx={{
							fontFamily: 'monospace',
							fontWeight: 600,
							fontSize: '0.72rem',
							height: 22,
							bgcolor: 'background.paper',
							border: 1,
							borderColor: 'divider'
						}}
					/>
				) : (
					<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
						CUIT no registrado
					</Typography>
				)}
				{location && (
					<Stack
						direction="row"
						spacing={0.5}
						alignItems="center"
						sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
					>
						<FuseSvgIcon size={14}>heroicons-outline:map-pin</FuseSvgIcon>
						<Typography sx={{ fontSize: 'inherit' }}>{location}</Typography>
					</Stack>
				)}
			</Stack>

			<Box sx={{ borderTop: 1, borderColor: 'divider', pt: 0.5 }}>
				<Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
					Receptor:{' '}
					<Box
						component="strong"
						sx={{ color: 'text.primary', fontWeight: 600 }}
					>
						{company?.name ?? '—'}
					</Box>
					{company?.renspa ? ` · RENSPA ${company.renspa}` : ''}
				</Typography>
			</Box>
		</Stack>
	);
}
