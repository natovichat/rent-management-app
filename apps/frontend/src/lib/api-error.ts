import { AxiosError } from 'axios';

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
};

/**
 * Extracts a user-facing message from an axios/API error (NestJS validation, BadRequest, etc.).
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error == null) return fallback;
  const ax = error as AxiosError<ApiErrorBody>;
  const data = ax.response?.data;
  if (data?.message != null) {
    const msg = data.message;
    if (Array.isArray(msg)) {
      const joined = msg.filter(Boolean).join('. ');
      if (joined.trim()) return joined;
    } else if (typeof msg === 'string' && msg.trim()) {
      return msg;
    }
  }
  if (typeof ax.message === 'string' && ax.message.trim() && ax.message !== 'Network Error') {
    return ax.message;
  }
  return fallback;
}
