import { createTasksRepository } from '../repositories/tasks-repository.js';

export function createTasksService(db) {
  const repository = createTasksRepository(db);

  return {
    list: (filters) => repository.list(filters),
    get(id) {
      return repository.findById.get(id);
    },
    create: (values) => repository.create(values),
    update: (id, values) => repository.update(id, values),
    delete: (id) => repository.delete(id)
  };
}
