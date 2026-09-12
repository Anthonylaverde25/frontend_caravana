import { ProtocolLabSample } from '@/core/veterinary/domain/VeterinaryTypes';

/**
 * One physical tube, and every agent it is cultured for.
 *
 * `bull_lab_samples` holds one row per DETERMINATION, not per tube: a preputial scrape is cultured
 * for both venereal agents, and the aptitude engine counts negative rounds per agent, so
 * "negative to trichomonas, positive to campylobacter" has to be representable. That is why one
 * scrape produces two rows sharing a tube number.
 *
 * Correct in the database, wrong on screen — the person signing sees the tube in their hand, so
 * the register groups back to it and names the agents together.
 */
export interface TubeGroup {
  key: string;
  caravanLabel: string;
  sampleType: string;
  tubeNumber: string | null;
  sampleRound: number;
  /** Every agent this one tube resolves. */
  agents: string[];
  determinationCount: number;
}

export function groupSamplesByTube(samples: ProtocolLabSample[]): TubeGroup[] {
  const groups = new Map<string, TubeGroup>();

  samples.forEach((sample) => {
    const agent = sample.pathogen_name ?? sample.pathogen_code ?? null;

    // Without a tube number there is nothing safe to group ON, so such a row stands alone rather
    // than being merged with an unrelated sample that also lacks one.
    const key = sample.tube_number
      ? `${sample.caravan_id}|${sample.sample_type}|${sample.sample_round}|${sample.tube_number}`
      : `sample-${sample.id}`;

    const existing = groups.get(key);

    if (existing) {
      if (agent && !existing.agents.includes(agent)) {
        existing.agents.push(agent);
      }
      existing.determinationCount += 1;
      return;
    }

    groups.set(key, {
      key,
      caravanLabel: String(sample.caravan_number ?? sample.caravan_id),
      sampleType: sample.sample_type,
      tubeNumber: sample.tube_number ?? null,
      sampleRound: sample.sample_round,
      agents: agent ? [agent] : [],
      determinationCount: 1,
    });
  });

  return Array.from(groups.values());
}

/** How many physical tubes the act put in the professional's hands. */
export function countPhysicalTubes(samples: ProtocolLabSample[]): number {
  return groupSamplesByTube(samples).length;
}
