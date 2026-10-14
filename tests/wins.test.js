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

test('creates a win and returns it in the list', async () => {
  const response = await fetch(`${app.baseUrl}/api/wins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Went for a walk', notes: 'Even though it rained', won_on: '2026-10-13' })
  });
  const created = await response.json();

  assert.equal(response.status, 201);
  assert.equal(created.data.title, 'Went for a walk');
  assert.ok(created.data.created_at);

  const listed = await fetch(`${app.baseUrl}/api/wins?from=2026-10-13`).then((res) => res.json());
  assert.equal(listed.data.length, 1);
  assert.equal(listed.data[0].id, created.data.id);
});

test('rejects invalid dates and unknown input fields', async () => {
  const invalidDate = await fetch(`${app.baseUrl}/api/wins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Bad date', won_on: '2026-02-30' })
  });
  assert.equal(invalidDate.status, 400);

  const extraField = await fetch(`${app.baseUrl}/api/wins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'No extras', won_on: '2026-10-13', isAdmin: true })
  });
  assert.equal(extraField.status, 400);
});

test('updates and deletes a win', async () => {
  const created = await fetch(`${app.baseUrl}/api/wins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'First title', won_on: '2026-10-12' })
  }).then((res) => res.json());

  const updated = await fetch(`${app.baseUrl}/api/wins/${created.data.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Updated title' })
  }).then((res) => res.json());
  assert.equal(updated.data.title, 'Updated title');

  const deleted = await fetch(`${app.baseUrl}/api/wins/${created.data.id}`, { method: 'DELETE' });
  assert.equal(deleted.status, 204);
});
