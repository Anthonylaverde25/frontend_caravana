import type { Breed, BreedColor } from '@/core/breeds/domain/entities/Breed';

/** A breed of the catalog with the coats (pelajes) it admits, as the review offers them. */
export interface Par01BreedOption {
  id: number;
  name: string;
  colors: BreedColor[];
}

/** Accents, case and anything but letters and digits aside: how the server matches a written name. */
export const normalizeCatalogName = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

export const toBreedOptions = (breeds: Breed[]): Par01BreedOption[] =>
  breeds.map((b) => ({ id: Number(b.id), name: b.name, colors: b.colors ?? [] }));

export const findBreed = (breeds: Par01BreedOption[], name: string): Par01BreedOption | undefined => {
  const key = normalizeCatalogName(name);

  return key ? breeds.find((b) => normalizeCatalogName(b.name) === key) : undefined;
};

/** Every coat of the catalog, once: what a calf without a breed can have. */
export const allCoats = (breeds: Par01BreedOption[]): BreedColor[] => {
  const byId = new Map<number, BreedColor>();
  breeds.forEach((b) => b.colors.forEach((c) => byId.set(c.id, c)));

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
};

/** A coat by its name or its code (NE, CO…), as the server finds it. */
export const findCoat = (coats: BreedColor[], text: string): BreedColor | undefined => {
  const key = normalizeCatalogName(text);

  return key ? coats.find((c) => normalizeCatalogName(c.name) === key || (c.code ? normalizeCatalogName(c.code) === key : false)) : undefined;
};
