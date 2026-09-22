import { Box, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { BoardTemplateType } from '../../../types/dashboard.types';
import { BOARD_START_OPTIONS } from '../../../registry/boardTemplates';

interface BoardStartPickerProps {
	value: BoardTemplateType;
	onChange: (value: BoardTemplateType) => void;
}

/** Blank board or a copy of a system board. Options that need data the system lacks stay visible but disabled. */
export function BoardStartPicker({ value, onChange }: BoardStartPickerProps) {
	return (
		<Box
			component="fieldset"
			sx={{ border: 0, m: 0, p: 0 }}
		>
			<Typography
				component="legend"
				sx={{ fontSize: '0.8125rem', fontWeight: 600, mb: 1 }}
			>
				Punto de partida
			</Typography>
			<RadioGroup
				value={value}
				onChange={(e) => onChange(e.target.value as BoardTemplateType)}
				sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1.25 }}
			>
				{BOARD_START_OPTIONS.map((option) => {
					const selected = option.value === value;
					const disabled = Boolean(option.disabledReason);

					return (
						<FormControlLabel
							key={option.value}
							value={option.value}
							disabled={disabled}
							control={
								<Radio
									size="small"
									sx={{ mt: -0.5 }}
								/>
							}
							sx={{
								m: 0,
								p: 1.5,
								alignItems: 'flex-start',
								borderRadius: '8px',
								border: selected ? 2 : 1,
								borderColor: selected ? 'primary.main' : 'divider',
								bgcolor: disabled ? 'action.hover' : 'background.paper'
							}}
							label={
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
									<Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
										{option.label}
									</Typography>
									<Typography
										sx={{
											fontSize: '0.75rem',
											color: disabled ? 'warning.dark' : 'text.secondary'
										}}
									>
										{option.disabledReason ?? option.description}
									</Typography>
								</Box>
							}
						/>
					);
				})}
			</RadioGroup>
		</Box>
	);
}

export default BoardStartPicker;
