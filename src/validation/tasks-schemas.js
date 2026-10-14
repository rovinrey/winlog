import { z } from 'zod';
import { dateSchema, makeUpdateSchema } from './common-schemas.js';

const taskFields = {
  title: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(2000).default(''),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_on: dateSchema.nullable().default(null)
};

export const createTaskSchema = z.object(taskFields).strict();
export const updateTaskSchema = makeUpdateSchema(z.object({
  title: taskFields.title,
  notes: taskFields.notes,
  status: taskFields.status,
  priority: taskFields.priority,
  due_on: taskFields.due_on
}).strict());

export const taskQuerySchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  due_before: dateSchema.optional(),
  due_after: dateSchema.optional()
}).strict().refine(({ due_before, due_after }) => (
  !due_before || !due_after || due_after <= due_before
), {
  message: '"due_after" must be on or before "due_before"'
});
