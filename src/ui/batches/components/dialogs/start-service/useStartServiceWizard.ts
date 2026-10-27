import { useEffect, useMemo, useState } from 'react';
import { isBreedingCandidate } from '@/core/caravans/domain/rules/isBreedingCandidate';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import type { StartBatchServicePayload } from '@/features/batches/hooks/useStartBatchService';

export type ServiceMethod = 'NATURAL' | 'AI';

const NATURAL_STEPS = ['Vientres del Lote', 'Selección de Torada', 'Parámetros del Servicio'];
const AI_STEPS = ['Vientres y semen', 'Fecha y observaciones'];

const isFemale = (c: Caravan) => c.sex === 'H' || (c.sex as string) === 'F' || (c.sex as string) === 'HEMBRA';
const isMale = (c: Caravan) => c.sex === 'M' || (c.sex as string) === 'MACHO';
const today = () => new Date().toISOString().split('T')[0];

/**
 * State of "Iniciar servicio" (semen S-B, DB12): the method picks the steps. A natural service keeps
 * its three steps; an AI one has two, picks females one by one and plans the semen of each.
 */
export function useStartServiceWizard(open: boolean, batchId: number | undefined, allCaravans: Caravan[]) {
  const [method, setMethod] = useState<ServiceMethod>('NATURAL');
  const [activeStep, setActiveStep] = useState(0);
  const [isControlledService, setIsControlledService] = useState(false);
  const [selectedFemaleIds, setSelectedFemaleIds] = useState<number[]>([]);
  const [selectedMaleIds, setSelectedMaleIds] = useState<number[]>([]);
  const [plannedSemen, setPlannedSemen] = useState<Record<number, number | null>>({});
  const [femaleSearch, setFemaleSearch] = useState('');
  const [maleSearch, setMaleSearch] = useState('');
  const [plannedStartDate, setPlannedStartDate] = useState(today());
  const [plannedEndDate, setPlannedEndDate] = useState(() => {
    const end = new Date();
    end.setDate(end.getDate() + 90);
    return end.toISOString().split('T')[0];
  });
  const [serviceType, setServiceType] = useState<'single' | 'multi' | 'rotation'>('multi');
  const [observations, setObservations] = useState('');

  const isAi = method === 'AI';
  const picksIndividually = isAi || isControlledService;
  const steps = isAi ? AI_STEPS : NATURAL_STEPS;

  // Females of the batch: the empty ones are serviceable, the pregnant ones stay out.
  const batchFemales = useMemo(() => (batchId ? allCaravans.filter((c) => c.batch_id === batchId && isFemale(c)) : []), [allCaravans, batchId]);
  const serviceableFemales = useMemo(() => batchFemales.filter((c) => !c.active_gestation && isBreedingCandidate(c)), [batchFemales]);
  const availableMales = useMemo(() => allCaravans.filter((c) => isMale(c) && isBreedingCandidate(c)), [allCaravans]);

  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setMethod('NATURAL');
      setIsControlledService(false);
      setPlannedSemen({});
    }
  }, [open, batchId]);

  // Every serviceable female starts selected; picking one by one leaves out the excluded ones.
  useEffect(() => {
    setSelectedFemaleIds(serviceableFemales.filter((c) => c.is_breeding_eligible).map((c) => c.id!));
  }, [serviceableFemales]);

  useEffect(() => {
    if (selectedMaleIds.length === 1) setServiceType('single');
    else if (selectedMaleIds.length > 1 && serviceType === 'single') setServiceType('multi');
  }, [selectedMaleIds.length, serviceType]);

  const changeMethod = (next: ServiceMethod) => {
    setMethod(next);
    setActiveStep(0);
  };

  const exposedCount = picksIndividually ? selectedFemaleIds.length : serviceableFemales.length;

  /** Straws the new order will expect per semen: one per selected female with that semen planned. */
  const plannedStraws = useMemo(() => {
    const straws: Record<number, number> = {};
    selectedFemaleIds.forEach((id) => {
      const itemId = plannedSemen[id];
      if (itemId) straws[itemId] = (straws[itemId] ?? 0) + 1;
    });
    return straws;
  }, [plannedSemen, selectedFemaleIds]);

  // The primary button is never disabled for missing data: it validates on click.
  const stepError = (): string | null => {
    if (activeStep === 0 && exposedCount === 0) return 'No hay vientres vacíos para el servicio.';
    if (!isAi && activeStep === 1 && selectedMaleIds.length === 0) return 'Seleccioná al menos un toro.';
    if (activeStep === steps.length - 1 && !plannedStartDate) return 'Indicá la fecha de inicio del servicio.';
    return null;
  };

  const payload = (): StartBatchServicePayload =>
    isAi
      ? {
          service_method: 'AI',
          male_caravan_ids: [],
          selected_female_caravan_ids: selectedFemaleIds,
          planned_semen: selectedFemaleIds.map((id) => ({ female_caravan_id: id, item_id: plannedSemen[id] ?? null })).filter((p) => p.item_id !== null),
          planned_start_date: plannedStartDate,
          observations,
        }
      : {
          male_caravan_ids: selectedMaleIds,
          is_controlled_service: isControlledService,
          selected_female_caravan_ids: isControlledService ? selectedFemaleIds : undefined,
          planned_start_date: plannedStartDate,
          planned_end_date: plannedEndDate,
          service_type: serviceType,
          observations,
        };

  return {
    method, changeMethod, isAi, picksIndividually, steps, activeStep, setActiveStep,
    isControlledService, setIsControlledService, selectedFemaleIds, setSelectedFemaleIds,
    selectedMaleIds, setSelectedMaleIds, plannedSemen, setPlannedSemen, plannedStraws,
    femaleSearch, setFemaleSearch, maleSearch, setMaleSearch,
    plannedStartDate, setPlannedStartDate, plannedEndDate, setPlannedEndDate,
    serviceType, setServiceType, observations, setObservations,
    serviceableFemales, availableMales, pregnantCount: batchFemales.length - serviceableFemales.length,
    exposedCount, stepError, payload,
  };
}

export type StartServiceWizard = ReturnType<typeof useStartServiceWizard>;
