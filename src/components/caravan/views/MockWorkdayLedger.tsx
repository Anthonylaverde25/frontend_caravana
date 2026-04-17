import { useMemo } from 'react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import DataTable from 'src/components/data-table/DataTable';
import { MRT_ColumnDef } from 'material-react-table';

// MOCK DATA
const MOCK_WORKDAYS = [
  {
    id: 1,
    code: 'WD-20260415-01',
    created_at: '2026-04-15 08:30:00',
    type: 'entry',
    caravan_count: 85
  },
  {
    id: 2,
    code: 'WD-20260414-02',
    created_at: '2026-04-14 15:45:00',
    type: 'update',
    caravan_count: 120
  },
  {
    id: 3,
    code: 'WD-20260410-01',
    created_at: '2026-04-10 09:15:00',
    type: 'exit',
    caravan_count: 40
  }
];

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'entry': return { label: 'Entrada', color: 'success' };
    case 'update': return { label: 'Revisión', color: 'info' };
    case 'exit': return { label: 'Salida', color: 'default' };
    default: return { label: type, color: 'default' };
  }
};

const MockWorkdayLedger = () => {
  const columns = useMemo<MRT_ColumnDef<typeof MOCK_WORKDAYS[0]>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'CÓDIGO DE JORNADA',
        size: 150,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontWeight="bold" sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' }}}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'FECHA OPERATIVA',
        size: 200,
        Cell: ({ cell }) => (
          <Typography variant="body2">
            {new Date(cell.getValue<string>()).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' })}
          </Typography>
        )
      },
      {
        accessorKey: 'type',
        header: 'TIPO',
        size: 120,
        Cell: ({ cell }) => {
          const typeData = getTypeLabel(cell.getValue<string>());
          return (
            <Chip 
              label={typeData.label} 
              color={typeData.color as any} 
              size="small" 
              sx={{ fontWeight: 'bold', borderRadius: 1 }} 
            />
          );
        }
      },
      {
        accessorKey: 'caravan_count',
        header: 'CANTIDAD (ANIMALES)',
        size: 150,
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {cell.getValue<number>()} registrados
          </Typography>
        )
      }
    ],
    []
  );

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      
      {/* Banner Mock */}
      <Box sx={{ 
        p: 3, 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText', 
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)'
      }}>
        <TimelineIcon sx={{ fontSize: 48, opacity: 0.8 }} />
        <Box>
          <Typography variant="h5" fontWeight="700">Historial de Operaciones (Mock)</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Aquí podrás auditar todas las jornadas de trabajo realizadas. Haz click en un código para ver el detalle de los animales procesados ese día.
          </Typography>
        </Box>
      </Box>

      {/* Table Mock */}
      <Box sx={{ flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={MOCK_WORKDAYS}
          enableGlobalFilter={true}
          enableRowActions={true}
          positionActionsColumn="last"
          renderRowActions={() => (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Ver Detalle de la Jornada">
                <IconButton size="small" color="primary">
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          initialState={{
             density: 'comfortable',
             showGlobalFilter: true
          }}
          muiTablePaperProps={{
            sx: { boxShadow: 'none' }
          }}
        />
      </Box>

    </Box>
  );
};

export default MockWorkdayLedger;
