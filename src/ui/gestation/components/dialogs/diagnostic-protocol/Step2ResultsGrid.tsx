import React, { useMemo } from 'react';
import {
  Alert,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { LabSampleStatus, SampleType } from '@/core/veterinary/domain/VeterinaryTypes';
import { PathogenColumnHeader } from './PathogenColumnHeader';
import { GridBull, GridPathogen, ResultsGridRow } from './ResultsGridRow';
import { ResultsGridBulkToolbar } from './ResultsGridBulkToolbar';

interface Step2ResultsGridProps {
  bulls: GridBull[];
  pathogens: GridPathogen[];
  search: string;
  onSearchChange: (value: string) => void;
  sampleType: SampleType;
  onSampleTypeChange: (value: SampleType) => void;
  sampleRound: number;
  onSampleRoundChange: (value: number) => void;
  selectedIds: number[];
  onToggleSelected: (caravanId: number) => void;
  onSelectAll: (visibleIds: number[]) => void;
  results: Record<string, LabSampleStatus>;
  onResultChange: (caravanId: number, pathogenId: number, status: LabSampleStatus) => void;
  onApplyPreset: (status: LabSampleStatus, visibleIds: number[]) => void;
  tubeNumbers: Record<number, string>;
  onTubeNumberChange: (caravanId: number, value: string) => void;
}

/**
 * Step 2 — the troop grid. Kept presentational on purpose: every piece of state lives in the
 * orchestrator dialog, and the heavy sub-parts are separate components (AGENT.md 3.A).
 */
export const Step2ResultsGrid: React.FC<Step2ResultsGridProps> = ({
  bulls,
  pathogens,
  search,
  onSearchChange,
  sampleType,
  onSampleTypeChange,
  sampleRound,
  onSampleRoundChange,
  selectedIds,
  onToggleSelected,
  onSelectAll,
  results,
  onResultChange,
  onApplyPreset,
  tubeNumbers,
  onTubeNumberChange,
}) => {
  const visibleBulls = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (query === '') return bulls;

    return bulls.filter((bull) => bull.identification.toLowerCase().includes(query));
  }, [bulls, search]);

  const visibleIds = useMemo(() => visibleBulls.map((bull) => bull.id), [visibleBulls]);

  const positiveCount = useMemo(
    () =>
      selectedIds.reduce((total, caravanId) => {
        const hasPositive = pathogens.some(
          (pathogen) => results[`${caravanId}:${pathogen.id}`] === 'POSITIVE_DETECTED'
        );
        return hasPositive ? total + 1 : total;
      }, 0),
    [selectedIds, pathogens, results]
  );

  return (
    <Box>
      <ResultsGridBulkToolbar
        search={search}
        onSearchChange={onSearchChange}
        sampleType={sampleType}
        onSampleTypeChange={onSampleTypeChange}
        sampleRound={sampleRound}
        onSampleRoundChange={onSampleRoundChange}
        selectedCount={selectedIds.length}
        totalCount={bulls.length}
        positiveCount={positiveCount}
        onSelectAll={() => onSelectAll(visibleIds)}
        onApplyPreset={(status) => onApplyPreset(status, visibleIds)}
      />

      {pathogens.length === 0 && (
        <Alert severity="warning" sx={{ fontSize: '0.8rem', py: 0.5, mb: 1.5 }}>
          No hay patógenos venéreos en el catálogo. Cargue el catálogo de patógenos antes de
          transcribir determinaciones.
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420, borderRadius: '8px' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell sx={{ fontWeight: 700 }}>Caravana</TableCell>
              {pathogens.map((pathogen) => (
                <PathogenColumnHeader
                  key={pathogen.id}
                  name={pathogen.name}
                  code={pathogen.code}
                  isDisqualifying={pathogen.is_disqualifying}
                />
              ))}
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Tubo
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {visibleBulls.map((bull) => (
              <ResultsGridRow
                key={bull.id}
                bull={bull}
                pathogens={pathogens}
                selected={selectedIds.includes(bull.id)}
                onToggleSelected={onToggleSelected}
                results={results}
                onResultChange={onResultChange}
                tubeNumber={tubeNumbers[bull.id] ?? ''}
                onTubeNumberChange={onTubeNumberChange}
              />
            ))}

            {visibleBulls.length === 0 && (
              <TableRow>
                <TableCell colSpan={pathogens.length + 3} align="center" sx={{ py: 3 }}>
                  No hay reproductores que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Step2ResultsGrid;
