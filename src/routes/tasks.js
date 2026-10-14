import { Router } from 'express';
import { createTasksController } from '../controllers/tasks-controller.js';

export function createTasksRouter(service) {
  const router = Router();
  const controller = createTasksController(service);

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.get);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);
  return router;
}
