import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Stack,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { DashboardBoard, BoardTemplateType } from './types';

interface CreateEditBoardDialogProps {
  open: boolean;
  onClose: () => void;
  boardToEdit?: DashboardBoard | null;
  onSaveBoard: (board: Partial<DashboardBoard>) => void;
  onDeleteBoard?: (boardId: string) => void;
}

const TEMPLATE_OPTIONS: { type: BoardTemplateType; label: string; desc: string; icon: string }[] = [
  {
    type: 'BLANK',
    label: 'Tablero en Blanco (Canvas Vacío)',
    desc: 'Lienzo limpio para armar con tus propios widgets y métricas a medida.',
    icon: 'heroicons-outline:document-plus',
  },
  {
    type: 'HEALTH',
    label: 'Plantilla: Sanidad & Bioseguridad',
    desc: 'Incluye evolución de cuarentena, consumo interno, decesos y tablas.',
    icon: 'heroicons-outline:shield-check',
  },
  {
    type: 'REPRODUCTIVE',
    label: 'Plantilla: Reproducción & Entore',
    desc: 'Incluye curva de preñez de 60-90 días, ratio torada y lotes de servicio.',
    icon: 'heroicons-outline:heart',
  },
  {
    type: 'PASTURE',
    label: 'Plantilla: Pasturas & Carga Animal',
    desc: 'Incluye carga animal EV/ha por potrero, días de ocupación y descanso.',
    icon: 'heroicons-outline:sparkles',
  },
];

export const CreateEditBoardDialog: React.FC<CreateEditBoardDialogProps> = ({
  open,
  onClose,
  boardToEdit,
  onSaveBoard,
  onDeleteBoard,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [name, setName] = useState(boardToEdit?.name || '');
  const [templateType, setTemplateType] = useState<BoardTemplateType>(boardToEdit?.templateType || 'BLANK');

  const handleSave = () => {
    if (!name.trim()) return;
    onSaveBoard({
      name: name.trim(),
      templateType,
      icon: templateType === 'REPRODUCTIVE' ? 'heroicons-outline:heart' : templateType === 'PASTURE' ? 'heroicons-outline:sparkles' : templateType === 'HEALTH' ? 'heroicons-outline:shield-check' : 'heroicons-outline:rectangle-group',
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' },
      }}
    >
      <Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: isDark ? 'rgba(2, 132, 199, 0.16)' : '#e0f2fe', color: '#0284c7' }}>
            <FuseSvgIcon size={22}>heroicons-outline:squares-plus</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {boardToEdit ? 'Editar Tablero' : 'Nuevo Tablero Ganadero'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Personaliza tu espacio de trabajo y métricas operativas
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75, textTransform: 'uppercase' }}>
              Nombre del Tablero *
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Ej. Control Reproductivo Campaña 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1, textTransform: 'uppercase' }}>
              Punto de Partida / Plantilla Base
            </Typography>
            <Stack spacing={1.25}>
              {TEMPLATE_OPTIONS.map((opt) => {
                const isSelected = templateType === opt.type;
                return (
                  <Paper
                    key={opt.type}
                    variant="outlined"
                    onClick={() => setTemplateType(opt.type)}
                    sx={{
                      p: 1.5,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      bgcolor: isSelected ? alpha(theme.palette.primary.main, isDark ? 0.16 : 0.06) : 'background.paper',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      borderWidth: isSelected ? 2 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      '&:hover': { bgcolor: 'action.hover' },
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Box sx={{ width: 34, height: 34, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: isSelected ? 'primary.main' : 'action.hover', color: isSelected ? '#ffffff' : 'text.secondary' }}>
                      <FuseSvgIcon size={18}>{opt.icon}</FuseSvgIcon>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.84rem' }}>{opt.label}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.74rem' }}>{opt.desc}</Typography>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <Box sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: 1, borderColor: 'divider' }}>
        {boardToEdit && onDeleteBoard && boardToEdit.isCustom ? (
          <Button color="error" variant="text" size="small" onClick={() => { onDeleteBoard(boardToEdit.id); onClose(); }} startIcon={<FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>}>
            Eliminar Tablero
          </Button>
        ) : <Box />}
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" onClick={onClose} sx={{ borderRadius: '6px', fontWeight: 600 }}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={!name.trim()} sx={{ borderRadius: '6px', fontWeight: 700, px: 2.5 }}>
            {boardToEdit ? 'Guardar Cambios' : 'Crear Tablero'}
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};

export default CreateEditBoardDialog;
