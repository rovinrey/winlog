import { idSchema } from '../validation/common-schemas.js';
import { createTaskSchema, taskQuerySchema, updateTaskSchema } from '../validation/tasks-schemas.js';

export function createTasksController(service) {
  return {
    list(req, res) {
      res.json({ data: service.list(taskQuerySchema.parse(req.query)) });
    },
    get(req, res) {
      const task = service.get(idSchema.parse(req.params.id));
      if (!task) return res.status(404).json({ error: 'Task not found' });
      return res.json({ data: task });
    },
    create(req, res) {
      const task = service.create(createTaskSchema.parse(req.body));
      return res.status(201).json({ data: task });
    },
    update(req, res) {
      const id = idSchema.parse(req.params.id);
      const values = updateTaskSchema.parse(req.body);
      const task = service.update(id, values);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      return res.json({ data: task });
    },
    delete(req, res) {
      const deleted = service.delete(idSchema.parse(req.params.id));
      if (!deleted) return res.status(404).json({ error: 'Task not found' });
      return res.status(204).end();
    }
  };
}
