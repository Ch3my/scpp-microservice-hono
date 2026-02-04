import { createApp } from './app';
import { env } from './config/env';
import { closePool } from './db/client';

const app = createApp();

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    SCPP Microservice                       ║
║                    Hono + Bun + MariaDB                    ║
╠═══════════════════════════════════════════════════════════╣
║  Server:     http://localhost:${env.PORT.toString().padEnd(25)}║
║  API Docs:   http://localhost:${env.PORT}/docs${' '.repeat(20)}║
║  OpenAPI:    http://localhost:${env.PORT}/openapi.json${' '.repeat(12)}║
╚═══════════════════════════════════════════════════════════╝
`);

// Graceful shutdown handler
const shutdown = async () => {
  console.log('\nShutting down gracefully...');
  await closePool();
  console.log('Server closed');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start Bun server
const server = Bun.serve({
  fetch: app.fetch,
  port: env.PORT,
});

console.log(`Server running on http://localhost:${server.port}`);
