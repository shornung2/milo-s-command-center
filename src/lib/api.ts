// Milo Dashboard API Client
// Communicates with the Openclaw backend

const BASE_URL = import.meta.env.VITE_DASHBOARD_API_URL || 'http://localhost:3000';
const TOKEN = import.meta.env.VITE_DASHBOARD_TOKEN || '';

// ── Types ──────────────────────────────────────────────

export type AgentId = 'milo' | 'analyst' | 'author' | 'comms' | 'docs' | 'researcher';

export interface TaskData {
  title: string;
  description?: string;
  column?: string;
  assignedTo?: AgentId;
  priority?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  column?: string;
  priority?: string;
  status?: string;
}

export interface NoteData {
  title: string;
  content: string;
  tags?: string[];
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  tags?: string[];
}

export type ApiSuccess<T = Record<string, unknown>> = { ok: true } & T;
export type ApiError = { ok: false; error: string };
export type ApiResponse<T = Record<string, unknown>> = ApiSuccess<T> | ApiError;

// ── Fetch helper ───────────────────────────────────────

async function request<T = Record<string, unknown>>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
        ...options.headers,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data?.error || `Request failed (${res.status})` };
    }

    return { ok: true, ...data } as ApiSuccess<T>;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ── API methods ────────────────────────────────────────

export const api = {
  // Dashboard
  getDashboard: () => request('/api/dashboard'),

  // Tasks
  getTasks: (column?: string, assignedTo?: AgentId) => {
    const params = new URLSearchParams();
    if (column) params.set('column', column);
    if (assignedTo) params.set('assignedTo', assignedTo);
    const qs = params.toString();
    return request(`/api/tasks${qs ? `?${qs}` : ''}`);
  },

  createTask: (taskData: TaskData) =>
    request('/api/tasks', { method: 'POST', body: JSON.stringify(taskData) }),

  updateTask: (taskId: string, updates: TaskUpdate) =>
    request(`/api/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(updates) }),

  assignTask: (taskId: string, agentId: AgentId, instructions?: string) =>
    request(`/api/tasks/${taskId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ agentId, instructions }),
    }),

  addTaskComment: (taskId: string, text: string) =>
    request(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  // Notes
  getNotes: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/api/notes${qs}`);
  },

  createNote: (noteData: NoteData) =>
    request('/api/notes', { method: 'POST', body: JSON.stringify(noteData) }),

  updateNote: (noteId: string, updates: NoteUpdate) =>
    request(`/api/notes/${noteId}`, { method: 'PATCH', body: JSON.stringify(updates) }),

  deleteNote: (noteId: string) =>
    request(`/api/notes/${noteId}`, { method: 'DELETE' }),

  // Search & Analytics
  search: (query: string, sources: string[], limit?: number) => {
    const params = new URLSearchParams({ query });
    sources.forEach((s) => params.append('sources', s));
    if (limit) params.set('limit', String(limit));
    return request(`/api/search?${params.toString()}`);
  },

  getAgentAnalytics: (agentId: AgentId) =>
    request(`/api/agents/${agentId}/analytics`),

  recordAgentTask: (agentId: AgentId, taskId: string, status: string, duration: number) =>
    request(`/api/agents/${agentId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ taskId, status, duration }),
    }),

  // Activity
  getSessions: (limit?: number) => {
    const qs = limit ? `?limit=${limit}` : '';
    return request(`/api/sessions${qs}`);
  },

  getActivity: (limit?: number) => {
    const qs = limit ? `?limit=${limit}` : '';
    return request(`/api/activity${qs}`);
  },
};
