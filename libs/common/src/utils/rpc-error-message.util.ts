export function extractRpcErrorMessage(
  error: unknown,
  fallback: string,
): string | string[] {
  if (typeof error !== 'object' || error === null) {
    return fallback;
  }

  const { message, code } = error as { message?: string | string[]; code?: string };

  if (Array.isArray(message) && message.length > 0) {
    return message;
  }

  if (typeof message === 'string' && message.length > 0) {
    return message;
  }

  if (typeof code === 'string' && code.length > 0) {
    return `${fallback} (${code})`;
  }

  return fallback;
}
