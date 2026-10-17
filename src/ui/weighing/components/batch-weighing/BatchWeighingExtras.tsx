import { useState } from 'react';
import { Box, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SmallDialog } from './SmallDialog';

interface BatchWeighingExtrasProps {
  observations: string;
  onObservationsChange: (value: string) => void;
}

/**
 * The optional observations for the weighing, displayed when present.
 */
export function BatchWeighingExtras({ observations, onObservationsChange }: BatchWeighingExtrasProps) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const openNote = () => {
    setDraft(observations);
    setNoteOpen(true);
  };

  if (!observations) return null;

  return (
    <>
      <Box sx={{ mt: 1, p: 1.25, pl: 1.5, border: 1, borderColor: 'divider', borderRadius: '6px', display: 'flex', gap: 1, alignItems: 'flex-start', bgcolor: 'action.hover' }}>
        <FuseSvgIcon size={16} sx={{ mt: 0.25, color: 'text.secondary' }}>heroicons-outline:chat-bubble-bottom-center-text</FuseSvgIcon>
        <Typography variant="body2" sx={{ flex: 1, whiteSpace: 'pre-wrap' }}>
          {observations}
        </Typography>
        <Tooltip title="Editar">
          <IconButton size="small" onClick={openNote}>
            <FuseSvgIcon size={15}>heroicons-outline:pencil-square</FuseSvgIcon>
          </IconButton>
        </Tooltip>
        <Tooltip title="Quitar">
          <IconButton size="small" onClick={() => onObservationsChange('')}>
            <FuseSvgIcon size={15}>heroicons-outline:trash</FuseSvgIcon>
          </IconButton>
        </Tooltip>
      </Box>

      <SmallDialog
        open={noteOpen}
        title="Observación"
        confirmLabel="Guardar"
        onClose={() => setNoteOpen(false)}
        onConfirm={() => {
          onObservationsChange(draft.trim());
          setNoteOpen(false);
        }}
      >
        <TextField
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ej.: se pesó después de la lluvia, piso de la jaula con barro."
          variant="filled"
          multiline
          minRows={3}
          fullWidth
          hiddenLabel
          sx={{ '& .MuiFilledInput-root': { bgcolor: 'action.hover' } }}
        />
      </SmallDialog>
    </>
  );
}
