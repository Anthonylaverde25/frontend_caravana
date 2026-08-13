import { Caravan } from '../entities/Caravan';

export type AncestryLevel = '0G_FOUNDER' | '1G_PARENTS' | '2G_GRANDPARENTS' | '3G_COMPLETE';

export type InbreedingRisk = 'OPTIMAL' | 'VERY_LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface AncestorRef {
  id: number;
  identification: string;
  category?: string | null;
  breed?: string | null;
}

export interface PedigreeRecord {
  id: number;
  caravan: Caravan;
  identification: string;
  sex: 'M' | 'H' | null;
  category: string;
  breed: string;
  batchName: string;
  father: AncestorRef | null;
  mother: AncestorRef | null;
  paternalGrandsire: AncestorRef | null; // Abuelo Paterno (PGS)
  paternalGranddam: AncestorRef | null;  // Abuela Paterna (PGD)
  maternalGrandsire: AncestorRef | null; // Abuelo Materno (MGS)
  maternalGranddam: AncestorRef | null;  // Abuela Materna (MGD)
  treeDepth: number;
  depthLabel: string;
  inbreedingCoefficient: number; // e.g. 0, 6.25, 12.5, 25.0
  inbreedingRisk: InbreedingRisk;
  inbreedingRiskLabel: string;
  commonAncestors: string[];
  offspringCount: number;
  sireIdentificationMethod?: string | null;
  sireNotes?: string | null;
}

export interface MatingSimulationResult {
  dam: AncestorRef;
  sire: AncestorRef;
  projectedInbreeding: number; // percentage
  risk: InbreedingRisk;
  riskLabel: string;
  commonAncestors: string[];
  agronomicRecommendation: {
    status: 'RECOMMENDED' | 'CAUTION' | 'REJECT';
    title: string;
    description: string;
    bibliographicNote: string;
  };
}

/**
 * Traverses ancestors up to maxDepth and returns map of ancestor ID -> array of path lengths from root.
 * Protected against genealogical loops and cycles.
 */
function getAncestorPaths(
  rootId: number | null | undefined,
  caravansMap: Map<number, Caravan>,
  maxDepth = 4
): Map<number, number[]> {
  const ancestorPaths = new Map<number, number[]>();
  if (!rootId) return ancestorPaths;

  function traverse(currentId: number, currentDepth: number, visitedBranch: Set<number>) {
    if (currentDepth > maxDepth) return;
    if (visitedBranch.has(currentId)) return; // Prevent any loop in this branch

    const nextBranch = new Set(visitedBranch);
    nextBranch.add(currentId);

    const current = caravansMap.get(currentId);
    if (!current || !current.lineage) return;

    const { father_id, mother_id } = current.lineage;

    if (father_id && father_id !== currentId) {
      const paths = ancestorPaths.get(father_id) || [];
      paths.push(currentDepth + 1);
      ancestorPaths.set(father_id, paths);
      traverse(father_id, currentDepth + 1, nextBranch);
    }

    if (mother_id && mother_id !== currentId) {
      const paths = ancestorPaths.get(mother_id) || [];
      paths.push(currentDepth + 1);
      ancestorPaths.set(mother_id, paths);
      traverse(mother_id, currentDepth + 1, nextBranch);
    }
  }

  traverse(rootId, 0, new Set());
  return ancestorPaths;
}

/**
 * Calculates Wright's Inbreeding Coefficient (Fx) between maternal and paternal lines.
 * Formula: Fx = Sum ( (1/2)^(n1 + n2 + 1) )
 */
export function calculateWrightInbreeding(
  damId: number | null | undefined,
  sireId: number | null | undefined,
  caravansMap: Map<number, Caravan>
): { fx: number; commonAncestors: string[] } {
  if (!damId || !sireId) {
    return { fx: 0, commonAncestors: [] };
  }

  // Direct parent-offspring check (e.g. Sire is Father of Dam -> Fx = 25%)
  if (damId === sireId) {
    return { fx: 50, commonAncestors: [caravansMap.get(damId)?.identification || `#${damId}`] };
  }

  const damObj = caravansMap.get(damId);
  const sireObj = caravansMap.get(sireId);

  // Check if sire is father of dam (Padre x Hija) -> Fx = 25%
  if (damObj?.lineage?.father_id === sireId) {
    return {
      fx: 25.0,
      commonAncestors: [sireObj?.identification || `#${sireId}`]
    };
  }

  // Check if dam is mother of sire (Madre x Hijo) -> Fx = 25%
  if (sireObj?.lineage?.mother_id === damId) {
    return {
      fx: 25.0,
      commonAncestors: [damObj?.identification || `#${damId}`]
    };
  }

  const damAncestors = getAncestorPaths(damId, caravansMap);
  const sireAncestors = getAncestorPaths(sireId, caravansMap);

  let totalFx = 0;
  const commonNames: string[] = [];

  for (const [ancestorId, damPaths] of damAncestors.entries()) {
    const sirePaths = sireAncestors.get(ancestorId);
    if (sirePaths && sirePaths.length > 0) {
      const ancestorObj = caravansMap.get(ancestorId);
      const name = ancestorObj ? `#${ancestorObj.identification}` : `ID:${ancestorId}`;
      if (!commonNames.includes(name)) {
        commonNames.push(name);
      }

      for (const dPath of damPaths) {
        for (const sPath of sirePaths) {
          totalFx += Math.pow(0.5, dPath + sPath + 1);
        }
      }
    }
  }

  const fxPercentage = Math.round(totalFx * 10000) / 100; // e.g. 12.5%
  return {
    fx: Math.min(fxPercentage, 100),
    commonAncestors: commonNames
  };
}

export interface CommonAncestorContribution {
  ancestorId: number;
  identification: string;
  category?: string;
  breed?: string;
  sex?: 'M' | 'H';
  paternalPaths: number[];
  maternalPaths: number[];
  paternalDesc: string;
  maternalDesc: string;
  contributionPercent: number;
}

export interface CaravanInbreedingDetail {
  fx: number;
  risk: InbreedingRisk;
  riskLabel: string;
  isExogamous: boolean;
  commonAncestors: CommonAncestorContribution[];
  summaryExplanation: string;
  zootechnicalVerdict: {
    status: 'RECOMMENDED' | 'CAUTION' | 'REJECT';
    title: string;
    description: string;
    fieldAction: string;
    bibliographicNote: string;
  };
}

/**
 * Returns a detailed analytical breakdown of the inbreeding of a specific caravan,
 * identifying all common ancestors, genealogical loops, and agronomic recommendations.
 */
export function analyzeCaravanInbreedingDetail(
  caravan: Caravan,
  caravansMap: Map<number, Caravan>
): CaravanInbreedingDetail {
  const fatherId = caravan.lineage?.father_id;
  const motherId = caravan.lineage?.mother_id;

  if (!fatherId || !motherId) {
    return {
      fx: 0,
      risk: 'OPTIMAL',
      riskLabel: '0.0% — Sin endogamia registrada',
      isExogamous: true,
      commonAncestors: [],
      summaryExplanation: 'El animal no cuenta con ambos progenitores registrados en el sistema, por lo que se asume exogamia.',
      zootechnicalVerdict: {
        status: 'RECOMMENDED',
        title: 'Línea de Base Genealógica',
        description: 'Animal con registro de linaje parcial o fundador de rodeo. No se detecta parentesco cercano.',
        fieldAction: 'Apto para entore general o IATF.',
        bibliographicNote: 'Jorge Carrillo (INTA Balcarce), Manejo de un Rodeo de Cría, Cap. XV.'
      }
    };
  }

  const sireAncestors = getAncestorPaths(fatherId, caravansMap);
  const damAncestors = getAncestorPaths(motherId, caravansMap);

  let totalFx = 0;
  const contributions: CommonAncestorContribution[] = [];

  for (const [ancestorId, dPaths] of damAncestors.entries()) {
    const sPaths = sireAncestors.get(ancestorId);
    if (sPaths && sPaths.length > 0) {
      const ancestorObj = caravansMap.get(ancestorId);
      const ident = ancestorObj ? ancestorObj.identification : `ID:${ancestorId}`;

      let ancestorContribution = 0;
      for (const dPath of dPaths) {
        for (const sPath of sPaths) {
          ancestorContribution += Math.pow(0.5, dPath + sPath + 1);
        }
      }

      totalFx += ancestorContribution;

      const formatDepth = (depths: number[]) => {
        return depths
          .map((d) => (d === 1 ? 'Padre/Madre (1ª Gen)' : d === 2 ? 'Abuelo/a (2ª Gen)' : d === 3 ? 'Bisabuelo/a (3ª Gen)' : `${d}ª Gen`))
          .join(' y ');
      };

      contributions.push({
        ancestorId,
        identification: ident,
        category: ancestorObj?.category,
        breed: ancestorObj?.breed,
        sex: ancestorObj?.sex,
        paternalPaths: sPaths,
        maternalPaths: dPaths,
        paternalDesc: formatDepth(sPaths),
        maternalDesc: formatDepth(dPaths),
        contributionPercent: Math.round(ancestorContribution * 10000) / 100
      });
    }
  }

  // Sort descending by contribution
  contributions.sort((a, b) => b.contributionPercent - a.contributionPercent);

  const fxPercentage = Math.min(Math.round(totalFx * 10000) / 100, 100);
  const { risk, label: riskLabel } = classifyInbreedingRisk(fxPercentage);
  const isExogamous = fxPercentage === 0;

  let summaryExplanation = '';
  if (isExogamous) {
    summaryExplanation = `Exogamia completa: Las líneas del padre (#${caravansMap.get(fatherId)?.identification || fatherId}) y de la madre (#${caravansMap.get(motherId)?.identification || motherId}) no comparten ningún ancestro común conocido. Se aprovecha el 100% del vigor híbrido (heterosis).`;
  } else {
    const topAncestors = contributions.map((c) => `#${c.identification} (+${c.contributionPercent}%)`).join(', ');
    summaryExplanation = `Consanguinidad del ${fxPercentage}% originada por la repetición de ${contributions.length} ancestro(s) común(es) en ambas ramas parentales: ${topAncestors}.`;
  }

  let status: 'RECOMMENDED' | 'CAUTION' | 'REJECT' = 'RECOMMENDED';
  let title = 'Apareamiento Exogámico Seguro';
  let description = 'Cruce óptimo sin depresión endogámica. Maximiza la heterosis y fertilidad.';
  let fieldAction = 'Animal apto para reproducción, reposición de vientres o retención de toros.';

  if (risk === 'CRITICAL') {
    status = 'REJECT';
    title = 'Depresión Endogámica Crítica (Alto Riesgo)';
    description = `Consanguinidad excesiva (${fxPercentage}% > 12.5%). Alta probabilidad de homocigosis de alelos deletéreos recesivos, merma en peso al destete (-8 a -18 kg) y caída en la tasa de preñez.`;
    fieldAction = 'NO RETENER COMO REPRODUCTOR. Se aconseja castración y destino exclusivo a engorde para faena.';
  } else if (risk === 'HIGH') {
    status = 'REJECT';
    title = 'Alerta de Endogamia Alta';
    description = `Parentesco cercano (${fxPercentage}% entre 6.25% y 12.5%). Se desaconseja para cría de reposición.`;
    fieldAction = 'Separar de los lotes de servicio de toros emparentados o enviar a engorde.';
  } else if (risk === 'MODERATE') {
    status = 'CAUTION';
    title = 'Endogamia Moderada (Precaución)';
    description = `Parentesco equivalente a primos hermanos (${fxPercentage}%). Aceptable para rodeo general, no recomendado para cabaña de pedigree pura.`;
    fieldAction = 'Monitorear los servicios futuros para alternar con reproductores exogámicos.';
  }

  return {
    fx: fxPercentage,
    risk,
    riskLabel,
    isExogamous,
    commonAncestors: contributions,
    summaryExplanation,
    zootechnicalVerdict: {
      status,
      title,
      description,
      fieldAction,
      bibliographicNote: 'Dr. Jorge Carrillo (INTA Balcarce), Manejo de un Rodeo de Cría, Cap. XV y XVI.'
    }
  };
}

export function classifyInbreedingRisk(fx: number): {
  risk: InbreedingRisk;
  label: string;
} {
  if (fx === 0) {
    return { risk: 'OPTIMAL', label: '0.0% — Óptimo (Exogamia)' };
  }
  if (fx <= 3.125) {
    return { risk: 'VERY_LOW', label: `${fx}% — Muy Bajo (Seguro)` };
  }
  if (fx <= 6.25) {
    return { risk: 'MODERATE', label: `${fx}% — Moderado (Primos)` };
  }
  if (fx <= 12.5) {
    return { risk: 'HIGH', label: `${fx}% — Alto (Medio Hermanos)` };
  }
  return { risk: 'CRITICAL', label: `${fx}% — Crítico (Endogamia Severa)` };
}

/**
 * Builds the complete Pedigree Record for a given caravan.
 */
export function buildPedigreeRecord(
  caravan: Caravan,
  caravansMap: Map<number, Caravan>,
  childrenMap: Map<number, number[]>
): PedigreeRecord {
  const lineage = caravan.lineage;

  const fatherId = lineage?.father_id || null;
  const motherId = lineage?.mother_id || null;

  const fatherObj = fatherId ? caravansMap.get(fatherId) : null;
  const motherObj = motherId ? caravansMap.get(motherId) : null;

  const fatherRef: AncestorRef | null = fatherObj
    ? { id: fatherObj.id, identification: fatherObj.identification, category: fatherObj.category, breed: fatherObj.breed }
    : lineage?.father_identification
    ? { id: fatherId || 0, identification: lineage.father_identification }
    : null;

  const motherRef: AncestorRef | null = motherObj
    ? { id: motherObj.id, identification: motherObj.identification, category: motherObj.category, breed: motherObj.breed }
    : lineage?.mother_identification
    ? { id: motherId || 0, identification: lineage.mother_identification }
    : null;

  // Resolve Paternal Grandparents (Parents of Father)
  const pgsId = fatherObj?.lineage?.father_id || null;
  const pgdId = fatherObj?.lineage?.mother_id || null;
  const pgsObj = pgsId ? caravansMap.get(pgsId) : null;
  const pgdObj = pgdId ? caravansMap.get(pgdId) : null;

  const paternalGrandsire: AncestorRef | null = pgsObj
    ? { id: pgsObj.id, identification: pgsObj.identification, category: pgsObj.category, breed: pgsObj.breed }
    : fatherObj?.lineage?.father_identification
    ? { id: pgsId || 0, identification: fatherObj.lineage.father_identification }
    : null;

  const paternalGranddam: AncestorRef | null = pgdObj
    ? { id: pgdObj.id, identification: pgdObj.identification, category: pgdObj.category, breed: pgdObj.breed }
    : fatherObj?.lineage?.mother_identification
    ? { id: pgdId || 0, identification: fatherObj.lineage.mother_identification }
    : null;

  // Resolve Maternal Grandparents (Parents of Mother)
  const mgsId = motherObj?.lineage?.father_id || null;
  const mgdId = motherObj?.lineage?.mother_id || null;
  const mgsObj = mgsId ? caravansMap.get(mgsId) : null;
  const mgdObj = mgdId ? caravansMap.get(mgdId) : null;

  const maternalGrandsire: AncestorRef | null = mgsObj
    ? { id: mgsObj.id, identification: mgsObj.identification, category: mgsObj.category, breed: mgsObj.breed }
    : motherObj?.lineage?.father_identification
    ? { id: mgsId || 0, identification: motherObj.lineage.father_identification }
    : null;

  const maternalGranddam: AncestorRef | null = mgdObj
    ? { id: mgdObj.id, identification: mgdObj.identification, category: mgdObj.category, breed: mgdObj.breed }
    : motherObj?.lineage?.mother_identification
    ? { id: mgdId || 0, identification: motherObj.lineage.mother_identification }
    : null;

  // Determine tree depth level
  let treeDepth = 0;
  let depthLabel = '0G — Fundador / Sin datos';

  const hasParents = fatherRef !== null || motherRef !== null;
  const hasGrandparents = paternalGrandsire !== null || paternalGranddam !== null || maternalGrandsire !== null || maternalGranddam !== null;

  if (hasGrandparents) {
    // Check for 3G
    const hasGreatGrandparents =
      (pgsObj?.lineage?.father_id != null || pgsObj?.lineage?.mother_id != null) ||
      (mgsObj?.lineage?.father_id != null || mgsObj?.lineage?.mother_id != null);
    if (hasGreatGrandparents) {
      treeDepth = 3;
      depthLabel = '3G+ — Árbol Completo';
    } else {
      treeDepth = 2;
      depthLabel = '2G — Abuelos conocidos';
    }
  } else if (hasParents) {
    treeDepth = 1;
    depthLabel = '1G — Padres conocidos';
  }

  // Calculate Inbreeding Fx
  const { fx, commonAncestors } = calculateWrightInbreeding(motherId, fatherId, caravansMap);
  const { risk, label: inbreedingRiskLabel } = classifyInbreedingRisk(fx);

  const offspring = childrenMap.get(caravan.id) || [];

  return {
    id: caravan.id,
    caravan,
    identification: caravan.identification,
    sex: caravan.sex,
    category: caravan.category || 'Sin Categoría',
    breed: caravan.breed || 'Sin Raza',
    batchName: caravan.batch_name || 'Sin Lote',
    father: fatherRef,
    mother: motherRef,
    paternalGrandsire,
    paternalGranddam,
    maternalGrandsire,
    maternalGranddam,
    treeDepth,
    depthLabel,
    inbreedingCoefficient: fx,
    inbreedingRisk: risk,
    inbreedingRiskLabel,
    commonAncestors,
    offspringCount: offspring.length,
    sireIdentificationMethod: lineage?.sire_identification_method,
    sireNotes: lineage?.sire_notes,
  };
}

/**
 * Simulates a mating between a female (Dam) and male (Sire).
 * Evaluates projected calf inbreeding and gives veterinary agronomic guidance.
 */
export function simulateMating(
  damId: number,
  sireId: number,
  caravansMap: Map<number, Caravan>
): MatingSimulationResult | null {
  const dam = caravansMap.get(damId);
  const sire = caravansMap.get(sireId);

  if (!dam || !sire) return null;

  const { fx, commonAncestors } = calculateWrightInbreeding(damId, sireId, caravansMap);
  const { risk, label } = classifyInbreedingRisk(fx);

  let recommendation: MatingSimulationResult['agronomicRecommendation'];

  if (fx === 0) {
    recommendation = {
      status: 'RECOMMENDED',
      title: 'Apareamiento Altamente Recomendado (Máxima Heterosis)',
      description: 'No se detectan ancestros comunes entre el vientre y el reproductor. Este cruce maximiza el vigor híbrido, optimizando el peso al destete y la fertilidad de las futuras vaquillonas.',
      bibliographicNote: 'Ref: Carrillo, Cap. XVI "Empleo de Cruzamientos para Aumentar la Eficiencia del Rodeo de Cría", pp. 181-184.'
    };
  } else if (fx <= 3.125) {
    recommendation = {
      status: 'RECOMMENDED',
      title: 'Apareamiento Seguro (Consanguinidad Muy Baja)',
      description: 'El grado de parentesco es lejano (primos segundos o superior). Es un apareamiento compatible y seguro para rodeo general y reposición.',
      bibliographicNote: 'Ref: Carrillo, Cap. XV "Manejo del Rodeo en Servicio y Reposición de Toros", pp. 172.'
    };
  } else if (fx <= 6.25) {
    recommendation = {
      status: 'CAUTION',
      title: 'Precaución: Consanguinidad Moderada',
      description: 'Parentesco equivalente a primos hermanos. Se recomienda utilizar los machos resultantes para engorde y evaluar cuidadosamente si se guardan hembras para reposición.',
      bibliographicNote: 'Ref: Carrillo, Cap. XVI pp. 182.'
    };
  } else if (fx <= 12.5) {
    recommendation = {
      status: 'REJECT',
      title: 'Alerta: Alto Riesgo de Depresión Endogámica',
      description: 'Parentesco estrecho (medio hermanos o abuelo x nieta). Existe riesgo comprobado de disminución en peso al nacimiento, menor viabilidad y problemas de fertilidad en las hijas.',
      bibliographicNote: 'Ref: Carrillo, Cap. XV pp. 172-174.'
    };
  } else {
    recommendation = {
      status: 'REJECT',
      title: 'Peligro Crítico: Apareamiento No Permitido',
      description: 'Consanguinidad severa (cruce padre x hija o hermanos enteros). Conlleva alta tasa de defectos congénitos, pérdidas embrionarias y merma severa en la ganancia de peso.',
      bibliographicNote: 'Ref: Carrillo, Cap. XV y XVI.'
    };
  }

  return {
    dam: { id: dam.id, identification: dam.identification, category: dam.category, breed: dam.breed },
    sire: { id: sire.id, identification: sire.identification, category: sire.category, breed: sire.breed },
    projectedInbreeding: fx,
    risk,
    riskLabel: label,
    commonAncestors,
    agronomicRecommendation: recommendation,
  };
}

export interface SireKinshipRelation {
  bullA: Caravan;
  bullB: Caravan;
  relationshipType: 'FULL_BROTHERS' | 'HALF_BROTHERS_PATERNAL' | 'HALF_BROTHERS_MATERNAL' | 'SHARED_ANCESTORS';
  relationshipLabel: string;
  sharedAncestors: string[];
  description: string;
  progenyImpact: string;
}

/**
 * Evaluates genetic kinship between bulls selected in a multi-sire or rotation battery.
 * Identifies full brothers, paternal/maternal half brothers, and common ancestors,
 * alerting the producer about the genetic relationship of the resulting progeny.
 */
export function detectSireBatteryKinship(
  selectedSireIds: number[],
  caravansMap: Map<number, Caravan>
): SireKinshipRelation[] {
  const relations: SireKinshipRelation[] = [];
  if (selectedSireIds.length < 2) return relations;

  for (let i = 0; i < selectedSireIds.length; i++) {
    for (let j = i + 1; j < selectedSireIds.length; j++) {
      const bullA = caravansMap.get(selectedSireIds[i]);
      const bullB = caravansMap.get(selectedSireIds[j]);

      if (!bullA || !bullB) continue;

      const fatherA = bullA.lineage?.father_id;
      const motherA = bullA.lineage?.mother_id;
      const fatherB = bullB.lineage?.father_id;
      const motherB = bullB.lineage?.mother_id;

      const hasBothParentsA = fatherA && motherA;
      const hasBothParentsB = fatherB && motherB;

      // Check Full Brothers
      if (hasBothParentsA && hasBothParentsB && fatherA === fatherB && motherA === motherB) {
        const fatherIdent = caravansMap.get(fatherA)?.identification || `#${fatherA}`;
        const motherIdent = caravansMap.get(motherA)?.identification || `#${motherA}`;
        relations.push({
          bullA,
          bullB,
          relationshipType: 'FULL_BROTHERS',
          relationshipLabel: 'Hermanos Enteros (Mismos Padres)',
          sharedAncestors: [`Padre: #${fatherIdent}`, `Madre: #${motherIdent}`],
          description: `Los toros #${bullA.identification} y #${bullB.identification} son hermanos enteros (hijos de #${fatherIdent} y #${motherIdent}). Comparten el 50% de sus genes.`,
          progenyImpact:
            'Los terneros nacidos de ambos toros en este lote serán primos hermanos genéticos (comparten 25% de carga genética). Si se guardan vaquillonas de reposición, no deberán aparearse en el futuro con toros de esta misma línea.'
        });
        continue;
      }

      // Check Paternal Half Brothers
      if (fatherA && fatherB && fatherA === fatherB) {
        const fatherIdent = caravansMap.get(fatherA)?.identification || `#${fatherA}`;
        relations.push({
          bullA,
          bullB,
          relationshipType: 'HALF_BROTHERS_PATERNAL',
          relationshipLabel: 'Medio Hermanos Paternos (Mismo Padre)',
          sharedAncestors: [`Padre: #${fatherIdent}`],
          description: `Los toros #${bullA.identification} y #${bullB.identification} son medio hermanos paternos (ambos hijos del reproductor #${fatherIdent}). Comparten el 25% de sus genes.`,
          progenyImpact:
            'La progenie de este lote compartirá la misma línea paterna ancestral. Se deberá prever rotación con toros exogámicos para la futura reposición de vaquillonas (Carrillo, Cap. XV).'
        });
        continue;
      }

      // Check Maternal Half Brothers
      if (motherA && motherB && motherA === motherB) {
        const motherIdent = caravansMap.get(motherA)?.identification || `#${motherA}`;
        relations.push({
          bullA,
          bullB,
          relationshipType: 'HALF_BROTHERS_MATERNAL',
          relationshipLabel: 'Medio Hermanos Maternos (Misma Madre)',
          sharedAncestors: [`Madre: #${motherIdent}`],
          description: `Los toros #${bullA.identification} y #${bullB.identification} son medio hermanos maternos (ambos hijos de la vaca #${motherIdent}). Comparten el 25% de sus genes.`,
          progenyImpact: `La progenie compartirá la línea materna ancestral de la vaca #${motherIdent}.`
        });
        continue;
      }

      // Check General Shared Ancestors (Grandparents, etc.) via path analysis
      const ancestorsA = getAncestorPaths(bullA.id, caravansMap, 3);
      const ancestorsB = getAncestorPaths(bullB.id, caravansMap, 3);
      const shared: string[] = [];

      for (const ancId of ancestorsA.keys()) {
        if (ancestorsB.has(ancId)) {
          const ancObj = caravansMap.get(ancId);
          shared.push(ancObj ? `#${ancObj.identification}` : `ID:${ancId}`);
        }
      }

      if (shared.length > 0) {
        relations.push({
          bullA,
          bullB,
          relationshipType: 'SHARED_ANCESTORS',
          relationshipLabel: 'Líneas Emparentadas (Ancestros Comunes)',
          sharedAncestors: shared,
          description: `Los toros #${bullA.identification} y #${bullB.identification} comparten ancestro(s) común(es): ${shared.join(', ')}.`,
          progenyImpact:
            'Existe homogeneidad genética parcial entre los reproductores seleccionados. Se aconseja monitorear el pedigree de los terneros resultantes.'
        });
      }
    }
  }

  return relations;
}

