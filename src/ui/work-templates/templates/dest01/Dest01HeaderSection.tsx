import React, { useMemo } from 'react';
import { Autocomplete, Box, Link, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { suggestedWeaningBatchName, useDest01Print } from './Dest01PrintContext';

const WEANING_TYPES = ['TRADICIONAL', 'ANTICIPADO', 'PRECOZ'];

/**
 * Header to print. The weaning batch can be an active one or a new name; it is printed as text and
 * the destination is confirmed when the sheet is scanned.
 */
export const Dest01HeaderSection: React.FC = () => {
  const { mode, header, setHeaderField } = useDest01Print();
  const { data: batches = [], isLoading } = useBatches(undefined, 'WEANING');

  const weaningBatchNames = useMemo(
    () => batches.filter((b) => b.is_active && b.batch_type_code === 'WEANING').map((b) => b.name).sort(),
    [batches]
  );

  const suggestion = suggestedWeaningBatchName();
  const isExisting = weaningBatchNames.includes(header.lote_destete.trim());

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Autocomplete
          freeSolo
          options={weaningBatchNames}
          loading={isLoading}
          inputValue={header.lote_destete}
          onInputChange={(_, value) => setHeaderField('lote_destete', value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Lote de destete (existente o nuevo)"
              size="small"
              placeholder={suggestion}
              helperText={
                header.lote_destete.trim()
                  ? isExisting
                    ? 'Lote de destete activo: las crías se suman a él.'
                    : 'Nombre nuevo: el lote se crea al cargar la planilla.'
                  : mode === 'blank'
                    ? 'Vacío: se imprime el recuadro para escribirlo a mano.'
                    : 'Elegí un lote activo o escribí un nombre nuevo.'
              }
            />
          )}
        />
        {!header.lote_destete.trim() && (
          <Typography variant="caption" color="text.secondary">
            Sugerido:{' '}
            <Link component="button" type="button" variant="caption" onClick={() => setHeaderField('lote_destete', suggestion)}>
              {suggestion}
            </Link>
          </Typography>
        )}
      </Box>

      <Stack direction="row" spacing={1.5}>
        <TextField
          label="Fecha de destete"
          type="date"
          size="small"
          fullWidth
          value={header.fecha_destete}
          onChange={(e) => setHeaderField('fecha_destete', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          select
          label="Tipo de destete"
          size="small"
          fullWidth
          value={header.tipo_destete}
          onChange={(e) => setHeaderField('tipo_destete', e.target.value)}
          InputLabelProps={{ shrink: true }}
        >
          <MenuItem value="">Marcar en la manga</MenuItem>
          {WEANING_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <TextField
        label="Lote de cría (origen)"
        size="small"
        fullWidth
        value={header.lote_origen}
        onChange={(e) => setHeaderField('lote_origen', e.target.value)}
      />
      <TextField
        label="Responsable"
        size="small"
        fullWidth
        value={header.responsable}
        onChange={(e) => setHeaderField('responsable', e.target.value)}
      />
    </Box>
  );
};

export default Dest01HeaderSection;
