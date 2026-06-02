import { TableRow, TableCell, Box, Typography, TextField, MenuItem, IconButton, Divider } from '@mui/material';
import { Controller, Control, UseFormRegister } from 'react-hook-form';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTheme } from '@mui/material/styles';

interface Breed {
	id: number;
	name: string;
}

interface Caravan {
	id: number;
	identification: string;
	category?: string | null;
	sex?: string;
	active_gestation?: {
		id: number;
		gestation_stage?: string;
		sires?: { id: number; identification: string; is_confirmed?: boolean }[];
	} | null;
}

interface BulkBirthRowProps {
	index: number;
	fieldId: string;
	control: Control<any>;
	register: UseFormRegister<any>;
	errors: any;
	watchedRow: any;
	caravans: any[];
	breeds: Breed[];
	maleCaravans: any[];
	onRemove: () => void;
	fieldsLength: number;
	isDark: boolean;
	zebraBg: string;
	headerBg: string;
}

const SEX_OPTIONS = [
	{ value: 'M', label: 'Macho' },
	{ value: 'H', label: 'Hembra' }
];

const getStageLabel = (stage?: string) => {
	switch (stage) {
		case 'head':
			return 'Cabeza';
		case 'body':
			return 'Cuerpo';
		case 'tail':
			return 'Cola';
		default:
			return '-';
	}
};

export default function BulkBirthRow({
	index,
	fieldId,
	control,
	register,
	errors,
	watchedRow,
	caravans,
	breeds,
	maleCaravans,
	onRemove,
	fieldsLength,
	isDark,
	zebraBg,
	headerBg
}: BulkBirthRowProps) {
	const theme = useTheme();
	const focusBorder = theme.palette.primary.main;

	const cellStyle = {
		p: 0,
		borderRight: 1,
		borderBottom: 1,
		borderColor: theme.palette.divider,
		'&:last-child': { borderRight: 0 }
	};

	const inputSx = {
		'& .MuiInputBase-root': {
			borderRadius: 0,
			fontSize: '0.875rem',
			backgroundColor: 'transparent',
			height: '40px',
			color: theme.palette.text.primary,
			'&:hover': {
				backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
			},
			'&.Mui-focused': {
				backgroundColor: theme.palette.background.paper,
				boxShadow: `inset 0 0 0 2px ${focusBorder}`,
				zIndex: 1
			},
			'&.Mui-error': {
				boxShadow: `inset 0 0 0 2px ${theme.palette.error.main}`
			}
		},
		'& .MuiOutlinedInput-notchedOutline': {
			border: 'none'
		},
		'& input': {
			padding: '8px 12px'
		}
	};

	const motherId = watchedRow?.mother_id;
	const mother = caravans.find((c) => c.id === Number(motherId));
	const gestationSires = mother?.active_gestation?.sires || [];

	return (
		<TableRow
			key={fieldId}
			sx={{ '&:nth-of-type(even)': { bgcolor: zebraBg } }}
		>
			{/* 1. Index */}
			<TableCell
				align="center"
				sx={{ ...cellStyle, bgcolor: headerBg, color: theme.palette.text.disabled, fontSize: '0.75rem' }}
			>
				{index + 1}
			</TableCell>

			{/* 2. Mother Caravan Identifier */}
			<TableCell sx={cellStyle}>
				<Box
					sx={{
						px: 2,
						py: 1,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						minHeight: '40px'
					}}
				>
					<input
						type="hidden"
						{...register(`births.${index}.mother_id` as const)}
					/>
					<Typography
						sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', color: 'primary.main' }}
					>
						{mother ? mother.identification : '-'}
					</Typography>
					{mother?.active_gestation?.gestation_stage && (
						<Typography
							variant="caption"
							sx={{ color: 'text.secondary', fontSize: '0.65rem' }}
						>
							({mother.category || 'Vientre'}) - Est:{' '}
							{getStageLabel(mother.active_gestation.gestation_stage)}
						</Typography>
					)}
				</Box>
			</TableCell>

			{/* 3. Calf Identifier Input */}
			<TableCell sx={cellStyle}>
				<TextField
					{...register(`births.${index}.calf_identification` as const)}
					fullWidth
					variant="outlined"
					placeholder="ID Ternero"
					error={!!errors.births?.[index]?.calf_identification}
					sx={inputSx}
				/>
			</TableCell>

			{/* 4. Calf Sex Selection */}
			<TableCell sx={cellStyle}>
				<Controller
					control={control}
					name={`births.${index}.calf_sex` as const}
					render={({ field: controllerField }) => (
						<TextField
							select
							fullWidth
							variant="outlined"
							sx={inputSx}
							{...controllerField}
						>
							{SEX_OPTIONS.map((option) => (
								<MenuItem
									key={option.value}
									value={option.value}
								>
									{option.label}
								</MenuItem>
							))}
						</TextField>
					)}
				/>
			</TableCell>

			{/* 5. Calf Weight Input */}
			<TableCell sx={cellStyle}>
				<Controller
					control={control}
					name={`births.${index}.calf_weight` as const}
					render={({ field: controllerField }) => (
						<TextField
							fullWidth
							variant="outlined"
							type="number"
							placeholder="0.00"
							error={!!errors.births?.[index]?.calf_weight}
							sx={{ ...inputSx, '& input': { textAlign: 'right' } }}
							value={controllerField.value ?? ''}
							onChange={(e) => {
								const val = e.target.value === '' ? null : parseFloat(e.target.value);
								controllerField.onChange(val);
							}}
						/>
					)}
				/>
			</TableCell>

			{/* 6. Calf Breed Selection */}
			<TableCell sx={cellStyle}>
				<Controller
					control={control}
					name={`births.${index}.calf_breed_id` as const}
					render={({ field: controllerField }) => (
						<TextField
							select
							fullWidth
							variant="outlined"
							sx={inputSx}
							{...controllerField}
						>
							<MenuItem value="">
								<em>-- Seleccionar Raza --</em>
							</MenuItem>
							{breeds.map((breed) => (
								<MenuItem
									key={breed.id}
									value={breed.id}
								>
									{breed.name}
								</MenuItem>
							))}
						</TextField>
					)}
				/>
			</TableCell>

			{/* 7. Calf Teeth Input */}
			<TableCell sx={cellStyle}>
				<Controller
					control={control}
					name={`births.${index}.calf_teeth` as const}
					render={({ field: controllerField }) => (
						<TextField
							fullWidth
							variant="outlined"
							type="number"
							placeholder="0"
							error={!!errors.births?.[index]?.calf_teeth}
							sx={{ ...inputSx, '& input': { textAlign: 'right' } }}
							value={controllerField.value ?? ''}
							onChange={(e) => {
								const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
								controllerField.onChange(val);
							}}
						/>
					)}
				/>
			</TableCell>

			{/* 8. Sire (Father) Selection */}
			<TableCell sx={cellStyle}>
				<Controller
					control={control}
					name={`births.${index}.father_id` as const}
					render={({ field: controllerField }) => {
						if (gestationSires.length === 1) {
							const singleSire = gestationSires[0];
							return (
								<TextField
									fullWidth
									variant="outlined"
									disabled
									value={`Único: ${singleSire.identification}`}
									sx={{
										...inputSx,
										'& .MuiInputBase-root.Mui-disabled': {
											backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f1f3f4',
											color: theme.palette.text.secondary,
											fontWeight: 700,
											cursor: 'not-allowed'
										}
									}}
								/>
							);
						}

						return (
							<TextField
								select
								fullWidth
								variant="outlined"
								sx={inputSx}
								{...controllerField}
							>
								<MenuItem value="">
									<em>-- Desconocido / Sin esp. --</em>
								</MenuItem>
								{gestationSires.map((s) => (
									<MenuItem
										key={`sug-${s.id}`}
										value={s.id}
									>
										⭐ Sugerido: {s.identification}
									</MenuItem>
								))}
								{gestationSires.length > 0 && <Divider />}
								{maleCaravans
									.filter((male) => !gestationSires.some((gs) => gs.id === male.id))
									.map((male) => (
										<MenuItem
											key={male.id}
											value={male.id}
										>
											{male.identification}
										</MenuItem>
									))}
							</TextField>
						);
					}}
				/>
			</TableCell>

			{/* 9. Birth Date Input */}
			<TableCell sx={cellStyle}>
				<TextField
					{...register(`births.${index}.birth_date` as const)}
					fullWidth
					variant="outlined"
					type="date"
					error={!!errors.births?.[index]?.birth_date}
					sx={inputSx}
				/>
			</TableCell>

			{/* 10. Actions Column */}
			<TableCell
				align="center"
				sx={{ ...cellStyle, borderRight: 0 }}
			>
				<IconButton
					size="small"
					onClick={onRemove}
					disabled={fieldsLength === 1}
					sx={{ color: theme.palette.text.disabled, '&:hover': { color: theme.palette.error.main } }}
				>
					<FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</TableCell>
		</TableRow>
	);
}
