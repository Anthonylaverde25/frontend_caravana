import { useRef } from 'react';
import { Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface ReadFromImageButtonProps {
	onPick: (file: File) => void;
	disabled?: boolean;
}

/** "Leer desde imagen": a photo, scan or PDF of the provider's paper. */
export default function ReadFromImageButton({ onPick, disabled }: ReadFromImageButtonProps) {
	const input = useRef<HTMLInputElement>(null);

	return (
		<>
			<Button
				variant="outlined"
				color="primary"
				onClick={() => input.current?.click()}
				disabled={disabled}
				startIcon={<FuseSvgIcon size={18}>heroicons-outline:document-magnifying-glass</FuseSvgIcon>}
				sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '6px' }}
			>
				Leer desde imagen
			</Button>
			<input
				ref={input}
				type="file"
				hidden
				accept="image/png,image/jpeg,image/webp,image/avif,application/pdf"
				onChange={(e) => {
					const picked = e.target.files?.[0];
					e.target.value = '';

					if (picked) onPick(picked);
				}}
			/>
		</>
	);
}
