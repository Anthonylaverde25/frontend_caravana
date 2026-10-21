import { Box, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { DyingAnimal } from './registerDeath';

interface RegisterDeathAnimalsListProps {
	animals: DyingAnimal[];
	errors: Record<number, string[]>;
}

/** The animals of the load by their label; one the server objected to shows why. */
export function RegisterDeathAnimalsList({ animals, errors }: RegisterDeathAnimalsListProps) {
	return (
		<Box sx={{ border: 1, borderColor: 'divider', borderRadius: '6px', maxHeight: 200, overflow: 'auto' }}>
			{animals.map((animal, index) => {
				const messages = errors[animal.id] ?? [];

				return (
					<Stack
						key={animal.id}
						direction="row"
						spacing={1}
						alignItems="flex-start"
						sx={{
							px: 1.5,
							py: 1,
							borderTop: index === 0 ? 0 : 1,
							borderColor: 'divider',
							bgcolor: messages.length > 0 ? 'error.light' : 'transparent'
						}}
					>
						<FuseSvgIcon
							size={16}
							sx={{ mt: 0.25, color: messages.length > 0 ? 'error.main' : 'text.secondary' }}
						>
							{messages.length > 0 ? 'heroicons-outline:exclamation-triangle' : 'heroicons-outline:tag'}
						</FuseSvgIcon>
						<Box>
							<Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}>
								{animal.label}
							</Typography>
							{messages.map((message) => (
								<Typography
									key={message}
									variant="caption"
									sx={{ display: 'block', color: 'error.dark' }}
								>
									{message}
								</Typography>
							))}
						</Box>
					</Stack>
				);
			})}
		</Box>
	);
}

export default RegisterDeathAnimalsList;
