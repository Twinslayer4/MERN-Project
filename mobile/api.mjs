const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
export const hasApi = Boolean(baseUrl);

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.status = status;
  }
}

async function request(path, { body, token } = {}) {
  if (!hasApi) throw new ApiError('Set EXPO_PUBLIC_API_URL to connect to your account.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const headers = { Accept: 'application/json' };
    if (body) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${baseUrl}${path}`, {
      method: body ? 'POST' : 'GET',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const message = typeof data?.error === 'string' ? data.error : `The server returned ${response.status}.`;
      throw new ApiError(message, response.status);
    }
    if (!data || typeof data !== 'object') throw new ApiError('The server returned an unexpected response.');
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Could not reach Nextstep. Check the API address and your connection.');
  } finally {
    clearTimeout(timeout);
  }
}

export async function authenticate(mode, body) {
  const result = await request(mode === 'register' ? '/api/users' : '/api/auth/login', { body });
  if (typeof result.token !== 'string' || !result.token || typeof result.user?._id !== 'string') {
    throw new ApiError('The server did not return a complete session.');
  }
  return { token: result.token, user: result.user };
}

export function getProfile(userId, token) {
  return request(`/api/users/${encodeURIComponent(userId)}`, { token });
}
