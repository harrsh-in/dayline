const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!apiBaseUrl) {
  throw new Error('Missing VITE_API_BASE_URL');
}

export const api = {
  baseUrl: apiBaseUrl,

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`GET ${path} failed with ${response.status}`);
    }

    return response.json() as Promise<T>;
  },

  async post<T>(path: string): Promise<T> {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`POST ${path} failed with ${response.status}`);
    }

    return response.json() as Promise<T>;
  },
};
