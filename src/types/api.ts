import type { SuccessResponse, ErrorResponse, LoginSuccessResponse } from '../schemas/common';

/**
 * Re-export schema types for convenience
 */
export type { SuccessResponse, ErrorResponse, LoginSuccessResponse };

/**
 * API response that can be either success or error
 */
export type ApiResponse<T = void> = T extends void
  ? SuccessResponse | ErrorResponse
  : T | ErrorResponse;

/**
 * Helper to create a success response
 */
export function createSuccessResponse(messages: string[]): SuccessResponse {
  return {
    success: true,
    successDescription: messages,
  };
}

/**
 * Helper to create a login success response
 */
export function createLoginSuccessResponse(
  messages: string[],
  sessionHash: string
): LoginSuccessResponse {
  return {
    success: true,
    successDescription: messages,
    sessionHash,
  };
}

/**
 * Helper to create an error response
 */
export function createErrorResponse(messages: string[]): ErrorResponse {
  return {
    hasErrors: true,
    errorDescription: messages,
  };
}
