import type { PageResponse, UserDetailResponse, UserResponse } from '../types/user'
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

export const getAdminUsers = (
  token: string,
  page = 0,
  size = 10,
): Promise<PageResponse<UserResponse>> => {
  return fetch(`${API_BASE_URL}/admin/users?page=${page}&size=${size}`, {
    headers: createAuthHeaders(token),
  }).then((response) => parseResponse<PageResponse<UserResponse>>(response))
}

export const deleteAdminUser = (
  token: string,
  username: string,
): Promise<void> => {
  return fetch(`${API_BASE_URL}/admin/users/${username}`, {
    method: 'DELETE',
    headers: createAuthHeaders(token),
  }).then(async (response) => {
    if (!response.ok) {
      const text = await response.text()
      throw new ApiError(
        response.status,
        text || `Request failed: ${response.status} ${response.statusText}`,
      )
    }
  })
}

export const getAdminUserDetail = (
  token: string,
  username: string,
): Promise<UserDetailResponse> => {
  return fetch(`${API_BASE_URL}/admin/users/${username}`, {
    headers: createAuthHeaders(token),
  }).then((response) => parseResponse<UserDetailResponse>(response))
}
