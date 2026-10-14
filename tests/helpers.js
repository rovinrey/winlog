import { createServer } from 'node:http';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { createDatabase } from '../src/config/database.js';

export async function startTestServer() {
  const db = createDatabase(':memory:');
  const server = createServer(createApp({ db }));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();

  return {
    db,
    baseUrl: `http://127.0.0.1:${address.port}`,
    async close() {
      server.close();
      await once(server, 'close');
      db.close();
    }
  };
}
