import React from 'react';
import { Box, Typography, Tooltip, IconButton, Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { DashboardBoard } from '../board-manager/types';

interface FioriTabBarProps {
  boards: DashboardBoard[];
  activeBoardId: string;
  onSelectBoard: (boardId: string) => void;
  onOpenCreateDialog: () => void;
  onOpenEditDialog: (board: DashboardBoard) => void;
  onToggleFilter?: () => void;
}

export const FioriTabBar: React.FC<FioriTabBarProps> = ({
  boards,
  activeBoardId,
  onSelectBoard,
  onOpenCreateDialog,
  onOpenEditDialog,
  onToggleFilter,
}) => {
  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: { xs: 2, sm: 3.5 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflowX: 'auto',
        minHeight: 44,
        '&::-webkit-scrollbar': { height: 3 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
      }}
    >
      {/* Tabs */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2.5, sm: 4 }, flexShrink: 0 }}>
        {boards.map((board) => {
          const isActive = board.id === activeBoardId;
          const isGeneral = board.templateType === 'GENERAL' || board.id === 'b_general';

          return (
            <Box
              component="button"
              key={board.id}
              onClick={() => onSelectBoard(board.id)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                py: 1.5,
                px: 0.5,
                bgcolor: 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #0a4d3c' : '3px solid transparent',
                color: isActive ? '#0a4d3c' : 'text.secondary',
                cursor: 'pointer',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.8125rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                '&:hover': {
                  color: isActive ? '#0a4d3c' : 'text.primary',
                },
              }}
            >
              <FuseSvgIcon
                size={16}
                sx={{
                  color: isActive ? '#0a4d3c' : 'text.secondary',
                }}
              >
                {board.icon || 'heroicons-outline:squares-2x2'}
              </FuseSvgIcon>
              <Typography
                component="span"
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 700 : 500,
                  color: 'inherit',
                }}
              >
                {board.name}
              </Typography>
              {isGeneral && (
                <Box
                  component="span"
                  sx={{
                    bgcolor: '#0a4d3c',
                    color: '#ffffff',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    px: 0.75,
                    py: 0.1,
                    borderRadius: '10px',
                    lineHeight: 1.4,
                  }}
                >
                  4
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Right Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2, flexShrink: 0 }}>
        <Button
          onClick={onOpenCreateDialog}
          size="small"
          sx={{
            textTransform: 'none',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#0a4d3c',
            bgcolor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '5px',
            px: 1.5,
            py: 0.5,
            minWidth: 'auto',
            '&:hover': { bgcolor: '#0a4d3c', color: '#ffffff', borderColor: '#0a4d3c' },
            transition: 'all 0.15s ease',
          }}
          startIcon={
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          }
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            Nueva Vista
          </Box>
        </Button>

        <Tooltip title="Personalizar Filtros" arrow>
          <IconButton
            onClick={onToggleFilter}
            size="small"
            sx={{
              color: 'text.secondary',
              p: 0.75,
              borderRadius: '6px',
              '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
            }}
          >
            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </IconButton>
        </Tooltip>

        <Tooltip title={`Ajustes de Tablero "${activeBoard?.name}"`} arrow>
          <IconButton
            onClick={() => activeBoard && onOpenEditDialog(activeBoard)}
            size="small"
            sx={{
              color: 'text.secondary',
              p: 0.75,
              borderRadius: '6px',
              '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
            }}
          >
            <FuseSvgIcon size={16}>heroicons-outline:cog-6-tooth</FuseSvgIcon>
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default FioriTabBar;
