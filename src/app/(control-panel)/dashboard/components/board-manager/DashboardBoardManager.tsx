import React from 'react';
import { Button, IconButton, Tooltip, Box, alpha, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { DashboardBoard } from './types';

interface DashboardBoardManagerProps {
  boards: DashboardBoard[];
  activeBoardId: string;
  onSelectBoard: (boardId: string) => void;
  onOpenCreateDialog: () => void;
  onOpenEditDialog: (board: DashboardBoard) => void;
}

export const DashboardBoardManager: React.FC<DashboardBoardManagerProps> = ({
  boards,
  activeBoardId,
  onSelectBoard,
  onOpenCreateDialog,
  onOpenEditDialog,
}) => {
  const theme = useTheme();
  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        pb: 0.5,
      }}
    >
      {/* Board Buttons List + Minimalist Add Button inline */}
      <Box
        sx={{
          minWidth: 0,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          overflowX: 'auto',
          py: 0.5,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
        }}
      >
        {boards.map((board) => {
          const isActive = board.id === activeBoardId;

          return (
            <Button
              key={board.id}
              onClick={() => onSelectBoard(board.id)}
              variant={isActive ? 'contained' : 'text'}
              color={isActive ? 'primary' : 'inherit'}
              startIcon={
                <FuseSvgIcon size={18}>
                  {board.icon || 'heroicons-outline:rectangle-group'}
                </FuseSvgIcon>
              }
              sx={{
                borderRadius: '8px',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.84rem',
                textTransform: 'none',
                px: 2,
                py: 0.75,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: 'none',
                bgcolor: isActive ? undefined : 'transparent',
                color: isActive ? undefined : 'text.secondary',
                border: '1px solid',
                borderColor: isActive ? 'transparent' : 'transparent',
                '&:hover': isActive
                  ? { boxShadow: 'none' }
                  : {
                      bgcolor: 'action.hover',
                      color: 'text.primary',
                      borderColor: 'divider',
                    },
                transition: 'all 0.15s ease',
              }}
            >
              {board.name}
            </Button>
          );
        })}

        {/* Minimalist Icon Button: Add New Board */}
        <Tooltip title="Agregar nuevo tablero" arrow>
          <IconButton
            onClick={onOpenCreateDialog}
            size="small"
            aria-label="Agregar nuevo tablero"
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              color: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              border: '1px dashed',
              borderColor: alpha(theme.palette.primary.main, 0.35),
              flexShrink: 0,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.16),
                borderColor: 'primary.main',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.15s ease',
            }}
          >
            <FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>
          </IconButton>
        </Tooltip>
      </Box>

      {/* Minimalist Icon Button: Configure / Edit Current Active Board */}
      <Tooltip title={`Configurar / Editar Tablero "${activeBoard?.name}"`} arrow>
        <IconButton
          onClick={() => activeBoard && onOpenEditDialog(activeBoard)}
          size="small"
          aria-label="Configurar tablero activo"
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            color: 'text.secondary',
            bgcolor: 'transparent',
            border: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
            '&:hover': {
              bgcolor: 'action.hover',
              color: 'text.primary',
              borderColor: 'text.secondary',
            },
            transition: 'all 0.15s ease',
          }}
        >
          <FuseSvgIcon size={18}>heroicons-outline:cog-6-tooth</FuseSvgIcon>
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default DashboardBoardManager;
