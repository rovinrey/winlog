import { Router } from 'express';
import { createWinsController } from '../controllers/wins-controller.js';

export function createWinsRouter(service) {
  const router = Router();
  const controller = createWinsController(service);

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.get);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);
  return router;
}
