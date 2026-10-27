import { Button, Stack } from '@mui/material';
import { Link } from 'react-router';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import WorkTemplateGalleryView from '@/ui/work-templates/views/WorkTemplateGalleryView';
import SettingsSection from '../SettingsSection';

/**
 * WorkTemplatesSection
 * Embeds the Zootechnical Work Templates Library directly within the /settings panel.
 */
export default function WorkTemplatesSection() {
	return (
		<SettingsSection
			id="work-templates"
			actions={
				<Stack direction="row" spacing={1.5}>
					<Button
						variant="contained"
						component={Link}
						to="/work-templates/scan"
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:camera</FuseSvgIcon>}
						sx={{
							bgcolor: '#6366f1',
							borderRadius: '8px',
							px: 2.5,
							fontWeight: 700,
							textTransform: 'none',
							boxShadow: 'none',
							'&:hover': { bgcolor: '#4f46e5', boxShadow: 'none' }
						}}
					>
						Escanear con AI
					</Button>
				</Stack>
			}
		>
			<WorkTemplateGalleryView embedded />
		</SettingsSection>
	);
}
