/**
 * A non-2xx answer from the Tokens Studio REST API. Keeps the HTTP status and the
 * error code from the body so callers can tell a lapsed sign-in (401) or a
 * variables project (403 variables_source_of_truth) from other failures.
 */
export class StudioApiError extends Error {
  status: number;

  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'StudioApiError';
    this.status = status;
    this.code = code;
  }
}

export async function studioApiErrorFromResponse(res: Response, fallbackMessage: string): Promise<StudioApiError> {
  let errorData: { code?: string; error?: string } = {};
  try {
    errorData = await res.json();
  } catch (e) {
    // ignore parsing error
  }
  // res.statusText is often empty (HTTP/2 sends no reason phrase), so always include the status code.
  const message = errorData.error || `${fallbackMessage} (${res.status}${res.statusText ? ` ${res.statusText}` : ''})`;
  return new StudioApiError(message, res.status, errorData.code);
}
