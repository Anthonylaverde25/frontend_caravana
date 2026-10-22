import Link from '@mui/material/Link';

interface EntityCellLinkProps {
	text: string;
	onOpen: () => void;
}

/** A cell value that opens its record's detail: a real button styled as a link, so it is keyboard reachable. */
export function EntityCellLink({ text, onOpen }: EntityCellLinkProps) {
	return (
		<Link
			component="button"
			type="button"
			underline="hover"
			onClick={onOpen}
			sx={{
				font: 'inherit',
				fontWeight: 'inherit',
				color: 'primary.main',
				textAlign: 'left',
				verticalAlign: 'baseline'
			}}
		>
			{text}
		</Link>
	);
}

export default EntityCellLink;
