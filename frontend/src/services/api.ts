import axios from 'axios'

import type { ApplicationResponse, ApplicationSummary, AuthUser } from '../types/index'

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
})

export async function login(username: string, password: string): Promise<AuthUser> {
  const { data } = await api.post<AuthUser>('/api/auth/login', { username, password })
  return data
}

export async function logout(): Promise<void> {
  await api.post('/api/auth/logout')
}

export async function uploadApplication(
  userId: number,
  file: File,
): Promise<ApplicationResponse> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await axios.post<ApplicationResponse>(
    `/api/applications/upload?user_id=${userId}`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data
}

export async function getMyApplication(userId: number): Promise<ApplicationResponse> {
  const { data } = await api.get<ApplicationResponse>('/api/applications/mine', {
    params: { user_id: userId },
  })
  return data
}

export async function getMyApplicationHistory(userId: number): Promise<ApplicationSummary[]> {
  const { data } = await api.get<ApplicationSummary[]>('/api/applications/mine/history', {
    params: { user_id: userId },
  })
  return data
}

export async function listApplications(
  userId: number,
  statusFilter?: string,
): Promise<ApplicationSummary[]> {
  const { data } = await api.get<ApplicationSummary[]>('/api/applications', {
    params: { user_id: userId, status_filter: statusFilter },
  })
  return data
}

export async function getApplication(
  userId: number,
  appId: number,
): Promise<ApplicationResponse> {
  const { data } = await api.get<ApplicationResponse>(`/api/applications/${appId}`, {
    params: { user_id: userId },
  })
  return data
}

export async function correctApplication(
  userId: number,
  appId: number,
  corrections: Record<string, unknown>,
): Promise<ApplicationResponse> {
  const { data } = await api.patch<ApplicationResponse>(
    `/api/applications/${appId}/correct`,
    corrections,
    { params: { user_id: userId } },
  )
  return data
}

export async function submitApplication(
  userId: number,
  appId: number,
): Promise<ApplicationResponse> {
  const { data } = await api.post<ApplicationResponse>(
    `/api/applications/${appId}/submit`,
    {},
    { params: { user_id: userId } },
  )
  return data
}

export async function deleteApplication(userId: number, appId: number): Promise<void> {
  await api.delete(`/api/applications/${appId}`, { params: { user_id: userId } })
}

export async function approveApplication(
  userId: number,
  appId: number,
  remarks?: string,
): Promise<ApplicationResponse> {
  const { data } = await api.post<ApplicationResponse>(
    `/api/applications/${appId}/approve`,
    { remarks },
    { params: { user_id: userId } },
  )
  return data
}

export async function rejectApplication(
  userId: number,
  appId: number,
  remarks: string,
): Promise<ApplicationResponse> {
  const { data } = await api.post<ApplicationResponse>(
    `/api/applications/${appId}/reject`,
    { remarks },
    { params: { user_id: userId } },
  )
  return data
}

export async function escalateApplication(
  userId: number,
  appId: number,
  escalation_reason: string,
  escalation_remarks: string,
): Promise<ApplicationResponse> {
  const { data } = await api.post<ApplicationResponse>(
    `/api/applications/${appId}/escalate`,
    { escalation_reason, escalation_remarks },
    { params: { user_id: userId } },
  )
  return data
}

export default api
