import { AuthResponse, Analysis } from './types.js';

const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('skill_gap_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Registration failed' }));
    throw new Error(err.error || 'Registration failed');
  }
  return res.json();
}

export async function runAnalysis(
  jobTitle: string,
  resumeText: string,
  jdText: string,
  resumeFile?: { data: string; mimeType: string }
): Promise<Analysis> {
  const res = await fetch(`${API_BASE}/analyses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ jobTitle, resumeText, jdText, resumeFile }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
    throw new Error(err.error || 'Analysis failed');
  }
  return res.json();
}

export async function getHistory(): Promise<Analysis[]> {
  const res = await fetch(`${API_BASE}/analyses`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to retrieve analysis history');
  }
  return res.json();
}

export async function getAnalysisDetail(id: string): Promise<Analysis> {
  const res = await fetch(`${API_BASE}/analyses/${id}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to retrieve analysis details');
  }
  return res.json();
}

export async function explainPriority(
  skillName: string,
  jobTitle: string,
  priority: string,
  reasonContext: string
): Promise<{ explanation: string }> {
  const res = await fetch(`${API_BASE}/explain-priority`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ skillName, jobTitle, priority, reasonContext }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to generate explanation' }));
    throw new Error(err.error || 'Failed to generate explanation');
  }
  return res.json();
}

