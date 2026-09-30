export interface PastedCaravanMatch {
  /** The animals of the batch the pasted text names, once each. */
  matchedIds: number[];
  /** What was pasted and is not an animal of the batch, as it was written. */
  notFound: string[];
}

const normalize = (tag: string): string => tag.trim().toUpperCase();

/**
 * Crosses a pasted list of caravans against the animals of the source batch.
 *
 * One per line, or separated by commas, semicolons, tabs or spaces — whatever a spreadsheet or
 * a WhatsApp message gives. Case does not matter; repeats count once.
 */
export function matchPastedCaravans(
  text: string,
  caravans: { id: number; identification: string }[]
): PastedCaravanMatch {
  const idByTag = new Map(caravans.map((caravan) => [normalize(caravan.identification), caravan.id]));
  const matched = new Set<number>();
  const notFound = new Map<string, string>();

  text
    .split(/[\s,;]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .forEach((token) => {
      const id = idByTag.get(normalize(token));

      if (id != null) matched.add(id);
      else if (!notFound.has(normalize(token))) notFound.set(normalize(token), token);
    });

  return { matchedIds: [...matched], notFound: [...notFound.values()] };
}
