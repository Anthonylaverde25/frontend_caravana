'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { Stack } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import PendingSiresWidget from 'src/ui/dashboard/widgets/PendingSiresWidget';

import { DashboardBoardManager } from '../board-manager/DashboardBoardManager';
import { CreateEditBoardDialog } from '../board-manager/CreateEditBoardDialog';
import { AddWidgetDialog } from '../board-manager/AddWidgetDialog';
import { DashboardBlankCanvas } from '../canvas/DashboardBlankCanvas';
import { DashboardBoard, DashboardWidget } from '../board-manager/types';
import { DashboardKPIs } from '../cards/DashboardSummaryCards';

import { DashboardGeneralPanel } from '../panels/DashboardGeneralPanel';
import {
  DashboardHealthPanel,
  QuarantineCaravan,
  ConsumptionCaravan,
  DeathCaravan,
} from '../panels/DashboardHealthPanel';
import { DashboardReproductivePanel } from '../panels/DashboardReproductivePanel';
import { DashboardPasturePanel } from '../panels/DashboardPasturePanel';

const INITIAL_BOARDS: DashboardBoard[] = [
  { id: 'b_general', name: 'Tablero General', icon: 'heroicons-outline:squares-2x2', templateType: 'GENERAL' },
  { id: 'b_health', name: 'Sanidad Interna', icon: 'heroicons-outline:shield-check', templateType: 'HEALTH' },
  { id: 'b_repro', name: 'Reproducción', icon: 'heroicons-outline:heart', templateType: 'REPRODUCTIVE' },
  { id: 'b_pasture', name: 'Pasturas', icon: 'heroicons-outline:sparkles', templateType: 'PASTURE' },
];

const MOCK_QUARANTINE_DATA: QuarantineCaravan[] = [
  { id: 'AR-10024', tag: '10024', entryDate: '2026-05-18', diagnosis: 'Fiebre extrema (41.2°C) y decaimiento agudo', severity: 'CRITICAL', daysIsolated: 3 },
  { id: 'AR-09822', tag: '09822', entryDate: '2026-05-20', diagnosis: 'Sintomatología respiratoria, disnea y tos seca', severity: 'HIGH', daysIsolated: 1 },
  { id: 'AR-10543', tag: '10543', entryDate: '2026-05-19', diagnosis: 'Cojera grado 4 en miembro posterior izquierdo', severity: 'MEDIUM', daysIsolated: 2 },
  { id: 'AR-10901', tag: '10901', entryDate: '2026-05-21', diagnosis: 'Aislamiento preventivo post-parto distócico', severity: 'LOW', daysIsolated: 0 },
];

const MOCK_CONSUMPTION_DATA: ConsumptionCaravan[] = [
  { id: 'AR-08240', tag: '08240', assignDate: '2026-05-10', weight: 415.5, destination: 'Personal de Campo (Sector Norte)', status: 'Listo para faena' },
  { id: 'AR-08912', tag: '08912', assignDate: '2026-05-12', weight: 398.2, destination: 'Casino Central de Empleados', status: 'Listo para faena' },
  { id: 'AR-09122', tag: '09122', assignDate: '2026-05-15', weight: 380.0, destination: 'Premio Especial de Fin de Mes', status: 'En engorde final' },
];

const MOCK_DEATH_DATA: DeathCaravan[] = [
  { id: 'AR-07412', tag: '07412', deathDate: '2026-05-02', cause: 'Timpanismo agudo espumoso', diagnosedBy: 'Vet. Carlos Gómez', status: 'Acta Firmada' },
  { id: 'AR-06991', tag: '06991', deathDate: '2026-05-08', cause: 'Traumatismo severo (caída en manga)', diagnosedBy: 'Vet. Carlos Gómez', status: 'Acta Firmada' },
  { id: 'AR-08815', tag: '08815', deathDate: '2026-05-15', cause: 'Neumonía enzoótica bovina', diagnosedBy: 'Vet. Sofía Martínez', status: 'Acta Pendiente' },
];

export function DashboardView() {
  const { enqueueSnackbar } = useSnackbar();

  // Load custom boards from localStorage
  const [boards, setBoards] = useState<DashboardBoard[]>(() => {
    try {
      const saved = localStorage.getItem('rxna_dashboard_boards_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_BOARDS;
  });

  const [activeBoardId, setActiveBoardId] = useState<string>(() => boards[0]?.id || 'b_general');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState<DashboardBoard | null>(null);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('rxna_dashboard_boards_v2', JSON.stringify(boards));
    } catch {
      // ignore
    }
  }, [boards]);

  const activeBoard = useMemo(() => boards.find((b) => b.id === activeBoardId) || boards[0], [boards, activeBoardId]);

  const kpis: DashboardKPIs = useMemo(() => ({
    quarantineCount: MOCK_QUARANTINE_DATA.length,
    quarantineCritical: MOCK_QUARANTINE_DATA.filter((q) => q.severity === 'CRITICAL').length,
    serviceBatchesCount: 3,
    serviceFemales: 185,
    serviceMales: 6,
    serviceRatio: 3.2,
    consumptionCount: MOCK_CONSUMPTION_DATA.length,
    consumptionKg: 1193.7,
    deathCount: MOCK_DEATH_DATA.length,
    deathRate: 1.2,
  }), []);

  const handleActionClick = (actionName: string, caravanTag: string) => {
    enqueueSnackbar(`Acción [${actionName}] ejecutada para Caravana #${caravanTag}`, { variant: 'success', autoHideDuration: 3000 });
  };

  const handleSaveBoard = (data: Partial<DashboardBoard>) => {
    if (boardToEdit) {
      setBoards((prev) => prev.map((b) => (b.id === boardToEdit.id ? { ...b, ...data } : b)));
      enqueueSnackbar(`Tablero "${data.name}" actualizado con éxito`, { variant: 'success' });
    } else {
      const newBoard: DashboardBoard = {
        id: `b_${Date.now()}`,
        name: data.name || 'Nuevo Tablero',
        icon: data.icon || 'heroicons-outline:rectangle-group',
        templateType: data.templateType || 'BLANK',
        widgets: [],
        isCustom: true,
      };
      setBoards((prev) => [...prev, newBoard]);
      setActiveBoardId(newBoard.id);
      enqueueSnackbar(`Tablero "${newBoard.name}" creado con éxito`, { variant: 'success' });
    }
  };

  const handleDeleteBoard = (boardId: string) => {
    const remaining = boards.filter((b) => b.id !== boardId);
    setBoards(remaining);
    if (activeBoardId === boardId && remaining.length > 0) {
      setActiveBoardId(remaining[0].id);
    }
    enqueueSnackbar('Tablero eliminado', { variant: 'info' });
  };

  const handleAddWidgetToActiveBoard = (widget: DashboardWidget) => {
    setBoards((prev) => prev.map((b) => (b.id === activeBoardId ? { ...b, widgets: [...(b.widgets || []), widget] } : b)));
    enqueueSnackbar(`Widget "${widget.title}" agregado al tablero`, { variant: 'success' });
  };

  const handleRemoveWidget = (widgetId: string) => {
    setBoards((prev) => prev.map((b) => (b.id === activeBoardId ? { ...b, widgets: (b.widgets || []).filter((w) => w.id !== widgetId) } : b)));
  };

  return (
    <ViewLayout title="Dashboard Ganadero Integral" subtitle="Tableros personalizables de sanidad, entore reproductivo, faena y pasturas.">
      <Stack spacing={3}>
        <PendingSiresWidget />

        {/* Holded-Style Pill Buttons Board Manager */}
        <DashboardBoardManager
          boards={boards}
          activeBoardId={activeBoardId}
          onSelectBoard={setActiveBoardId}
          onOpenCreateDialog={() => { setBoardToEdit(null); setIsCreateOpen(true); }}
          onOpenEditDialog={(board) => { setBoardToEdit(board); setIsCreateOpen(true); }}
        />

        {/* Active Board Rendering */}
        {activeBoard?.templateType === 'GENERAL' && (
          <DashboardGeneralPanel
            kpis={kpis}
            quarantineData={MOCK_QUARANTINE_DATA}
            consumptionData={MOCK_CONSUMPTION_DATA}
            deathData={MOCK_DEATH_DATA}
            onActionClick={handleActionClick}
          />
        )}
        {activeBoard?.templateType === 'HEALTH' && <DashboardHealthPanel quarantineData={MOCK_QUARANTINE_DATA} consumptionData={MOCK_CONSUMPTION_DATA} deathData={MOCK_DEATH_DATA} onActionClick={handleActionClick} />}
        {activeBoard?.templateType === 'REPRODUCTIVE' && <DashboardReproductivePanel />}
        {activeBoard?.templateType === 'PASTURE' && <DashboardPasturePanel />}
        {activeBoard?.templateType === 'BLANK' && (
          <DashboardBlankCanvas
            boardName={activeBoard.name}
            widgets={activeBoard.widgets}
            kpis={kpis}
            quarantineData={MOCK_QUARANTINE_DATA}
            consumptionData={MOCK_CONSUMPTION_DATA}
            deathData={MOCK_DEATH_DATA}
            onOpenAddWidget={() => setIsAddWidgetOpen(true)}
            onRemoveWidget={handleRemoveWidget}
            onActionClick={handleActionClick}
          />
        )}
      </Stack>

      {isCreateOpen && (
        <CreateEditBoardDialog
          key={boardToEdit?.id || 'new_board'}
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          boardToEdit={boardToEdit}
          onSaveBoard={handleSaveBoard}
          onDeleteBoard={handleDeleteBoard}
        />
      )}

      {isAddWidgetOpen && (
        <AddWidgetDialog
          open={isAddWidgetOpen}
          onClose={() => setIsAddWidgetOpen(false)}
          onAddWidget={handleAddWidgetToActiveBoard}
          existingWidgetIds={(activeBoard?.widgets || []).map((w) => w.id.split('_')[0])}
        />
      )}
    </ViewLayout>
  );
}

export default DashboardView;
