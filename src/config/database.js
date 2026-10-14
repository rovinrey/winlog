import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const migrationPath = fileURLToPath(new URL('../db/migrations/001-initial.sql', import.meta.url));

export function resolveDatabasePath(configuredPath = process.env.DATABASE_PATH) {
  if (!configuredPath || configuredPath === ':memory:') {
    return configuredPath ?? resolve(projectRoot, 'data/winlog.sqlite');
  }

  return isAbsolute(configuredPath) ? configuredPath : resolve(projectRoot, configuredPath);
}

export function createDatabase(databasePath = resolveDatabasePath()) {
  if (databasePath !== ':memory:') {
    mkdirSync(dirname(databasePath), { recursive: true });
  }

  const db = new Database(databasePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  db.exec(readFileSync(migrationPath, 'utf8'));
  return db;
}
