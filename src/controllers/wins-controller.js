import { idSchema } from '../validation/common-schemas.js';
import { createWinSchema, updateWinSchema, winQuerySchema } from '../validation/wins-schemas.js';

export function createWinsController(service) {
  return {
    list(req, res) {
      res.json({ data: service.list(winQuerySchema.parse(req.query)) });
    },
    get(req, res) {
      const win = service.get(idSchema.parse(req.params.id));
      if (!win) return res.status(404).json({ error: 'Win not found' });
      return res.json({ data: win });
    },
    create(req, res) {
      const win = service.create(createWinSchema.parse(req.body));
      return res.status(201).json({ data: win });
    },
    update(req, res) {
      const id = idSchema.parse(req.params.id);
      const values = updateWinSchema.parse(req.body);
      const win = service.update(id, values);
      if (!win) return res.status(404).json({ error: 'Win not found' });
      return res.json({ data: win });
    },
    delete(req, res) {
      const deleted = service.delete(idSchema.parse(req.params.id));
      if (!deleted) return res.status(404).json({ error: 'Win not found' });
      return res.status(204).end();
    }
  };
}
