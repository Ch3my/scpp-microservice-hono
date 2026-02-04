import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { sessionService } from '../services/session.service';
import { loginBodySchema, logoutBodySchema, checkSessionQuerySchema } from '../schemas/auth';
import { loginSuccessResponseSchema, successResponseSchema } from '../schemas/common';
import { LoginFailedError, InvalidSessionError } from '../errors/http';
import type { AppEnv } from '../types/context';

export const authRouter = new OpenAPIHono<AppEnv>();

// ============== Route Definitions ==============

const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': { schema: loginBodySchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: loginSuccessResponseSchema } },
      description: 'Login successful',
    },
  },
});

const logoutRoute = createRoute({
  method: 'post',
  path: '/logout',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': { schema: logoutBodySchema },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: successResponseSchema } },
      description: 'Logout successful',
    },
  },
});

const checkSessionRoute = createRoute({
  method: 'get',
  path: '/check-session',
  tags: ['Auth'],
  request: {
    query: checkSessionQuerySchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: successResponseSchema } },
      description: 'Session is valid',
    },
  },
});

// ============== Route Handlers ==============

authRouter.openapi(loginRoute, async (c) => {
  const { username, password } = c.req.valid('json');

  const user = await sessionService.authenticateUser(username, password);

  if (!user) {
    throw new LoginFailedError();
  }

  const sessionHash = await sessionService.create(user.id);

  return c.json({
    success: true as const,
    successDescription: ['Login successful'],
    sessionHash,
  });
});

authRouter.openapi(logoutRoute, async (c) => {
  const { sessionHash } = c.req.valid('json');

  await sessionService.delete(sessionHash);

  return c.json({
    success: true as const,
    successDescription: ['Logout successful'],
  });
});

authRouter.openapi(checkSessionRoute, async (c) => {
  const { sessionHash } = c.req.valid('query');

  const isValid = await sessionService.validate(sessionHash);

  if (!isValid) {
    throw new InvalidSessionError();
  }

  return c.json({
    success: true as const,
    successDescription: ['Session is valid'],
  });
});
