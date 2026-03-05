export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  const authToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const method = (options.method || 'GET').toUpperCase();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  // Only set JSON content-type when sending a body.
  if (options.body != null && headers['Content-Type'] == null) {
    headers['Content-Type'] = 'application/json';
  }

  if (authToken && headers.Authorization == null) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  // Debug logging (helps diagnose CORS/network vs backend errors)
  console.debug('[fetchApi]', method, url);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (e) {
    console.error('[fetchApi] Network error', { method, url, error: e });
    throw new Error('Network error: Failed to reach API (check backend is running and CORS is allowed).');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      (errorData as any).message ||
      (errorData as any).error ||
      `HTTP error! status: ${response.status}`;
    console.error('[fetchApi] HTTP error', { method, url, status: response.status, errorData });
    throw new Error(message);
  }

  return response.json();
};
