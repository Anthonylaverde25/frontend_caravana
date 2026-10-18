import { Chip, Stack } from '@mui/material';

interface SupplierRoleChipsProps {
	suppliesLivestock?: boolean;
	suppliesItems?: boolean;
}

/** What a provider sells: "Hacienda", "Artículos y servicios" or both. */
export default function SupplierRoleChips({ suppliesLivestock, suppliesItems }: SupplierRoleChipsProps) {
	return (
		<Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap" useFlexGap>
			{suppliesLivestock && <Chip label="Hacienda" size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }} />}
			{suppliesItems && (
				<Chip label="Artículos y servicios" size="small" variant="outlined" color="info" sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
			)}
		</Stack>
	);
}
