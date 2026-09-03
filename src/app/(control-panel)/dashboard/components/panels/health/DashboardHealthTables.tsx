import React, { useState, useMemo } from 'react';
import { Box, Paper, Stack, Tabs, Tab, Chip, Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import DataTable from 'src/components/data-table/DataTable';
import { MRT_ColumnDef } from 'material-react-table';
import { QuarantineCaravan, ConsumptionCaravan, DeathCaravan } from '../DashboardHealthPanel';

interface DashboardHealthTablesProps {
  quarantineData: QuarantineCaravan[];
  consumptionData: ConsumptionCaravan[];
  deathData: DeathCaravan[];
  onActionClick: (action: string, tag: string) => void;
}

const getSeverityChip = (severity: QuarantineCaravan['severity']) => {
  switch (severity) {
    case 'CRITICAL':
      return <Chip label="CRÍTICO" size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700, height: 18, fontSize: '0.65rem' }} />;
    case 'HIGH':
      return <Chip label="ALTO" size="small" sx={{ bgcolor: '#ffedd5', color: '#ea580c', fontWeight: 700, height: 18, fontSize: '0.65rem' }} />;
    case 'MEDIUM':
      return <Chip label="MEDIO" size="small" sx={{ bgcolor: '#fef9c3', color: '#ca8a04', fontWeight: 700, height: 18, fontSize: '0.65rem' }} />;
    case 'LOW':
      return <Chip label="BAJO" size="small" sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 700, height: 18, fontSize: '0.65rem' }} />;
    default:
      return <Chip label="BAJO" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />;
  }
};

export const DashboardHealthTables: React.FC<DashboardHealthTablesProps> = ({
  quarantineData,
  consumptionData,
  deathData,
  onActionClick,
}) => {
  const [subTab, setSubTab] = useState(0);

  const spreadsheetProps = useMemo(() => ({
    enableColumnBorders: true,
    enableRowBorders: true,
    muiTableProps: {
      sx: { border: '1px solid', borderColor: 'divider' },
    },
    muiTableHeadCellProps: {
      sx: {
        borderRight: '1px solid',
        borderBottom: '2px solid',
        borderColor: 'divider',
        backgroundColor: 'action.hover',
        fontWeight: 800,
        fontSize: '0.75rem',
        p: '6px 8px',
      },
    },
    muiTableBodyCellProps: {
      sx: {
        borderRight: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
        fontSize: '0.75rem',
        p: '6px 8px',
      },
    },
  }), []);

  const quarantineColumns = useMemo<MRT_ColumnDef<QuarantineCaravan>[]>(() => [
    { accessorKey: 'id', header: 'ID', size: 90 },
    { accessorKey: 'tag', header: 'Caravana', size: 100, Cell: ({ row }) => <strong>#{row.original.tag}</strong> },
    { accessorKey: 'entryDate', header: 'Fecha Ingreso', size: 120 },
    { accessorKey: 'diagnosis', header: 'Diagnóstico Presuntivo', size: 280 },
    { accessorKey: 'severity', header: 'Severidad', size: 100, Cell: ({ row }) => getSeverityChip(row.original.severity) },
    { accessorKey: 'daysIsolated', header: 'Días Aislado', size: 110, Cell: ({ row }) => `${row.original.daysIsolated} d` },
    {
      id: 'actions',
      header: 'Acciones',
      size: 130,
      Cell: ({ row }) => (
        <Button size="small" variant="outlined" color="primary" onClick={() => onActionClick('Alta Sanitaria', row.original.tag)} sx={{ fontSize: '0.7rem', py: 0.25 }}>
          Alta Sanitaria
        </Button>
      ),
    },
  ], [onActionClick]);

  const consumptionColumns = useMemo<MRT_ColumnDef<ConsumptionCaravan>[]>(() => [
    { accessorKey: 'id', header: 'ID', size: 90 },
    { accessorKey: 'tag', header: 'Caravana', size: 100, Cell: ({ row }) => <strong>#{row.original.tag}</strong> },
    { accessorKey: 'assignDate', header: 'Fecha Asignación', size: 130 },
    { accessorKey: 'weight', header: 'Peso Vivo (kg)', size: 120, Cell: ({ row }) => `${row.original.weight} kg` },
    { accessorKey: 'destination', header: 'Destino / Asignado', size: 260 },
    { accessorKey: 'status', header: 'Estado', size: 140, Cell: ({ row }) => <Chip label={row.original.status} size="small" sx={{ fontWeight: 600, height: 20, fontSize: '0.68rem' }} /> },
  ], []);

  const deathColumns = useMemo<MRT_ColumnDef<DeathCaravan>[]>(() => [
    { accessorKey: 'id', header: 'ID', size: 90 },
    { accessorKey: 'tag', header: 'Caravana', size: 100, Cell: ({ row }) => <strong>#{row.original.tag}</strong> },
    { accessorKey: 'deathDate', header: 'Fecha Deceso', size: 120 },
    { accessorKey: 'cause', header: 'Causa Dictaminada', size: 260 },
    { accessorKey: 'diagnosedBy', header: 'Profesional a Cargo', size: 180 },
    { accessorKey: 'status', header: 'Estado Acta', size: 130, Cell: ({ row }) => <Chip label={row.original.status} color="default" size="small" sx={{ fontWeight: 600, height: 20, fontSize: '0.68rem' }} /> },
  ], []);

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', bgcolor: 'background.paper' }}>
      <Stack spacing={2.5}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={subTab}
            onChange={(_e, v) => setSubTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ '& .MuiTab-root': { fontWeight: 700, fontSize: '0.82rem', textTransform: 'none', px: 2.5, py: 1 } }}
          >
            <Tab icon={<FuseSvgIcon size={18} sx={{ mr: 0.75 }}>heroicons-outline:bell</FuseSvgIcon>} iconPosition="start" label="Cuarentena" />
            <Tab icon={<FuseSvgIcon size={18} sx={{ mr: 0.75 }}>heroicons-outline:shopping-cart</FuseSvgIcon>} iconPosition="start" label="Consumo Interno" />
            <Tab icon={<FuseSvgIcon size={18} sx={{ mr: 0.75 }}>heroicons-outline:x-mark</FuseSvgIcon>} iconPosition="start" label="Muerte (Bajas)" />
          </Tabs>
        </Box>

        {subTab === 0 && (
          <DataTable columns={quarantineColumns} data={quarantineData} enableRowSelection={false} enableColumnOrdering enableGlobalFilter enableRowActions={false} {...spreadsheetProps} initialState={{ density: 'compact', showGlobalFilter: true, pagination: { pageSize: 10, pageIndex: 0 } }} />
        )}
        {subTab === 1 && (
          <DataTable columns={consumptionColumns} data={consumptionData} enableRowSelection={false} enableColumnOrdering enableGlobalFilter enableRowActions={false} {...spreadsheetProps} initialState={{ density: 'compact', showGlobalFilter: true, pagination: { pageSize: 10, pageIndex: 0 } }} />
        )}
        {subTab === 2 && (
          <DataTable columns={deathColumns} data={deathData} enableRowSelection={false} enableColumnOrdering enableGlobalFilter enableRowActions={false} {...spreadsheetProps} initialState={{ density: 'compact', showGlobalFilter: true, pagination: { pageSize: 10, pageIndex: 0 } }} />
        )}
      </Stack>
    </Paper>
  );
};

export default DashboardHealthTables;
