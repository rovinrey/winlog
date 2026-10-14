import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { startTestServer } from './helpers.js';

let app;

before(async () => {
  app = await startTestServer();
});

after(async () => {
  await app.close();
});

test('creates a task with defaults and filters by status', async () => {
  const response = await fetch(`${app.baseUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Write tests' })
  });
  const created = await response.json();
  assert.equal(response.status, 201);
  assert.equal(created.data.status, 'todo');
  assert.equal(created.data.priority, 'medium');
  assert.equal(created.data.due_on, null);

  const filtered = await fetch(`${app.baseUrl}/api/tasks?status=todo`).then((res) => res.json());
  assert.equal(filtered.data.length, 1);
});

test('tracks completion timestamps and clears them when reopened', async () => {
  const created = await fetch(`${app.baseUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Finish feature', status: 'done', priority: 'high' })
  }).then((res) => res.json());
  assert.ok(created.data.completed_at);

  const reopened = await fetch(`${app.baseUrl}/api/tasks/${created.data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'in_progress' })
  }).then((res) => res.json());
  assert.equal(reopened.data.completed_at, null);
  assert.equal(reopened.data.status, 'in_progress');
});

test('rejects invalid task values and returns not found for missing records', async () => {
  const invalid = await fetch(`${app.baseUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Invalid priority', priority: 'urgent' })
  });
  assert.equal(invalid.status, 400);

  const missing = await fetch(`${app.baseUrl}/api/tasks/9999`);
  assert.equal(missing.status, 404);
});
