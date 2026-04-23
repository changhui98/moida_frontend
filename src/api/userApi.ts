import type {
  PageResponse,
  UserDetailResponse,
  UserResponse,
  UserUpdateRequest,
} from '../types/user'
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

export const getUserProfile = (token: string, username: string) => {
  return fetch(`${API_BASE_URL}/users/${encodeURIComponent(username)}`, {
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
