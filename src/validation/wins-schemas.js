import { z } from 'zod';
import { dateSchema, makeUpdateSchema } from './common-schemas.js';

export const winFields = {
  title: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(2000).default(''),
  won_on: dateSchema
};

export const createWinSchema = z.object(winFields).strict();
export const updateWinSchema = makeUpdateSchema(z.object({
  title: winFields.title,
  notes: winFields.notes,
  won_on: winFields.won_on
}).strict());

export const winQuerySchema = z.object({
  from: dateSchema.optional(),
  to: dateSchema.optional()
}).strict().refine(({ from, to }) => !from || !to || from <= to, {
  message: '"from" must be on or before "to"'
});
