import React from 'react';
import { Box, TableCell, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface PathogenColumnHeaderProps {
  name: string;
  code: string;
  isDisqualifying: boolean;
}

/**
 * A disqualifying agent is flagged in the header so the operator understands, before typing,
 * that marking a positive here culls the bull from the entore.
 */
export const PathogenColumnHeader: React.FC<PathogenColumnHeaderProps> = ({
  name,
  code,
  isDisqualifying,
}) => (
  <TableCell align="center" sx={{ minWidth: 150 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 700 }}>
        {name}
      </Typography>
      {isDisqualifying && (
        <Tooltip title="Patógeno descalificante: un positivo bloquea al reproductor para el entore.">
          <Box sx={{ display: 'flex', color: 'error.main' }}>
            <FuseSvgIcon size={14}>heroicons-outline:exclamation-triangle</FuseSvgIcon>
          </Box>
        </Tooltip>
      )}
    </Box>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
      {code}
    </Typography>
  </TableCell>
);

export default PathogenColumnHeader;
