import { z } from 'zod';
import type { EntryOrder, StoreEntryOrderPayload } from '@/features/entry-orders/types';

const optionalNumber = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
  z.number({ invalid_type_error: 'Tiene que ser un número' }).nullable()
);

const requiredNumber = (message: string) =>
  z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number({ required_error: message, invalid_type_error: message })
  );

/**
 * The troop of an entry order as the "Alta de Lote Externo" form holds it. The same rules the
 * server applies (EntryTroop), checked here first so the form marks the field before submitting.
 * Whether the category admits the declared sexes is enforced by the form itself, which fixes the
 * composition when the category has a single sex.
 */
export const externalBatchSchema = z
  .object({
    provider_id: requiredNumber('Elegí el proveedor'),
    farm_id: requiredNumber('Elegí el establecimiento'),
    auction_number: z
      .string()
      .trim()
      .max(20, 'Máximo 20 caracteres')
      .regex(/^[A-Za-z0-9]*$/, 'Sólo letras y números'),
    batch_name_mode: z.enum(['AUTO', 'CUSTOM']),
    batch_name: z.string().trim().max(255),
    head_count: requiredNumber('Indicá las cabezas').pipe(z.number().int().min(1, 'Al menos una cabeza')),
    category_id: requiredNumber('Elegí la categoría'),
    sex_composition: z.enum(['MALE', 'FEMALE', 'MIXED'], {
      required_error: 'Indicá el sexo'
    }),
    male_count: optionalNumber,
    female_count: optionalNumber,
    condition: z.enum(['REGULAR', 'GOOD', 'VERY_GOOD', 'EXCELLENT'], {
      required_error: 'Indicá el estado'
    }),
    age_min_months: optionalNumber,
    age_max_months: optionalNumber,
    knows_to_eat: z.boolean({
      required_error: 'Indicá si sabe comer',
      invalid_type_error: 'Indicá si sabe comer'
    }),
    tick_vaccinated: z.boolean({
      required_error: 'Indicá si está vacunada',
      invalid_type_error: 'Indicá si está vacunada'
    }),
    shrink_percent: optionalNumber,
    estimated_weight: requiredNumber('Indicá el peso aproximado').pipe(z.number().positive('Mayor a cero')),
    min_weight: optionalNumber,
    max_weight: optionalNumber,
    purchase_date: z.string().min(1, 'Indicá la fecha de compra'),
    responsable: z.string().trim().max(255),
    observations: z.string().trim().max(2000),
    breeds: z
      .array(
        z.object({
          breed_id: z.number().nullable(),
          color_id: z.number().nullable()
        })
      )
      .min(1, 'Declará al menos una raza')
  })
  .superRefine((data, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

    if (data.batch_name_mode === 'AUTO' && data.auction_number === '') {
      issue('auction_number', 'El nombre automático necesita la terminación de subasta');
    }

    if (data.batch_name_mode === 'CUSTOM' && data.batch_name === '') {
      issue('batch_name', 'Escribí el nombre del lote');
    }

    if (data.sex_composition === 'MIXED') {
      if (!data.male_count || !data.female_count) {
        issue('male_count', 'Indicá cuántos machos y cuántas hembras');
      } else if (data.male_count + data.female_count !== data.head_count) {
        issue('male_count', `Machos y hembras suman ${data.male_count + data.female_count}, no ${data.head_count}`);
      }
    }

    if ((data.age_min_months == null) !== (data.age_max_months == null)) {
      issue('age_max_months', 'Cargá los dos extremos del rango, o ninguno');
    } else if (data.age_min_months != null && data.age_max_months != null && data.age_min_months > data.age_max_months) {
      issue('age_max_months', 'La máxima no puede ser menor que la mínima');
    }

    if (data.min_weight != null && data.min_weight > data.estimated_weight) {
      issue('min_weight', 'No puede superar al aproximado');
    }

    if (data.max_weight != null && data.max_weight < data.estimated_weight) {
      issue('max_weight', 'No puede ser menor que el aproximado');
    }

    if (data.shrink_percent != null && (data.shrink_percent < 0 || data.shrink_percent >= 100)) {
      issue('shrink_percent', 'Entre 0 y 100');
    }

    const pairs = new Set<string>();

    data.breeds.forEach((line, index) => {
      if (line.breed_id == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['breeds', index, 'breed_id'],
          message: 'Elegí la raza'
        });
        return;
      }

      const pair = `${line.breed_id}:${line.color_id ?? '-'}`;

      if (pairs.has(pair)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['breeds', index, 'color_id'],
          message: 'Raza y pelaje repetidos'
        });
      }

      pairs.add(pair);
    });
  });

export type ExternalBatchFormInput = z.input<typeof externalBatchSchema>;
export type ExternalBatchFormValues = z.output<typeof externalBatchSchema>;

const today = (): string => new Date().toISOString().slice(0, 10);

export const emptyExternalBatchForm = (): ExternalBatchFormInput => ({
  provider_id: undefined,
  farm_id: undefined,
  auction_number: '',
  batch_name_mode: 'AUTO',
  batch_name: '',
  head_count: undefined,
  category_id: undefined,
  sex_composition: undefined as unknown as 'MALE',
  male_count: null,
  female_count: null,
  condition: undefined as unknown as 'GOOD',
  age_min_months: null,
  age_max_months: null,
  knows_to_eat: undefined as unknown as boolean,
  tick_vaccinated: undefined as unknown as boolean,
  shrink_percent: null,
  estimated_weight: undefined,
  min_weight: null,
  max_weight: null,
  purchase_date: today(),
  responsable: '',
  observations: '',
  breeds: [{ breed_id: null, color_id: null }]
});

/** A draft back into the form, to keep editing it. */
export const formFromOrder = (order: EntryOrder): ExternalBatchFormInput => ({
  provider_id: order.provider.id,
  farm_id: order.farm.id,
  auction_number: order.auction_number ?? '',
  batch_name_mode: order.batch_name_mode,
  batch_name: order.batch_name_mode === 'CUSTOM' ? order.batch_name : '',
  head_count: order.head_count,
  category_id: order.category.id,
  sex_composition: order.sex_composition,
  male_count: order.male_count,
  female_count: order.female_count,
  condition: order.condition,
  age_min_months: order.age_min_months,
  age_max_months: order.age_max_months,
  knows_to_eat: order.knows_to_eat,
  tick_vaccinated: order.tick_vaccinated,
  shrink_percent: order.shrink_percent,
  estimated_weight: order.estimated_weight,
  min_weight: order.min_weight,
  max_weight: order.max_weight,
  purchase_date: order.purchase_date,
  responsable: order.responsable ?? '',
  observations: order.observations ?? '',
  breeds: order.breeds.map((b) => ({
    breed_id: b.breed_id,
    color_id: b.color_id
  }))
});

export const toEntryOrderPayload = (values: ExternalBatchFormValues): Omit<StoreEntryOrderPayload, 'confirm'> => {
  const mixed = values.sex_composition === 'MIXED';
  const text = (value: string) => (value === '' ? null : value);

  return {
    provider_id: values.provider_id,
    farm_id: values.farm_id,
    auction_number: text(values.auction_number),
    batch_name_mode: values.batch_name_mode,
    batch_name: values.batch_name_mode === 'CUSTOM' ? values.batch_name : null,
    head_count: values.head_count,
    category_id: values.category_id,
    sex_composition: values.sex_composition,
    male_count: mixed ? values.male_count : null,
    female_count: mixed ? values.female_count : null,
    condition: values.condition,
    age_min_months: values.age_min_months,
    age_max_months: values.age_max_months,
    knows_to_eat: values.knows_to_eat,
    tick_vaccinated: values.tick_vaccinated,
    shrink_percent: values.shrink_percent,
    estimated_weight: values.estimated_weight,
    min_weight: values.min_weight,
    max_weight: values.max_weight,
    purchase_date: values.purchase_date,
    responsable: text(values.responsable),
    observations: text(values.observations),
    breeds: values.breeds.map((b) => ({
      breed_id: b.breed_id as number,
      color_id: b.color_id
    }))
  };
};
