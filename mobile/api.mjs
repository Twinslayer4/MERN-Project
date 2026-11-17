const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
export const hasApi = Boolean(baseUrl);

const suggestionsPath = process.env.EXPO_PUBLIC_SUGGESTIONS_PATH?.trim();
export const hasSuggestionsApi = hasApi && Boolean(suggestionsPath?.startsWith('/api/'));

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.status = status;
  }
}

async function request(path, {
  body, token, method = body ? 'POST' : 'GET', upload, timeoutMs = upload ? 60000 : 12000,
} = {}) {
  if (!hasApi) throw new ApiError('Set EXPO_PUBLIC_API_URL to connect to your account.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers = { Accept: 'application/json' };
    let payload;
    let send = fetch;
    if (upload) {
      const expo = await import('expo/fetch');
      send = expo.fetch;
      headers['Content-Type'] = 'application/pdf';
      headers['X-Resume-Filename'] = encodeURIComponent(upload.name);
      payload = upload.file;
    } else if (body) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await send(`${baseUrl}${path}`, {
      method,
      headers,
      body: payload,
      signal: controller.signal,
    });
    if (response.status === 204 && method === 'DELETE') return;
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

function resumesPath(userId) {
  return `/api/users/${encodeURIComponent(userId)}/resumes`;
}

export async function listResumes(userId, token) {
  const { resumes } = await request(resumesPath(userId), { token });
  if (!Array.isArray(resumes)) throw new ApiError('The server did not return your resume list.');
  return resumes;
}

export async function uploadResume(userId, token, name, file) {
  const { resume } = await request(resumesPath(userId), { token, method: 'POST', upload: { name, file } });
  if (typeof resume?._id !== 'string') throw new ApiError('The server did not confirm the upload.');
  return resume;
}

export function deleteResume(userId, token, resumeId) {
  return request(`${resumesPath(userId)}/${encodeURIComponent(resumeId)}`, { token, method: 'DELETE' });
}

export async function listApplications(userId, token) {
  const applications = await request(`/api/users/${encodeURIComponent(userId)}/applications`, { token });
  if (!Array.isArray(applications) || applications.some(application => typeof application?._id !== 'string')) {
    throw new ApiError('The server did not return your saved applications.');
  }

  return applications.map(application => {
    const jobDescription = typeof application.jobDescription === 'string' ? application.jobDescription.trim() : '';
    return {
      _id: application._id,
      jobTitle: typeof application.jobTitle === 'string' && application.jobTitle.trim()
        ? application.jobTitle.trim()
        : 'Untitled application',
      company: typeof application.company === 'string' ? application.company : '',
      hasJobDescription: Boolean(jobDescription) || application.hasJobDescription === true,
    };
  });
}

export async function generateSuggestions(userId, token, resumeId, applicationIds) {
  if (!hasSuggestionsApi) throw new ApiError('Live suggestions are unavailable.');

  const path = suggestionsPath.replaceAll(':userId', encodeURIComponent(userId));
  const { suggestions } = await request(path, { token, body: { resumeId, applicationIds }, timeoutMs: 60000 });
  if (!Array.isArray(suggestions) || suggestions.some(suggestion => (
    typeof suggestion?.category !== 'string' || typeof suggestion.title !== 'string'
    || typeof suggestion.rationale !== 'string' || !Array.isArray(suggestion.nextSteps)
    || suggestion.nextSteps.some(step => typeof step !== 'string')
  ))) {
    throw new ApiError('The server did not return usable suggestions.');
  }

  return suggestions;
}
