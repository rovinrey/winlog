import { createServer } from 'node:http';
import { createApp } from './app.js';
import { createDatabase } from './config/database.js';

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

const db = createDatabase();
const server = createServer(createApp({ db }));

server.listen(port, host, () => {
  console.log(`WinLog is available at http://${host}:${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down WinLog`);
  server.close((error) => {
    db.close();
    if (error) {
      console.error('Error while closing HTTP server:', error);
      process.exitCode = 1;
    }
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
