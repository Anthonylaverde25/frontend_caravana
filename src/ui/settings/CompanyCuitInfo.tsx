import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { Company } from '@/contexts/CompanyContext';
import { formatCuit } from '@/core/shared/domain/cuit';
import CompanyCuitDialog from './CompanyCuitDialog';

/** "CUIT: …" in the company strip of Settings, with the action to load or change it. */
export default function CompanyCuitInfo({ company }: { company: Company | undefined }) {
	const [open, setOpen] = useState(false);

	if (!company) return null;

	return (
		<Stack
			direction="row"
			spacing={1}
			alignItems="center"
		>
			<Typography
				variant="caption"
				sx={{ color: '#64748b', fontWeight: 800 }}
			>
				CUIT:
			</Typography>
			{company.cuit ? (
				<Typography
					variant="body2"
					sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#1e293b' }}
				>
					{formatCuit(company.cuit)}
				</Typography>
			) : (
				<Typography
					variant="body2"
					sx={{ fontWeight: 600, color: '#B26A00' }}
				>
					sin cargar
				</Typography>
			)}
			<Button
				size="small"
				onClick={() => setOpen(true)}
				sx={{ textTransform: 'none', fontWeight: 700, minWidth: 0, px: 1 }}
			>
				{company.cuit ? 'Cambiar' : 'Cargar CUIT'}
			</Button>
			<CompanyCuitDialog
				open={open}
				onClose={() => setOpen(false)}
				companyName={company.name}
				cuit={company.cuit ?? null}
			/>
		</Stack>
	);
}
