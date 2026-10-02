import { useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import type { Dest01Row } from '../components/scan/types';

export interface Dest01SourceBatchShare {
  id: number;
  name: string;
  count: number;
}

export interface Dest01SourceBatch {
  /**
   * single: every calf with a batch sits in the same one. mixed: they sit in several.
   * unknown: no calf read is in a batch (or the animals are still loading).
   */
  status: 'single' | 'mixed' | 'unknown';
  /** The batch, when it is only one. */
  batch: { id: number; name: string } | null;
  /** Calves per batch, largest first. */
  distribution: Dest01SourceBatchShare[];
  /** Distinct tags read on the rows. */
  calves: number;
  /** Calves that exist but sit in no batch. */
  withoutBatch: number;
  /** Tags the system does not know. */
  notFound: number;
  /** The paper names a batch that is not the one the calves are in. */
  writtenDiffers: boolean;
  /** What goes to the movement notes as "Lote de origen". */
  noteName: string;
}

const normalize = (name: string): string => name.trim().replace(/\s+/g, ' ').toLowerCase();

/**
 * The batch the calves of a DEST-01 leave from, by where each calf sits today.
 *
 * Not a guess: the batch of every tag is a fact the system records, and the backend moves each
 * calf out of that batch whatever the header says. The handwritten "Lote de Cría (Origen)" is
 * only a note, so when the calves share one batch that batch is the note; when they sit in
 * several, the paper's text stays and the screen shows how they are spread.
 */
export function useDest01SourceBatch(rows: Dest01Row[], writtenName: string): Dest01SourceBatch {
  const { activeCompanyId } = useCompany();
  const { data: caravans = [], isLoading } = useCaravans(activeCompanyId, 'own');

  const byTag = useMemo(
    () => new Map(caravans.map((c) => [c.identification.trim().toUpperCase(), c])),
    [caravans]
  );

  return useMemo(() => {
    const tags = [...new Set(rows.map((r) => r.caravana.trim().toUpperCase()).filter((tag) => tag !== ''))];
    const shares = new Map<number, Dest01SourceBatchShare>();
    let withoutBatch = 0;
    let notFound = 0;

    tags.forEach((tag) => {
      const caravan = byTag.get(tag);

      if (!caravan) {
        notFound += 1;
        return;
      }
      if (caravan.batch_id === null || caravan.batch_id <= 0) {
        withoutBatch += 1;
        return;
      }

      const share = shares.get(caravan.batch_id) ?? { id: caravan.batch_id, name: caravan.batch_name ?? `Lote #${caravan.batch_id}`, count: 0 };
      share.count += 1;
      shares.set(caravan.batch_id, share);
    });

    const distribution = [...shares.values()].sort((a, b) => b.count - a.count);
    const status: Dest01SourceBatch['status'] =
      isLoading || distribution.length === 0 ? 'unknown' : distribution.length === 1 ? 'single' : 'mixed';
    const batch = status === 'single' ? { id: distribution[0].id, name: distribution[0].name } : null;
    const written = writtenName.trim();

    return {
      status,
      batch,
      distribution: status === 'unknown' ? [] : distribution,
      calves: tags.length,
      withoutBatch,
      notFound,
      writtenDiffers: batch !== null && written !== '' && normalize(written) !== normalize(batch.name),
      noteName:
        batch !== null
          ? batch.name
          : written !== ''
            ? written
            : status === 'mixed'
              ? distribution.map((share) => share.name).join(', ')
              : '',
    };
  }, [rows, writtenName, byTag, isLoading]);
}
