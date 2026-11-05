import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { AssistantResponse, TableBlock } from '@/core/assistant/domain/AssistantTypes';
import BlockRenderer from '../blocks/BlockRenderer';
import SourceBadge from '../SourceBadge';
import { canonicalizeBlocks } from '../answerBlocks';
import { exportDatasetToCsv, exportDatasetToPdf } from '../../utils/exportDataset';

interface AnswerCanvasProps {
	question: string | null;
	response: AssistantResponse;
	at: string;
}

/** The selected answer at full width: the question it answers, export shortcuts, then every block in large size. */
export function AnswerCanvas({ question, response, at }: AnswerCanvasProps) {
	const tableBlock = response.blocks.find((b): b is TableBlock => b.type === 'table');
	const orderedBlocks = useMemo(() => canonicalizeBlocks(response.blocks), [response.blocks]);

	return (
		<Box sx={{ height: '100%', overflowY: 'auto', p: { xs: 2, md: 3 } }}>
			<Box sx={{ maxWidth: 1100, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				<Box
					sx={{
						borderBottom: 1,
						borderColor: 'divider',
						pb: 1.5,
						display: 'flex',
						flexDirection: { xs: 'column', sm: 'row' },
						alignItems: { xs: 'flex-start', sm: 'center' },
						justifyContent: 'space-between',
						gap: 1.5
					}}
				>
					<Box>
						{question && (
							<Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
								{question}
							</Typography>
						)}
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
							<SourceBadge grounded={response.grounded} />
							<Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>{at}</Typography>
						</Box>
					</Box>

					{tableBlock && (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
							<Tooltip title="Descargar datos como planilla (Excel / CSV UTF-8)">
								<Button
									size="small"
									variant="outlined"
									onClick={() => exportDatasetToCsv(tableBlock)}
									startIcon={<FuseSvgIcon size={15}>heroicons-outline:table-cells</FuseSvgIcon>}
									sx={{
										fontSize: '0.75rem',
										textTransform: 'none',
										py: 0.5,
										px: 1.25,
										borderColor: 'divider',
										color: 'text.primary',
										'&:hover': { borderColor: 'primary.main', color: 'primary.main' }
									}}
								>
									Exportar Excel
								</Button>
							</Tooltip>

							<Tooltip title="Descargar informe como documento PDF">
								<Button
									size="small"
									variant="outlined"
									onClick={() => exportDatasetToPdf(tableBlock)}
									startIcon={<FuseSvgIcon size={15}>heroicons-outline:document-text</FuseSvgIcon>}
									sx={{
										fontSize: '0.75rem',
										textTransform: 'none',
										py: 0.5,
										px: 1.25,
										borderColor: 'divider',
										color: 'text.primary',
										'&:hover': { borderColor: 'primary.main', color: 'primary.main' }
									}}
								>
									Exportar PDF
								</Button>
							</Tooltip>
						</Box>
					)}
				</Box>

				{orderedBlocks.map((block, index) => (
					<BlockRenderer
						key={index}
						block={block}
						size="full"
					/>
				))}
			</Box>
		</Box>
	);
}

export default AnswerCanvas;
