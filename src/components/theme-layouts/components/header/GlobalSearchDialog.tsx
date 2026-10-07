import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  InputBase,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  alpha,
  Divider,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';

export interface SearchOption {
  id: string;
  title: string;
  category: 'Ganado & Lotes' | 'Reproducción & Sanidad' | 'Órdenes & Documentos' | 'Administración';
  url: string;
  icon: string;
  keywords: string[];
}

const STATIC_NAVIGATION_OPTIONS: SearchOption[] = [
  {
    id: 'caravans',
    title: 'Caravanas & Animales',
    category: 'Ganado & Lotes',
    url: '/caravans',
    icon: 'heroicons-outline:identification',
    keywords: ['caravana', 'animal', 'vaca', 'toro', 'ternero', 'identificacion', 'rfid', 'tag'],
  },
  {
    id: 'batches-own',
    title: 'Lotes Propios',
    category: 'Ganado & Lotes',
    url: '/batches/own',
    icon: 'heroicons-outline:collection',
    keywords: ['lote', 'lotes', 'rodeo', 'potrero', 'propios'],
  },
  {
    id: 'batches-ext',
    title: 'Lotes de Terceros',
    category: 'Ganado & Lotes',
    url: '/batches/external',
    icon: 'heroicons-outline:user-group',
    keywords: ['lote', 'terceros', 'capitalizacion', 'pastoreo'],
  },
  {
    id: 'entry-orders',
    title: 'Órdenes de Entrada (DTA / Guías)',
    category: 'Órdenes & Documentos',
    url: '/entry-orders',
    icon: 'heroicons-outline:arrow-down-tray',
    keywords: ['entrada', 'ingreso', 'guia', 'dta', 'recepcion', 'camion'],
  },
  {
    id: 'transfer-orders',
    title: 'Órdenes de Transferencia',
    category: 'Órdenes & Documentos',
    url: '/transfer-orders',
    icon: 'heroicons-outline:arrows-right-left',
    keywords: ['transferencia', 'movimiento', 'traslado', 'cambio campo'],
  },
  {
    id: 'gestation-tacto',
    title: 'Tacto Rectal & Diagnóstico de Gestación',
    category: 'Reproducción & Sanidad',
    url: '/gestation/tacto',
    icon: 'heroicons-outline:clipboard-document-check',
    keywords: ['tacto', 'palpacion', 'prenada', 'vacia', 'gestacion', 'ecografia'],
  },
  {
    id: 'gestation-service-batches',
    title: 'Lotes de Servicio / Entore',
    category: 'Reproducción & Sanidad',
    url: '/gestation/service-batches',
    icon: 'heroicons-outline:heart',
    keywords: ['servicio', 'entore', 'inseminacion', 'iatf', 'torada', 'celo'],
  },
  {
    id: 'gestation-births',
    title: 'Registro de Partos',
    category: 'Reproducción & Sanidad',
    url: '/gestation/births',
    icon: 'heroicons-outline:sparkles',
    keywords: ['parto', 'nacimiento', 'ternero', 'paricion', 'madre'],
  },
  {
    id: 'weaning-orders',
    title: 'Órdenes de Destete',
    category: 'Reproducción & Sanidad',
    url: '/weaning-orders',
    icon: 'heroicons-outline:scale',
    keywords: ['destete', 'pesaje', 'desmadre', 'peso destete'],
  },
  {
    id: 'work-templates-scan',
    title: 'Digitalización & Escaneo OCR de Planillas',
    category: 'Órdenes & Documentos',
    url: '/work-templates/scan',
    icon: 'heroicons-outline:document-magnifying-glass',
    keywords: ['escanear', 'ocr', 'planilla', 'cact', 'lser', 'dest', 'ing03'],
  },
  {
    id: 'work-templates-gallery',
    title: 'Plantillas de Trabajo Imprimibles',
    category: 'Órdenes & Documentos',
    url: '/work-templates',
    icon: 'heroicons-outline:document-text',
    keywords: ['plantilla', 'imprimir', 'formato', 'manga'],
  },
  {
    id: 'providers',
    title: 'Proveedores & Transportistas',
    category: 'Administración',
    url: '/providers',
    icon: 'heroicons-outline:truck',
    keywords: ['proveedor', 'consignatario', 'fletero', 'veterinaria'],
  },
  {
    id: 'farms',
    title: 'Establecimientos & Campos',
    category: 'Administración',
    url: '/farms',
    icon: 'heroicons-outline:map-pin',
    keywords: ['campo', 'establecimiento', 'estancia', 'renspa', 'ubicacion'],
  },
  {
    id: 'settings',
    title: 'Configuración del Sistema',
    category: 'Administración',
    url: '/settings',
    icon: 'heroicons-outline:cog-6-tooth',
    keywords: ['configuracion', 'ajustes', 'usuario', 'permisos'],
  },
];

type GlobalSearchDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const GlobalSearchDialog: React.FC<GlobalSearchDialogProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Filter options based on query
  const cleanQuery = query.trim().toLowerCase();

  const filteredNavigation = cleanQuery
    ? STATIC_NAVIGATION_OPTIONS.filter((opt) => {
        const matchesTitle = opt.title.toLowerCase().includes(cleanQuery);
        const matchesKeywords = opt.keywords.some((k) => k.toLowerCase().includes(cleanQuery));
        return matchesTitle || matchesKeywords;
      })
    : STATIC_NAVIGATION_OPTIONS.slice(0, 7);

  // Dynamic search item for livestock tag search if query looks like a code / query
  const dynamicCaravanSearch: SearchOption | null = cleanQuery
    ? {
        id: `search-caravan-${cleanQuery}`,
        title: `Buscar caravana o tag "${query}" en Ganado`,
        category: 'Ganado & Lotes',
        url: `/caravans?search=${encodeURIComponent(cleanQuery)}`,
        icon: 'heroicons-outline:magnifying-glass',
        keywords: [],
      }
    : null;

  const allVisibleItems: SearchOption[] = dynamicCaravanSearch
    ? [dynamicCaravanSearch, ...filteredNavigation]
    : filteredNavigation;

  const handleSelectOption = (item: SearchOption) => {
    navigate(item.url);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allVisibleItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allVisibleItems.length) % (allVisibleItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allVisibleItems[selectedIndex]) {
        handleSelectOption(allVisibleItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          top: { xs: 40, sm: 80 },
          position: 'absolute',
          border: (theme) => `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Search input bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1.5,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            gap: 1.5,
          }}
        >
          <FuseSvgIcon size={22} color="action">
            heroicons-outline:magnifying-glass
          </FuseSvgIcon>
          <InputBase
            inputRef={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar caravana, lote, orden, módulo o acción..."
            fullWidth
            sx={{
              fontSize: '1rem',
              fontWeight: 500,
            }}
          />
          {query && (
            <IconButton size="small" onClick={() => setQuery('')}>
              <FuseSvgIcon size={16}>heroicons-solid:x-mark</FuseSvgIcon>
            </IconButton>
          )}
          <Chip
            label="ESC"
            size="small"
            onClick={onClose}
            sx={{
              fontSize: '0.65rem',
              height: 20,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          />
        </Box>

        {/* Results list */}
        <List sx={{ maxHeight: 380, overflowY: 'auto', p: 1 }}>
          {allVisibleItems.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No se encontraron resultados para "{query}"
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                Prueba buscando por número de caravana, 'tacto', 'destete' o 'lotes'.
              </Typography>
            </Box>
          ) : (
            allVisibleItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <ListItem
                  key={item.id}
                  disablePadding
                  sx={{ mb: 0.5 }}
                >
                  <ListItemButton
                    onClick={() => handleSelectOption(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    sx={{
                      borderRadius: '8px',
                      px: 1.5,
                      py: 1,
                      backgroundColor: isSelected
                        ? (theme) => alpha(theme.palette.primary.main, 0.08)
                        : 'transparent',
                      transition: 'all 0.1s ease',
                      '&:hover': {
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <FuseSvgIcon
                        size={20}
                        color={isSelected ? 'primary' : 'action'}
                      >
                        {item.icon}
                      </FuseSvgIcon>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: isSelected ? 700 : 500,
                              color: isSelected ? 'primary.main' : 'text.primary',
                            }}
                          >
                            {item.title}
                          </Typography>
                          <Chip
                            label={item.category}
                            size="small"
                            sx={{
                              fontSize: '0.65rem',
                              height: 18,
                              opacity: 0.8,
                            }}
                          />
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })
          )}
        </List>

        {/* Footer shortcuts hint */}
        <Divider />
        <Box
          sx={{
            px: 2,
            py: 1,
            backgroundColor: (theme) => alpha(theme.palette.background.default, 0.6),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: 'text.secondary',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <span>↑↓ Navegar</span>
            <span>↵ Seleccionar</span>
            <span>ESC Cerrar</span>
          </Box>
          <Box sx={{ fontWeight: 600 }}>
            GANADERO v1 Omnisearch
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearchDialog;
