const apiUrl = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!apiUrl) {
    throw new Error('VITE_API_URL is not set');
  }

  const isForm = init.body instanceof FormData;
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(isForm || !init.body ? {} : { 'Content-Type': 'application/json' }),
      ...init.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? (JSON.parse(text) as { error?: string }) : null;

  if (!response.ok) {
    throw new ApiError(response.status, data?.error ?? `Request failed (${response.status}).`);
  }

  return data as T;
}

export async function downloadDocument(id: string, filename: string): Promise<void> {
  if (!apiUrl) {
    throw new Error('VITE_API_URL is not set');
  }

  const response = await fetch(`${apiUrl}/api/documents/${id}/file`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'Could not download the file.');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
