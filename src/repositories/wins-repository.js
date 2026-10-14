export function createWinsRepository(db) {
  const insert = db.prepare(`
    INSERT INTO wins (title, notes, won_on, created_at, updated_at)
    VALUES (@title, @notes, @won_on, @created_at, @updated_at)
  `);
  const findById = db.prepare('SELECT * FROM wins WHERE id = ?');
  const remove = db.prepare('DELETE FROM wins WHERE id = ?');

  return {
    list(filters = {}) {
      const conditions = [];
      const params = {};

      if (filters.from) {
        conditions.push('won_on >= @from');
        params.from = filters.from;
      }
      if (filters.to) {
        conditions.push('won_on <= @to');
        params.to = filters.to;
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      return db.prepare(`
        SELECT * FROM wins ${where}
        ORDER BY won_on DESC, id DESC LIMIT 500
      `).all(params);
    },
    findById,
    create(values) {
      const result = insert.run(values);
      return findById.get(result.lastInsertRowid);
    },
    update(id, values) {
      const fields = Object.keys(values);
      const assignments = fields.map((field) => `${field} = @${field}`);
      assignments.push('updated_at = @updated_at');
      db.prepare(`UPDATE wins SET ${assignments.join(', ')} WHERE id = @id`)
        .run({ ...values, id, updated_at: new Date().toISOString() });
      return findById.get(id);
    },
    delete(id) {
      return remove.run(id).changes > 0;
    }
  };
}
