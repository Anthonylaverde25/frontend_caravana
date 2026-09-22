import { Alert, Box, MenuItem, TextField, Typography } from '@mui/material';
import { BatchTypeCode, BoardScope } from '../../../types/dashboard.types';
import { BATCH_TYPE_SCOPE_OPTIONS, CAMPAIGN_OPTIONS } from '../../../registry/boardTemplates';

const ALL_BATCH_TYPES = 'ALL';

interface BoardScopeFieldsProps {
	scope: BoardScope;
	onChange: (scope: BoardScope) => void;
}

/** Default scope of the board. Widgets inherit it and only ask for what it leaves undefined. */
export function BoardScopeFields({ scope, onChange }: BoardScopeFieldsProps) {
	const selectedType = BATCH_TYPE_SCOPE_OPTIONS.find((o) => o.value === scope.batchTypeCode);
	const filled = { '& .MuiFilledInput-root': { bgcolor: 'action.hover' } };

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
			<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>Alcance por defecto</Typography>
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
				<TextField
					select
					fullWidth
					variant="filled"
					label="Campaña"
					value={scope.campaign}
					onChange={(e) => onChange({ ...scope, campaign: e.target.value })}
					sx={filled}
				>
					{CAMPAIGN_OPTIONS.map((c) => (
						<MenuItem
							key={c}
							value={c}
						>
							{c}
						</MenuItem>
					))}
				</TextField>
				<TextField
					select
					fullWidth
					variant="filled"
					label="Tipo de lote"
					value={scope.batchTypeCode ?? ALL_BATCH_TYPES}
					onChange={(e) =>
						onChange({
							...scope,
							batchTypeCode: e.target.value === ALL_BATCH_TYPES ? null : (e.target.value as BatchTypeCode)
						})
					}
					helperText={selectedType?.helper ?? 'Todo el establecimiento'}
					sx={filled}
				>
					<MenuItem value={ALL_BATCH_TYPES}>Todos los tipos de lote</MenuItem>
					{BATCH_TYPE_SCOPE_OPTIONS.map((o) => (
						<MenuItem
							key={o.value}
							value={o.value}
						>
							{o.label}
						</MenuItem>
					))}
				</TextField>
			</Box>
			<Alert
				severity="info"
				sx={{ fontSize: '0.8rem', py: 0.5 }}
			>
				Todos los widgets del tablero heredan este alcance. Al agregar un widget sólo se pide lo que el tablero
				no define.
			</Alert>
		</Box>
	);
}

export default BoardScopeFields;
