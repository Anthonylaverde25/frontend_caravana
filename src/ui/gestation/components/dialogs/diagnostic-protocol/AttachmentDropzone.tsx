import React, { useRef } from 'react';
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface AttachmentDropzoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
}

const ACCEPTED = '.jpg,.jpeg,.png,.webp,.heic,.pdf';

/**
 * Evidence intake for Use Case 2. The file is proof, not data: the structured results still
 * have to be transcribed in step 2, because no engine can read a WhatsApp photo.
 */
export const AttachmentDropzone: React.FC<AttachmentDropzoneProps> = ({
  files,
  onChange,
  maxFiles = 10,
  maxSizeMb = 10,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    const merged = [...files, ...selected].slice(0, maxFiles);
    onChange(merged);
    event.target.value = '';
  };

  const handleRemove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const oversized = files.filter((file) => file.size > maxSizeMb * 1024 * 1024);
  const heic = files.filter((file) => /\.heic$/i.test(file.name));

  return (
    <Box>
      <Box
        sx={{
          border: 1,
          borderStyle: 'dashed',
          borderColor: 'divider',
          borderRadius: '8px',
          p: 2,
          textAlign: 'center',
          bgcolor: 'action.hover',
        }}
      >
        <FuseSvgIcon size={28} sx={{ color: 'primary.main' }}>
          heroicons-outline:paper-clip
        </FuseSvgIcon>

        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
          Evidencia del informe (foto de WhatsApp, escaneo o PDF membretado)
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Hasta {maxFiles} archivos · {maxSizeMb} MB cada uno · JPG, PNG, WEBP, HEIC o PDF
        </Typography>

        <Box sx={{ mt: 1.5 }}>
          <Button
            variant="text"
            onClick={() => inputRef.current?.click()}
            sx={{ fontWeight: 600, textTransform: 'none', color: 'primary.main' }}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:arrow-up-tray</FuseSvgIcon>}
          >
            Seleccionar archivos
          </Button>
          <input
            ref={inputRef}
            type="file"
            hidden
            multiple
            accept={ACCEPTED}
            onChange={handleSelect}
          />
        </Box>
      </Box>

      {files.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
          {files.map((file, index) => (
            <Chip
              key={`${file.name}-${index}`}
              label={`${file.name} · ${(file.size / 1024).toFixed(0)} KB`}
              onDelete={() => handleRemove(index)}
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>
      )}

      {oversized.length > 0 && (
        <Alert severity="error" sx={{ mt: 1.5, fontSize: '0.8rem', py: 0.5 }}>
          {oversized.length} archivo(s) superan los {maxSizeMb} MB y serán rechazados por el servidor.
        </Alert>
      )}

      {heic.length > 0 && (
        <Alert severity="info" sx={{ mt: 1.5, fontSize: '0.8rem', py: 0.5 }}>
          Las fotos HEIC de iPhone se archivan correctamente, pero el navegador no puede
          previsualizarlas. Quedan marcadas para conversión.
        </Alert>
      )}
    </Box>
  );
};

export default AttachmentDropzone;
