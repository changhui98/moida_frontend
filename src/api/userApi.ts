import type {
  PageResponse,
  UserDetailResponse,
  UserResponse,
  UserUpdateRequest,
} from '../types/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

const createAuthHeaders = (token: string) => {
  if (!token.trim()) {
    throw new Error('로그인이 필요합니다.')
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: token.trim(),
  }

  return headers
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      text || `Request failed: ${response.status} ${response.statusText}`,
    )
  }

  return response.json() as Promise<T>
}

export const getUsers = (token: string, page = 0, size = 10) => {
  return fetch(`${API_BASE_URL}/users?page=${page}&size=${size}`, {
    headers: createAuthHeaders(token),
  }).then((response) => parseResponse<PageResponse<UserResponse>>(response))
}

export const getMyProfile = (token: string) => {
  return fetch(`${API_BASE_URL}/users/me`, {
    headers: createAuthHeaders(token),
  }).then((response) => parseResponse<UserDetailResponse>(response))
}

export const updateMyProfile = (token: string, body: UserUpdateRequest) => {
  return fetch(`${API_BASE_URL}/users/me`, {
    method: 'PATCH',
    headers: createAuthHeaders(token),
    body: JSON.stringify(body),
  }).then((response) => parseResponse<UserDetailResponse>(response))
}
