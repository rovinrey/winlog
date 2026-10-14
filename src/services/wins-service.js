import { createWinsRepository } from '../repositories/wins-repository.js';

export function createWinsService(db) {
  const repository = createWinsRepository(db);

  return {
    list: (filters) => repository.list(filters),
    get(id) {
      return repository.findById.get(id);
    },
    create(values) {
      const now = new Date().toISOString();
      return repository.create({ ...values, created_at: now, updated_at: now });
    },
    update: (id, values) => repository.update(id, values),
    delete: (id) => repository.delete(id)
  };
}
