import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Box, Stack, CircularProgress, Alert } from '@mui/material';
import { useSnackbar } from 'notistack';
import ViewLayout from 'src/components/ViewLayout';
import { usePreServiceBulls } from '@/features/gestation/hooks/usePreServiceBulls';
import { useRegisterEvaluationSheet } from '@/features/gestation/hooks/useBullEvaluationSheet';
import {
  useIssueVeterinaryPortalToken,
  useVeterinarians,
  useVeterinaryPortalTokens,
} from '@/features/gestation/hooks/useVeterinaryProtocols';
import { BullEvaluationSheetTable } from './BullEvaluationSheetTable';
import { BullEvaluationRowData } from './BullEvaluationSheetRow';
import { SheetProfessionalHeader, SheetHeaderValues } from './SheetProfessionalHeader';
import { SheetCloseDialog, SheetCloseValues } from './SheetCloseDialog';
import { SheetSummaryBar } from './SheetSummaryBar';
import { SheetEmptyState } from './SheetEmptyState';
import { SheetActionsBar } from './SheetActionsBar';
import { PortalAccessIssuedBanner } from '../../veterinary-portal/access/PortalAccessIssuedBanner';
import { IssuedPortalToken } from '@/core/veterinary/domain/VeterinaryTypes';

interface Props {
  /** Caravans chosen in the triage listing. The sheet works on these and only these. */
  selectedIds: number[];
  /** Back to the listing, clearing the stage from the URL. */
  onExit: () => void;
}

/**
 * Stage 2 of pre-service: the chute sheet.
 *
 * It is deliberately NOT a standalone page. The sheet emits an act with legal weight, so the set
 * of animals it covers must always be an explicit, deliberate choice — never a default. Reaching
 * it without a selection shows an empty state, not the whole troop.
 */
export const BullEvaluationSheetStage: React.FC<Props> = ({ selectedIds, onExit }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { data: bulls = [], isLoading: isLoadingBulls } = usePreServiceBulls();
  const { data: veterinarians = [] } = useVeterinarians();
  const registerSheet = useRegisterEvaluationSheet();
  const issueToken = useIssueVeterinaryPortalToken();
  const { data: activeGrants = [] } = useVeterinaryPortalTokens(true);

  const [rows, setRows] = useState<BullEvaluationRowData[]>([]);
  const [closeOpen, setCloseOpen] = useState(false);
  // The plaintext link exists only in the response that mints it: only its hash is stored. If it
  // is not shown here it is gone, and recovering it means reissuing the grant.
  const [issuedAccess, setIssuedAccess] = useState<IssuedPortalToken | null>(null);
  const [header, setHeader] = useState<SheetHeaderValues>({
    veterinarian_id: '',
    evaluation_date: new Date().toISOString().split('T')[0],
    sample_round: 1,
  });

  // Stable identity of the selection, so changing it re-seeds the sheet instead of leaving stale
  // rows behind. The previous implementation seeded once and never looked again.
  const selectionKey = useMemo(() => [...selectedIds].sort((a, b) => a - b).join(','), [selectedIds]);

  useEffect(() => {
    if (bulls.length === 0 || selectedIds.length === 0) {
      setRows([]);
      return;
    }

    const targetBulls = bulls.filter((b) => selectedIds.includes(b.caravan_id));

    setRows(
      targetBulls.map((b, idx) => {
        const hasPendingScrape = b.lab_samples?.some(
          (s) => s.sample_type === 'PREPUCE_SCRAPE' && s.status === 'PENDING_RESULTS'
        );
        const hasPendingBlood = b.lab_samples?.some(
          (s) => s.sample_type === 'BLOOD_SEROLOGY' && s.status === 'PENDING_RESULTS'
        );

        return {
          caravan_id: b.caravan_id,
          caravan_number: b.caravan_number,
          initial_status: b.status,
          scrotal_circumference: b.scrotal_circumference_cm ? String(b.scrotal_circumference_cm) : '',
          body_condition_score: b.body_condition_score ? String(b.body_condition_score) : '3.5',
          libido: b.libido || 'MEDIA',
          aplomo_notes: b.aplomo_notes || 'Aplomos correctos, sin afecciones.',
          prepuce_scrape: hasPendingScrape ?? false,
          prepuce_scrape_tube: `R-01-${String(idx + 1).padStart(2, '0')}`,
          blood_serology: hasPendingBlood ?? false,
          blood_serology_tube: `S-01-${String(idx + 1).padStart(2, '0')}`,
          observations: b.observations || '',
        };
      })
    );
    // selectionKey, not selectedIds: a new array with the same ids must not wipe edited rows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulls, selectionKey]);

  const handleChangeRow = (caravanId: number, field: keyof BullEvaluationRowData, value: unknown) =>
    setRows((prev) => prev.map((r) => (r.caravan_id === caravanId ? { ...r, [field]: value } : r)));

  const handleRemoveRow = (caravanId: number) =>
    setRows((prev) => prev.filter((r) => r.caravan_id !== caravanId));

  const handleApplyBatchValue = (field: keyof BullEvaluationRowData, value: unknown) => {
    setRows((prev) => prev.map((r) => ({ ...r, [field]: value })));
    enqueueSnackbar(`Valor aplicado a los ${rows.length} toros de la planilla.`, { variant: 'info' });
  };

  const handleHeaderChange = useCallback(
    (field: keyof SheetHeaderValues, value: string | number) =>
      setHeader((prev) => ({ ...prev, [field]: value })),
    []
  );


  const selectedVet = veterinarians.find((v) => v.id === header.veterinarian_id);

  /**
   * ADR-34: a live grant that already opens every act of this professional. Minting a second one
   * would hand another credential to somebody who can already get in — more secrets around, none
   * of them easier to revoke.
   */
  const standingGrant = useMemo(
    () =>
      activeGrants.find(
        (grant) =>
          grant.veterinarian_id === header.veterinarian_id &&
          grant.is_usable &&
          !grant.is_scoped_to_act &&
          grant.batch_id === null
      ),
    [activeGrants, header.veterinarian_id]
  );

  const tubesCount = rows.reduce(
    (acc, r) => acc + (r.prepuce_scrape ? 1 : 0) + (r.blood_serology ? 1 : 0),
    0
  );

  // A drawn tube with no label cannot be matched back to the animal when the laboratory reports.
  const untaggedTubes = rows.filter(
    (r) => (r.prepuce_scrape && !r.prepuce_scrape_tube) || (r.blood_serology && !r.blood_serology_tube)
  );


  const canClose = rows.length > 0 && header.veterinarian_id !== '' && untaggedTubes.length === 0;

  const handleConfirmClose = async (values: SheetCloseValues) => {
    try {
      const act = await registerSheet.mutateAsync({
        veterinarian_id: Number(header.veterinarian_id),
        evaluation_date: header.evaluation_date,
        sample_round: header.sample_round,
        // ADR-39: la institución es opcional; sin nombre no se manda nada en lugar de mandar
        // un objeto vacío que el backend tendría que interpretar.
        institution: values.institution.nombre.trim() ? values.institution : null,
        destination_plan: values.destination_plan,
        dispatch_note_number: values.dispatch_note_number || null,
        dispatched_at: values.dispatched_at || null,
        observations: values.observations || null,
        bulls: rows.map((row) => ({
          caravan_id: row.caravan_id,
          scrotal_circumference_cm: row.scrotal_circumference ? parseFloat(row.scrotal_circumference) : null,
          body_condition_score: row.body_condition_score ? parseFloat(row.body_condition_score) : null,
          libido: row.libido,
          aplomo_notes: row.aplomo_notes || null,
          observations: row.observations || null,
          prepuce_scrape: row.prepuce_scrape,
          prepuce_scrape_tube: row.prepuce_scrape ? row.prepuce_scrape_tube : null,
          blood_serology: row.blood_serology,
          blood_serology_tube: row.blood_serology ? row.blood_serology_tube : null,
        })),
      });

      setCloseOpen(false);
      enqueueSnackbar(`Acta ${act.protocol_number} emitida. Falta la firma del profesional.`, {
        variant: 'success',
      });

      // ADR-23: the act is DELIVERED for signature; the system never waits for the professional
      // to stumble upon it. The old branch redirected the producer to a portal their session
      // cannot open, so the dialog it was supposed to raise never appeared.
      if (values.signature_delivery === 'SIGNATURE_LINK') {
        // The professional already holds a standing key: say so instead of cutting another one.
        if (values.signature_link_scope === 'STANDING' && standingGrant) {
          enqueueSnackbar(
            `${selectedVet?.name ?? 'El profesional'} ya tiene un acceso vigente hasta el ${standingGrant.expires_at}, que abre esta acta. No se emitió un enlace nuevo.`,
            { variant: 'info' }
          );

          onExit();
          return;
        }

        const issued = await deliverSignatureLink(act.id, values);

        // Stay on the screen while the only copy of the link is on it. Leaving now would strand
        // an act nobody can reach, and the fix would be reissuing a grant that already exists.
        if (issued?.token?.access_url) {
          setIssuedAccess(issued);
          return;
        }
      } else {
        enqueueSnackbar(
          `${selectedVet?.name ?? 'El profesional'} ya la tiene en su bandeja del portal para firmar.`,
          { variant: 'info' }
        );
      }

      onExit();
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error al emitir el acta de manga.';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  /**
   * ADR-16 / ADR-23: a grant scoped to this one act, valid for 72 hours (§11.7). If it expires
   * before the professional signs, it is reissued; an act nobody ever signs is voided with a
   * reason, never reassigned to somebody else.
   */
  const deliverSignatureLink = async (
    actId: number,
    values: SheetCloseValues
  ): Promise<IssuedPortalToken | null> => {
    const recipientEmail = values.recipient_email.trim();
    const isStanding = values.signature_link_scope === 'STANDING';

    try {
      const issued = await issueToken.mutateAsync({
        veterinarian_id: Number(header.veterinarian_id),
        // ADR-16: narrowed to this act unless the operator deliberately widened it to the
        // professional's standing access.
        diagnostic_protocol_id: isStanding ? null : actId,
        ttl_hours: isStanding ? 24 * 30 : 72,
        max_uses: null,
        label: isStanding
          ? 'Acceso del profesional — todas sus actas'
          : 'Firma de acta de manga',
        send_email: recipientEmail !== '',
        recipient_email: recipientEmail || null,
      });

      if (issued.email.sent) {
        enqueueSnackbar(
          `Enlace enviado a ${issued.email.recipient}. Vence el ${issued.token.expires_at}.`,
          { variant: 'success' }
        );
      }

      return issued;
    } catch (error: unknown) {
      // The act exists and is correct; only its delivery failed. Saying so plainly beats
      // implying the whole close went wrong.
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'El acta se emitió, pero no se pudo generar el enlace de firma. Genérelo desde accesos temporales.';
      enqueueSnackbar(msg, { variant: 'error' });

      return null;
    }
  };

  const handleCopyAccessUrl = async () => {
    if (!issuedAccess?.token.access_url) return;

    await navigator.clipboard.writeText(issuedAccess.token.access_url);
    enqueueSnackbar('Enlace copiado al portapapeles.', { variant: 'success' });
  };

  const layoutProps = {
    title: 'Planilla de Evaluación Andrológica en Manga',
    subtitle:
      'Biometría, condición corporal y muestreo biológico. Al cerrarla se emite un acta de extracción a nombre del profesional actuante.',
  };

  if (isLoadingBulls) {
    return (
      <ViewLayout {...layoutProps}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </ViewLayout>
    );
  }

  // No selection: the sheet refuses to invent one.
  if (selectedIds.length === 0) {
    return (
      <ViewLayout {...layoutProps}>
        <SheetEmptyState onGoToListing={onExit} />
      </ViewLayout>
    );
  }

  return (
    <ViewLayout
      {...layoutProps}
      actions={
        <SheetActionsBar
          rowsCount={rows.length}
          canClose={canClose}
          isSaving={registerSheet.isPending}
          onPrintTemplate={() => navigate('/work-templates/TOR-01')}
          onChangeSelection={onExit}
          onClose={() => setCloseOpen(true)}
        />
      }
    >
      <Stack spacing={2.5}>
        {issuedAccess && (
          <PortalAccessIssuedBanner
            issued={issuedAccess}
            onCopy={handleCopyAccessUrl}
            onDismiss={() => {
              setIssuedAccess(null);
              onExit();
            }}
          />
        )}

        <SheetProfessionalHeader
          values={header}
          onChange={handleHeaderChange}
          disabled={registerSheet.isPending}
        />


        {untaggedTubes.length > 0 && (
          <Alert severity="error" sx={{ borderRadius: '8px' }}>
            {untaggedTubes.length} {untaggedTubes.length === 1 ? 'fila tiene' : 'filas tienen'} un tubo
            marcado sin número. Sin rótulo la muestra no puede vincularse al animal cuando vuelva del
            laboratorio.
          </Alert>
        )}

        <SheetSummaryBar rows={rows} tubesCount={tubesCount} />

        <BullEvaluationSheetTable
          rows={rows}
          onChangeRow={handleChangeRow}
          onRemoveRow={handleRemoveRow}
          onApplyBatchValue={handleApplyBatchValue}
        />
      </Stack>

      <SheetCloseDialog
        open={closeOpen}
        onClose={() => setCloseOpen(false)}
        onConfirm={handleConfirmClose}
        isSaving={registerSheet.isPending}
        bullsCount={rows.length}
        tubesCount={tubesCount}
        veterinarianName={selectedVet?.name}
        // ADR-23: no portal account means no inbox, so the act can only travel as a link.
        hasPortalAccount={Boolean(selectedVet?.user_id)}
        professionalEmail={selectedVet?.email}
        standingGrantExpiresAt={standingGrant?.expires_at ?? null}
      />
    </ViewLayout>
  );
};

export default BullEvaluationSheetStage;
