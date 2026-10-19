import { Button, Chip, Stack, Typography } from '@mui/material';
import { WarehouseStock } from '@/core/stock/domain/entities/ItemStock';

interface WarehouseStockCardHeaderProps {
	warehouse: WarehouseStock['warehouse'];
	onTransfer: () => void;
	onCount: () => void;
}

const ACTION_SX = { textTransform: 'none', fontWeight: 600, borderRadius: '6px' } as const;

/**
 * The warehouse of a card and what can be done there. An inactive one keeps "Contar" (DD9) and
 * "Transferir" to empty it (DD4).
 */
export default function WarehouseStockCardHeader({ warehouse, onTransfer, onCount }: WarehouseStockCardHeaderProps) {
	return (
		<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
			<Stack direction="row" spacing={1} alignItems="center">
				<Typography sx={{ fontWeight: 700 }}>
					{warehouse.code ? `${warehouse.code} · ` : ''}
					{warehouse.name}
				</Typography>
				{!warehouse.isActive && <Chip size="small" label="Inactivo" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />}
			</Stack>
			<Stack direction="row" spacing={1}>
				<Button size="small" onClick={onTransfer} sx={ACTION_SX}>
					Transferir
				</Button>
				<Button size="small" variant="outlined" onClick={onCount} sx={ACTION_SX}>
					Contar
				</Button>
			</Stack>
		</Stack>
	);
}
