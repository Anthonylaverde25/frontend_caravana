import React, { useState } from 'react';
import { Alert, Button, Stack, Typography } from '@mui/material';
import TagCalvesDialog from '@/ui/herd/components/tag-calves/TagCalvesDialog';
import type { CalfBatchGroup } from './useCalvesByBatch';

interface WeaningUntaggedCalvesNoticeProps {
	groups: CalfBatchGroup[];
}

/**
 * Weaning parts the calf from its mother: from then on only its tag tells it apart. The calves
 * still without one are not offered; each batch with any gets a "Caravanear" right here.
 */
export const WeaningUntaggedCalvesNotice: React.FC<WeaningUntaggedCalvesNoticeProps> = ({ groups }) => {
	const [tagging, setTagging] = useState<{ id: number; name: string } | null>(null);
	const pending = groups.filter((group) => group.untagged.length > 0 && group.batchId != null);

	if (pending.length === 0) return null;

	return (
		<>
			<Alert
				severity="warning"
				sx={{ borderRadius: '6px', '& .MuiAlert-message': { width: '100%' } }}
			>
				<Typography sx={{ fontSize: '0.82rem', fontWeight: 600, mb: 0.5 }}>
					Crías sin caravana: no se pueden destetar hasta caravanearlas.
				</Typography>
				<Stack spacing={0.5}>
					{pending.map((group) => (
						<Stack
							key={group.key}
							direction="row"
							spacing={1}
							alignItems="center"
							justifyContent="space-between"
						>
							<Typography sx={{ fontSize: '0.8rem' }}>
								{`${group.name}: ${group.untagged.length} cría(s)`}
							</Typography>
							<Button
								size="small"
								onClick={() => setTagging({ id: group.batchId as number, name: group.name })}
								sx={{ textTransform: 'none', fontWeight: 700 }}
							>
								Caravanear
							</Button>
						</Stack>
					))}
				</Stack>
			</Alert>
			{tagging && (
				<TagCalvesDialog
					open
					onClose={() => setTagging(null)}
					batch={tagging}
				/>
			)}
		</>
	);
};

export default WeaningUntaggedCalvesNotice;
