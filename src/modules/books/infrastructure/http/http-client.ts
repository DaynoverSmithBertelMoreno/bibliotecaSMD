import { ApiError } from '../../domain/api-error';

export type HttpClient = {
  get<T>(path: string, params?: Record<string, unknown>): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  del(path: string): Promise<void>;
  upload<T>(path: string, file: File): Promise<T>;
};

/** Inyecta el token de sesión si está almacenado en localStorage. */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('smd_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Sin cabeceras de autenticación cuando no hay sesión (SPEC §4). */
export function createHttpClient(baseUrl: string): HttpClient {
  async function request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, init);

    if (response.status === 204) return undefined as T;

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ApiError(
        response.status,
        payload.message ?? 'La operación no se pudo completar',
        payload.details ?? [],
      );
    }
    return payload as T;
  }

  const json = { 'Content-Type': 'application/json' };

  return {
    get: (path, params) => {
      const query = new URLSearchParams();
      Object.entries(params ?? {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
      });
      const suffix = query.toString() ? `?${query}` : '';
      return request(`${path}${suffix}`, { method: 'GET', headers: getAuthHeaders() });
    },
    post: (path, body) =>
      request(path, {
        method: 'POST',
        headers: { ...getAuthHeaders(), ...(body === undefined ? {} : json) },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    patch: (path, body) =>
      request(path, { method: 'PATCH', headers: { ...getAuthHeaders(), ...json }, body: JSON.stringify(body) }),
    put: (path, body) =>
      request(path, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), ...(body === undefined ? {} : json) },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    del: (path) => request(path, { method: 'DELETE', headers: getAuthHeaders() }),
    upload: (path, file) => {
      const form = new FormData();
      form.append('file', file);
      return request(path, { method: 'POST', headers: getAuthHeaders(), body: form });
    },
  };
}
