import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { deltaColor } from '../../theme/dashboardTokens';

interface DeltaProps {
	text: string;
	/** true = good for the business, false = bad, null = no judgement. Independent of the sign. */
	favorable: boolean | null;
}

export function Delta({ text, favorable }: DeltaProps) {
	const theme = useTheme();

	return (
		<Box
			component="span"
			sx={{
				color: deltaColor(favorable, theme.palette.mode === 'dark'),
				fontWeight: 600,
				fontVariantNumeric: 'tabular-nums'
			}}
		>
			{text}
		</Box>
	);
}

export default Delta;
