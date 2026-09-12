import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useDiagnosticProtocols } from '@/features/gestation/hooks/useVeterinaryProtocols';
import { RegisterDiagnosticProtocolDialog } from '../components/dialogs/RegisterDiagnosticProtocolDialog';
import { ProtocolDetailDialog } from '../components/dialogs/ProtocolDetailDialog';
import { DiagnosticProtocolsSummaryCards } from '../components/diagnostic-protocols/DiagnosticProtocolsSummaryCards';
import {
  DiagnosticProtocolsFilterBar,
  DiagnosticFilterStatus,
  DiagnosticFilterChannel,
} from '../components/diagnostic-protocols/DiagnosticProtocolsFilterBar';
import { DiagnosticProtocolsTable } from '../components/diagnostic-protocols/DiagnosticProtocolsTable';

/**
 * Registry of the evidentiary documents backing sanitary certification and bull fertility.
 * Acts as a thin orchestrator (Container) delegating to modular presentational subcomponents.
 */
export const DiagnosticProtocolsView: React.FC = () => {
  const navigate = useNavigate();
  const { data: protocols = [], isLoading, error } = useDiagnosticProtocols();

  // Local interactive filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DiagnosticFilterStatus>('ALL');
  const [channelFilter, setChannelFilter] = useState<DiagnosticFilterChannel>('ALL');

  // Dialog states
  const [wizardOpen, setWizardOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  // Dynamic counts for segmented badges
  const counts = useMemo(() => {
    let verified = 0;
    let unverified = 0;
    let positives = 0;
    let voided = 0;
    let portal = 0;
    let digitized = 0;

    protocols.forEach((p) => {
      if (p.status === 'VOIDED') {
        voided++;
      } else if (p.verification_status === 'VERIFIED') {
        verified++;
      } else if (p.verification_status === 'UNVERIFIED') {
        unverified++;
      }

      if ((p.positive_findings_count || 0) > 0) {
        positives++;
      }

      if (p.source_channel === 'PORTAL_VET') {
        portal++;
      } else if (p.source_channel === 'OWNER_DIGITIZED') {
        digitized++;
      }
    });

    return {
      total: protocols.length,
      verified,
      unverified,
      positives,
      voided,
      portal,
      digitized,
    };
  }, [protocols]);

  // Filtered protocols list
  const filteredProtocols = useMemo(() => {
    return protocols.filter((protocol) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNumber = protocol.protocol_number?.toLowerCase().includes(query);
        const matchesVet =
          protocol.signed_veterinarian_name?.toLowerCase().includes(query) ||
          protocol.veterinarian_name?.toLowerCase().includes(query);
        const matchesLab =
          protocol.analysing_institution?.nombre?.toLowerCase().includes(query) ||
          protocol.reporting_institution?.nombre?.toLowerCase().includes(query) ||
          // ADR-39: un acta también nombra su institución, así que también se busca por ella.
          protocol.act_institution?.nombre?.toLowerCase().includes(query);
        const matchesObs = protocol.observations?.toLowerCase().includes(query);

        if (!matchesNumber && !matchesVet && !matchesLab && !matchesObs) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter === 'VERIFIED') {
        if (protocol.status === 'VOIDED' || protocol.verification_status !== 'VERIFIED') {
          return false;
        }
      } else if (statusFilter === 'UNVERIFIED') {
        if (protocol.status === 'VOIDED' || protocol.verification_status !== 'UNVERIFIED') {
          return false;
        }
      } else if (statusFilter === 'POSITIVES') {
        if ((protocol.positive_findings_count || 0) <= 0) {
          return false;
        }
      } else if (statusFilter === 'VOIDED') {
        if (protocol.status !== 'VOIDED') {
          return false;
        }
      }

      // 3. Channel Filter
      if (channelFilter !== 'ALL' && protocol.source_channel !== channelFilter) {
        return false;
      }

      return true;
    });
  }, [protocols, searchQuery, statusFilter, channelFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setChannelFilter('ALL');
  };

  return (
    <ViewLayout
      title="Protocolos Diagnósticos"
      subtitle="Evidencia documental de laboratorio y sanidad reproductiva de la torada"
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            onClick={() => navigate('/gestation/veterinary-portal')}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:link</FuseSvgIcon>}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '6px',
              px: 2,
            }}
          >
            Accesos del veterinario
          </Button>
          <Button
            variant="contained"
            onClick={() => setWizardOpen(true)}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:document-plus</FuseSvgIcon>}
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              px: 3,
              fontWeight: 700,
              borderRadius: '6px',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Digitalizar protocolo
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2.5}>
        {/* KPI Metric Cards */}
        <DiagnosticProtocolsSummaryCards protocols={protocols} />

        {/* Loading / Error States */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ borderRadius: '8px' }}>
            Ocurrió un error al cargar los protocolos diagnósticos. Por favor, reintente.
          </Alert>
        )}

        {!isLoading && !error && (
          <Stack spacing={2}>
            {/* Search and Segmented Filter Bar */}
            <DiagnosticProtocolsFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              channelFilter={channelFilter}
              onChannelFilterChange={setChannelFilter}
              totalCount={counts.total}
              verifiedCount={counts.verified}
              unverifiedCount={counts.unverified}
              positivesCount={counts.positives}
              voidedCount={counts.voided}
              portalCount={counts.portal}
              digitizedCount={counts.digitized}
              onResetFilters={handleResetFilters}
            />

            {/* High-Fidelity DataTable */}
            <DiagnosticProtocolsTable
              protocols={filteredProtocols}
              onViewDetail={(id) => setDetailId(id)}
            />
          </Stack>
        )}
      </Stack>

      {/* Modal Dialogs */}
      <RegisterDiagnosticProtocolDialog open={wizardOpen} onClose={() => setWizardOpen(false)} />
      <ProtocolDetailDialog protocolId={detailId} onClose={() => setDetailId(null)} />
    </ViewLayout>
  );
};

export default DiagnosticProtocolsView;
