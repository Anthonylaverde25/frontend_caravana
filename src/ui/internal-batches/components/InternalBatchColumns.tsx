import { MRT_ColumnDef } from 'material-react-table';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { Chip, Typography } from '@mui/material';

/**
 * Returns column definitions for Internal Batches DataTable.
 */
export const getInternalBatchColumns = (): MRT_ColumnDef<Batch>[] => [
	{
		accessorKey: 'name',
		header: 'Nombre del Lote',
		size: 200,
		Cell: ({ cell }) => (
			<Typography
				variant="subtitle2"
				sx={{ fontWeight: 600 }}
			>
				{cell.getValue<string>()}
			</Typography>
		),
	},
	{
		accessorKey: 'farm_name',
		header: 'Establecimiento',
		size: 180,
		Cell: ({ cell }) => {
			const val = cell.getValue<string>();
			return val ? (
				<Typography variant="body2">{val}</Typography>
			) : (
				<Chip
					label="INTERNO"
					size="small"
					sx={{
						height: 20,
						fontSize: '0.65rem',
						fontWeight: 700,
						bgcolor: 'action.selected',
						color: 'text.secondary',
						border: 'none',
					}}
				/>
			);
		},
	},
	{
		accessorKey: 'activity_name',
		header: 'Actividad Actual',
		size: 180,
		Cell: ({ cell }) => {
			const val = cell.getValue<string>();
			return val ? (
				<Chip
					label={val.toUpperCase()}
					size="small"
					sx={{
						height: 20,
						fontSize: '0.65rem',
						fontWeight: 700,
						bgcolor: 'primary.light',
						color: 'primary.contrastText',
						border: 'none',
					}}
				/>
			) : (
				<Typography
					variant="caption"
					sx={{ color: 'text.secondary', fontStyle: 'italic' }}
				>
					Sin Actividad
				</Typography>
			);
		},
	},
	{
		accessorKey: 'current_weight',
		header: 'Peso Promedio',
		size: 150,
		Cell: ({ cell }) => {
			const weight = cell.getValue<number>();
			return weight ? (
				<Typography
					variant="subtitle2"
					sx={{ fontWeight: 700, color: 'secondary.main' }}
				>
					{weight} kg/cab
				</Typography>
			) : (
				<Typography
					variant="caption"
					sx={{ color: 'text.secondary', fontStyle: 'italic' }}
				>
					Sin Registro
				</Typography>
			);
		},
	},
	{
		accessorKey: 'is_active',
		header: 'Estado',
		size: 130,
		Cell: ({ cell }) => (
			<Chip
				label={cell.getValue<boolean>() ? 'Activo' : 'Inactivo'}
				size="small"
				color={cell.getValue<boolean>() ? 'success' : 'default'}
				variant="outlined"
				sx={{ fontWeight: 600, fontSize: '0.7rem' }}
			/>
		),
	},
	{
		accessorKey: 'created_at',
		header: 'Fecha de Creación',
		size: 160,
		Cell: ({ cell }) => {
			const val = cell.getValue<string>();
			return val ? (
				<Typography variant="body2">
					{new Date(val).toLocaleDateString()}
				</Typography>
			) : (
				<Typography
					variant="caption"
					sx={{ color: 'text.secondary' }}
				>
					-
				</Typography>
			);
		},
	},
];
