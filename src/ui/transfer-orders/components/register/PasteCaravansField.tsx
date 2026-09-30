import React, { useState } from 'react';
import { Alert, Box, Button, Collapse, TextField } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { matchPastedCaravans, PastedCaravanMatch } from './matchPastedCaravans';

interface PasteCaravansFieldProps {
  caravans: { id: number; identification: string }[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  disabled?: boolean;
}

/**
 * The list of what moved usually arrives written somewhere else — a notebook, a spreadsheet, a
 * message. Pasting it adds those animals to the selection and says which ones are not in the
 * source batch, instead of ticking two hundred boxes.
 */
export const PasteCaravansField: React.FC<PasteCaravansFieldProps> = ({
  caravans,
  selectedIds,
  onSelectionChange,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [result, setResult] = useState<PastedCaravanMatch | null>(null);

  const apply = () => {
    const match = matchPastedCaravans(text, caravans);

    onSelectionChange([...new Set([...selectedIds, ...match.matchedIds])]);
    setResult(match);

    if (match.notFound.length === 0) setText('');
  };

  return (
    <Box>
      <Button
        size="small"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        startIcon={<FuseSvgIcon size={16}>heroicons-outline:clipboard-document-list</FuseSvgIcon>}
        sx={{ textTransform: 'none', fontWeight: 600 }}
      >
        {isOpen ? 'Ocultar' : 'Pegar lista de caravanas'}
      </Button>

      <Collapse in={isOpen && !disabled}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          <TextField
            multiline
            minRows={3}
            maxRows={8}
            fullWidth
            variant="filled"
            size="small"
            label="Caravanas que se movieron"
            placeholder="Una por línea, o separadas por coma o espacio"
            value={text}
            onChange={(e) => setText(e.target.value)}
            sx={{ bgcolor: 'action.hover', '& .MuiFilledInput-root': { borderRadius: '6px' } }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              variant="contained"
              disableElevation
              disabled={!text.trim()}
              onClick={apply}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
            >
              Seleccionar
            </Button>
          </Box>

          {result && (
            <Alert
              severity={result.notFound.length > 0 ? 'warning' : 'success'}
              onClose={() => setResult(null)}
              sx={{ fontSize: '0.78rem', py: 0.25 }}
            >
              {result.matchedIds.length} caravana(s) seleccionada(s).
              {result.notFound.length > 0 &&
                ` No están en el lote de origen: ${result.notFound.slice(0, 15).join(', ')}${result.notFound.length > 15 ? ` y ${result.notFound.length - 15} más` : ''}.`}
            </Alert>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default PasteCaravansField;
