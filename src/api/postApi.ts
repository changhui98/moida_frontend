import type { PageResponse } from '../types/user'
import type { ContentResponse } from '../types/post'
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

export const getPosts = (
  token: string,
  page = 0,
  size = 12,
  keyword = '',
  searchType: 'TITLE' | 'USERNAME' = 'TITLE',
): Promise<PageResponse<ContentResponse>> => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  })

  if (keyword.trim()) {
    params.set('keyword', keyword.trim())
    params.set('searchType', searchType)
  }

  return fetch(`${API_BASE_URL}/contents?${params.toString()}`, {
    headers: createAuthHeaders(token),
  }).then((response) => parseResponse<PageResponse<ContentResponse>>(response))
}
