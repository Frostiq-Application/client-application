import { AxiosError } from "axios";
import { ERROR_MESSAGES } from "@/constants/error.constants";
import type { NormalizedError } from "@/types/api.types";

interface BackendErrorBody {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

/**
 * Turn any thrown value (axios error, network failure, unknown) into a
 * predictable NormalizedError the UI can render.
 */
export function normalizeError(err: unknown): NormalizedError {
  if (err instanceof AxiosError) {
    // No response = network/offline/timeout.
    if (!err.response) {
      const isTimeout = err.code === "ECONNABORTED";
      return {
        status: 0,
        message: isTimeout ? ERROR_MESSAGES.TIMEOUT : ERROR_MESSAGES.NETWORK,
      };
    }

    const status = err.response.status;
    const body = err.response.data as BackendErrorBody | undefined;
    const raw = body?.message;
    const message = Array.isArray(raw) ? raw[0] : raw;

    return {
      status,
      message: message ?? statusFallback(status),
    };
  }

  if (err instanceof Error) {
    return { status: 0, message: err.message || ERROR_MESSAGES.GENERIC };
  }

  return { status: 0, message: ERROR_MESSAGES.GENERIC };
}

function statusFallback(status: number): string {
  switch (status) {
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 422:
      return ERROR_MESSAGES.VALIDATION;
    default:
      return status >= 500 ? ERROR_MESSAGES.SERVER : ERROR_MESSAGES.GENERIC;
  }
}
