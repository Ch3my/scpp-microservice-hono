import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { corsConfig } from './config/cors';
import { requestId } from './middleware/request-id';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/error-handler';
import {
  authRouter,
  documentosRouter,
  categoriasRouter,
  dashboardRouter,
  assetsRouter,
  foodRouter,
} from './routes';
import type { AppEnv } from './types/context';

/**
 * Create and configure the Hono application
 */
export function createApp(): OpenAPIHono<AppEnv> {
  const app = new OpenAPIHono<AppEnv>();

  // ============== MIDDLEWARE ==============

  // Request ID injection (must be first)
  app.use('*', requestId);

  // CORS
  app.use('*', cors(corsConfig));

  // Request logging
  app.use('*', requestLogger);

  // ============== HEALTH CHECK ==============

  app.get('/', (c) => c.text('It Works!'));

  // ============== ROUTES ==============

  // Auth routes
  app.route('/', authRouter);

  // Documentos routes
  app.route('/', documentosRouter);

  // Categorias routes
  app.route('/', categoriasRouter);

  // Dashboard routes
  app.route('/', dashboardRouter);

  // Assets routes
  app.route('/', assetsRouter);

  // Food routes (with /food prefix)
  app.route('/food', foodRouter);

  // ============== OPENAPI DOCUMENTATION ==============

  app.doc('/openapi.json', {
    openapi: '3.0.0',
    info: {
      title: 'SCPP API',
      version: '2.0.0',
      description: 'SCPP Microservice API - Financial management and inventory tracking',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  });

  // Swagger UI (optional - simple HTML redirect)
  app.get('/docs', (c) => {
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SCPP API Documentation</title>
          <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
          <script>
            window.onload = () => {
              SwaggerUIBundle({
                url: '/openapi.json',
                dom_id: '#swagger-ui',
              });
            };
          </script>
        </body>
      </html>
    `);
  });

  // ============== ERROR HANDLER ==============

  app.onError(errorHandler);

  // ============== 404 HANDLER ==============

  app.notFound((c) => {
    return c.json(
      {
        hasErrors: true,
        errorDescription: [`Route ${c.req.method} ${c.req.path} not found`],
      },
      404
    );
  });

  return app;
}
