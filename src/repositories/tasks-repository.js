export function createTasksRepository(db) {
  const findById = db.prepare('SELECT * FROM tasks WHERE id = ?');
  const insert = db.prepare(`
    INSERT INTO tasks (
      title, notes, status, priority, due_on, completed_at, created_at, updated_at
    )
    VALUES (
      @title, @notes, @status, @priority, @due_on, @completed_at, @created_at, @updated_at
    )
  `);

  return {
    list(filters = {}) {
      const conditions = [];
      const params = {};

      if (filters.status) {
        conditions.push('status = @status');
        params.status = filters.status;
      }
      if (filters.due_after) {
        conditions.push('due_on >= @due_after');
        params.due_after = filters.due_after;
      }
      if (filters.due_before) {
        conditions.push('due_on <= @due_before');
        params.due_before = filters.due_before;
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      return db.prepare(`
        SELECT * FROM tasks ${where}
        ORDER BY
          CASE status WHEN 'todo' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END,
          CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
          due_on IS NULL, due_on ASC, id DESC
        LIMIT 500
      `).all(params);
    },
    findById,
    create(values) {
      const now = new Date().toISOString();
      const result = insert.run({
        ...values,
        completed_at: values.status === 'done' ? now : null,
        created_at: now,
        updated_at: now
      });
      return findById.get(result.lastInsertRowid);
    },
    update(id, values) {
      const current = findById.get(id);
      if (!current) return undefined;

      const nextStatus = values.status ?? current.status;
      const updates = { ...values };
      if (values.status !== undefined) {
        updates.completed_at = nextStatus === 'done'
          ? (current.status === 'done' ? current.completed_at : new Date().toISOString())
          : null;
      }

      const fields = Object.keys(updates);
      const assignments = fields.map((field) => `${field} = @${field}`);
      assignments.push('updated_at = @updated_at');
      db.prepare(`UPDATE tasks SET ${assignments.join(', ')} WHERE id = @id`)
        .run({ ...updates, id, updated_at: new Date().toISOString() });
      return findById.get(id);
    },
    delete(id) {
      return db.prepare('DELETE FROM tasks WHERE id = ?').run(id).changes > 0;
    }
  };
}
