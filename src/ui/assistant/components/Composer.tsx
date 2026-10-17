import { useState, type KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const MAX_LENGTH = 4000;

interface ComposerProps {
	disabled: boolean;
	onSend: (text: string) => void;
}

/** The question box: Enter sends, Shift+Enter breaks the line. */
export function Composer({ disabled, onSend }: ComposerProps) {
	const [value, setValue] = useState('');

	const send = () => {
		const text = value.trim();

		if (!text || disabled) return;

		onSend(text);
		setValue('');
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			send();
		}
	};

	return (
		<Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
			<TextField
				fullWidth
				multiline
				maxRows={4}
				variant="filled"
				hiddenLabel
				size="small"
				placeholder="Preguntale a XIMON…"
				value={value}
				onChange={(event) => setValue(event.target.value.slice(0, MAX_LENGTH))}
				onKeyDown={handleKeyDown}
				sx={{
					'& .MuiFilledInput-root': { bgcolor: 'action.hover', borderRadius: '8px', fontSize: '0.875rem' }
				}}
				slotProps={{
					input: {
						disableUnderline: true,
						endAdornment: (
							<InputAdornment position="end">
								<IconButton
									color="primary"
									size="small"
									onClick={send}
									disabled={disabled || !value.trim()}
									aria-label="Enviar"
								>
									<FuseSvgIcon size={18}>heroicons-outline:paper-airplane</FuseSvgIcon>
								</IconButton>
							</InputAdornment>
						)
					}
				}}
			/>
			<Typography
				sx={{ display: 'block', textAlign: 'center', color: 'text.secondary', fontSize: '0.65rem', mt: 1 }}
			>
				XIMON responde con los registros del establecimiento y solo consulta: no modifica datos.
			</Typography>
		</Box>
	);
}

export default Composer;
