import { HTTPException } from 'hono/http-exception';
import type { ErrorResponse } from '../schemas/common';

/**
 * Base class for API errors that return the standard error format
 */
export class ApiError extends HTTPException {
  public readonly errorResponse: ErrorResponse;

  constructor(status: 400 | 401 | 403 | 404 | 422 | 500, messages: string[]) {
    super(status);
    this.errorResponse = {
      hasErrors: true,
      errorDescription: messages,
    };
  }

  getResponse(): Response {
    return new Response(JSON.stringify(this.errorResponse), {
      status: this.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * Invalid session error (401)
 */
export class InvalidSessionError extends ApiError {
  constructor(message = 'Session Id Invalido') {
    super(401, [message]);
  }
}

/**
 * Validation error (422)
 */
export class ValidationError extends ApiError {
  constructor(messages: string[]) {
    super(422, messages);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string | number) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(404, [message]);
  }
}

/**
 * Bad request error (400)
 */
export class BadRequestError extends ApiError {
  constructor(message: string) {
    super(400, [message]);
  }
}

/**
 * Missing data error (400)
 */
export class MissingDataError extends ApiError {
  constructor(message = 'Faltan Datos') {
    super(400, [message]);
  }
}

/**
 * Database error (500)
 */
export class DatabaseError extends ApiError {
  constructor(message: string) {
    super(500, [message]);
  }
}

/**
 * Login failed error (401)
 */
export class LoginFailedError extends ApiError {
  constructor(message = 'No se encontro usuario para hacer Login') {
    super(401, [message]);
  }
}

/**
 * Generic internal server error (500)
 */
export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(500, [message]);
  }
}
