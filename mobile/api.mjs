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

function applicationsPath(userId) {
  return `/api/users/${encodeURIComponent(userId)}/applications`;
}

function normalizeApplication(application) {
  const jobDescription = typeof application.jobDescription === 'string' ? application.jobDescription.trim() : '';
  return {
    _id: application._id,
    jobTitle: typeof application.jobTitle === 'string' && application.jobTitle.trim()
      ? application.jobTitle.trim()
      : 'Untitled application',
    company: typeof application.company === 'string' ? application.company : '',
    status: typeof application.status === 'string' ? application.status.trim().toLowerCase() : '',
    hasJobDescription: Boolean(jobDescription) || application.hasJobDescription === true,
  };
}

export async function listApplications(userId, token) {
  const applications = await request(applicationsPath(userId), { token });
  if (!Array.isArray(applications) || applications.some(application => typeof application?._id !== 'string')) {
    throw new ApiError('The server did not return your saved applications.');
  }

  return applications.map(normalizeApplication);
}

export async function createApplication(userId, token, body) {
  const application = await request(applicationsPath(userId), { token, body });
  if (typeof application._id !== 'string') throw new ApiError('The server did not confirm the application.');
  return normalizeApplication(application);
}

function interviewsPath(userId, interviewId) {
  const path = `/api/users/${encodeURIComponent(userId)}/interviews`;
  return interviewId ? `${path}/${encodeURIComponent(interviewId)}` : path;
}

function isInterview(value) {
  return typeof value?._id === 'string'
    && ['company', 'role', 'type', 'startsAt'].every(key => typeof value[key] === 'string')
    && Number.isFinite(Date.parse(value.startsAt));
}

export async function listInterviews(userId, token) {
  const interviews = await request(interviewsPath(userId), { token });
  if (!Array.isArray(interviews) || !interviews.every(isInterview)) {
    throw new ApiError('The server did not return your interviews.');
  }
  return interviews;
}

export async function saveInterview(userId, token, body, interviewId) {
  const interview = await request(interviewsPath(userId, interviewId), {
    token, body, method: interviewId ? 'PUT' : 'POST',
  });
  if (!isInterview(interview)) throw new ApiError('The server did not confirm the interview.');
  return interview;
}

export function deleteInterview(userId, token, interviewId) {
  return request(interviewsPath(userId, interviewId), { token, method: 'DELETE' });
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
