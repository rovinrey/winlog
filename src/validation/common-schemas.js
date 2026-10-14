import { z } from 'zod';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}, 'Expected a valid date in YYYY-MM-DD format');

export const idSchema = z.coerce.number().int().positive();
export const optionalDateSchema = dateSchema.nullable();
export { dateSchema };

export function makeUpdateSchema(schema) {
  return schema.partial().refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update'
  });
}
