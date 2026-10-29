import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { ExitLoadForm } from '../../hooks/useExitLoadForm';
import { formatMoney } from '../exitOrderFormat';
import ExitPricingFields from './ExitPricingFields';

interface ExitPricingDialogProps {
	open: boolean;
	form: ExitLoadForm;
	onClose: () => void;
}

/**
 * The price of the load in its own dialog, so the sheet stays on the animals: how the sale was
 * charged, or the $/kg agreed when the order is issued. Changes apply as they are typed; the
 * invoice behind it follows.
 */
export const ExitPricingDialog: React.FC<ExitPricingDialogProps> = ({ open, form, onClose }) => {
	const agreement = form.mode === 'issue';

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="md"
			PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
		>
			<Box
				sx={{
					p: 2,
					px: 3,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderBottom: 1,
					borderColor: 'divider'
				}}
			>
				<Typography
					variant="h6"
					sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
				>
					{agreement ? 'Precio pactado (opcional)' : '¿Cómo se cobró?'}
				</Typography>
				<IconButton
					onClick={onClose}
					size="small"
					sx={{ color: 'primary.main' }}
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			<DialogContent sx={{ p: 3 }}>
				<ExitPricingFields
					inDialog
					pricing={form.pricing}
					onChange={form.setPricing}
					balance={form.balance}
					agreement={agreement}
				/>
			</DialogContent>
			<DialogActions
				sx={{
					p: 2,
					px: 3,
					bgcolor: 'background.default',
					borderTop: 1,
					borderColor: 'divider',
					display: 'flex',
					justifyContent: 'space-between'
				}}
			>
				<Typography
					variant="body2"
					sx={{ fontWeight: 700 }}
				>
					{form.totals.amount > 0 ? `Total ${formatMoney(form.totals.amount)}` : 'Sin importe'}
				</Typography>
				<Button
					onClick={onClose}
					variant="contained"
					sx={{
						bgcolor: 'primary.main',
						color: 'primary.contrastText',
						px: 3.5,
						fontWeight: 700,
						borderRadius: '6px',
						textTransform: 'none',
						boxShadow: 'none',
						'&:hover': { bgcolor: 'primary.dark' }
					}}
				>
					Listo
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ExitPricingDialog;
