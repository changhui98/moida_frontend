import type { PageResponse } from '../types/user'
import type {
  GroupCreateRequest,
  GroupDetailResponse,
  GroupMemberResponse,
  GroupResponse,
} from '../types/group'
import { ApiError } from './ApiError'
import { API_BASE_URL } from './config'

const createAuthHeaders = (token: string): HeadersInit => {
  if (!token.trim()) {
    throw new ApiError(401, '로그인이 필요합니다.')
  }

  return {
    'Content-Type': 'application/json',
    Authorization: token.trim(),
  }
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const text = await response.text()
    throw new ApiError(
      response.status,
      text || `Request failed: ${response.status} ${response.statusText}`,
    )
  }

  return response.json() as Promise<T>
}

export const getGroups = (
  token: string,
  page = 0,
  size = 10,
  keyword?: string,
  category?: string,
): Promise<PageResponse<GroupResponse>> => {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (keyword && keyword.trim()) params.set('keyword', keyword.trim())
  if (category) params.set('category', category)
  return fetch(`${API_BASE_URL}/groups?${params.toString()}`, {
    headers: createAuthHeaders(token),
  }).then((res) => parseResponse<PageResponse<GroupResponse>>(res))
}

export const getGroup = (
  token: string,
  groupId: number,
): Promise<GroupDetailResponse> => {
  return fetch(`${API_BASE_URL}/groups/${groupId}`, {
    headers: createAuthHeaders(token),
  }).then((res) => parseResponse<GroupDetailResponse>(res))
}

export const createGroup = (
  token: string,
  data: GroupCreateRequest,
): Promise<GroupResponse> => {
  return fetch(`${API_BASE_URL}/groups`, {
    method: 'POST',
    headers: createAuthHeaders(token),
    body: JSON.stringify(data),
  }).then((res) => parseResponse<GroupResponse>(res))
}

export const updateGroup = (
  token: string,
  groupId: number,
  data: Partial<GroupCreateRequest>,
): Promise<GroupResponse> => {
  return fetch(`${API_BASE_URL}/groups/${groupId}`, {
    method: 'PATCH',
    headers: createAuthHeaders(token),
    body: JSON.stringify(data),
  }).then((res) => parseResponse<GroupResponse>(res))
}

export const deleteGroup = (token: string, groupId: number): Promise<void> => {
  return fetch(`${API_BASE_URL}/groups/${groupId}`, {
    method: 'DELETE',
    headers: createAuthHeaders(token),
  }).then((res) => {
    if (!res.ok) {
      return res.text().then((text) => {
        throw new ApiError(res.status, text || `Request failed: ${res.status}`)
      })
    }
  })
}

export const joinGroup = (token: string, groupId: number): Promise<void> => {
  return fetch(`${API_BASE_URL}/groups/${groupId}/join`, {
    method: 'POST',
    headers: createAuthHeaders(token),
  }).then((res) => {
    if (!res.ok) {
      return res.text().then((text) => {
        throw new ApiError(res.status, text || `Request failed: ${res.status}`)
      })
    }
  })
}

export const leaveGroup = (token: string, groupId: number): Promise<void> => {
  return fetch(`${API_BASE_URL}/groups/${groupId}/leave`, {
    method: 'DELETE',
    headers: createAuthHeaders(token),
  }).then((res) => {
    if (!res.ok) {
      return res.text().then((text) => {
        throw new ApiError(res.status, text || `Request failed: ${res.status}`)
      })
    }
  })
}

export const getGroupMembers = (
  token: string,
  groupId: number,
): Promise<GroupMemberResponse[]> => {
  return fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
    headers: createAuthHeaders(token),
  }).then((res) => parseResponse<GroupMemberResponse[]>(res))
}

export const getMyGroups = (
  token: string,
  page = 0,
  size = 10,
): Promise<PageResponse<GroupResponse>> => {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  return fetch(`${API_BASE_URL}/groups/me?${params.toString()}`, {
    headers: createAuthHeaders(token),
  }).then((res) => parseResponse<PageResponse<GroupResponse>>(res))
}

export const kickGroupMember = (
  token: string,
  groupId: number,
  username: string,
): Promise<void> => {
  return fetch(`${API_BASE_URL}/groups/${groupId}/members/${username}`, {
    method: 'DELETE',
    headers: createAuthHeaders(token),
  }).then((res) => {
    if (!res.ok) {
      return res.text().then((text) => {
        throw new ApiError(res.status, text || `Request failed: ${res.status}`)
      })
    }
  })
}
